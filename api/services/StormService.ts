import type {
  Team,
  HackTarget,
  DataStorm,
  StormParticipant,
  StormStatus,
  StolenData,
} from '../../shared/types'

const storms = new Map<string, DataStorm>()

export const StormService = {
  createStorm(initiatorTeam: Team, target: HackTarget): DataStorm {
    const teamPower = this.calculateTeamPower(initiatorTeam)
    if (teamPower < target.minPowerRequired) {
      throw new Error(`团队能力不足，需要 ${target.minPowerRequired}，当前 ${teamPower}`)
    }

    const stormId = `storm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const participant: StormParticipant = {
      teamId: initiatorTeam.id,
      teamName: initiatorTeam.name,
      contribution: 0,
      players: initiatorTeam.members.map((m) => m.playerId),
      rewardShare: 0,
    }

    const storm: DataStorm = {
      id: stormId,
      initiatorTeamId: initiatorTeam.id,
      initiatorTeamName: initiatorTeam.name,
      targetId: target.id,
      target,
      status: 'recruiting',
      participantTeams: [participant],
      startTime: new Date().toISOString(),
      totalDamage: 0,
    }

    storms.set(stormId, storm)
    return storm
  },

  calculateTeamPower(team: Team): number {
    const totalSkills = team.members.reduce(
      (sum, member) => sum + member.skills.cracking + member.skills.programming + member.skills.stealth,
      0
    )
    const memberBonus = team.members.length * 10
    const levelBonus = team.level * 20
    return Math.floor(totalSkills + memberBonus + levelBonus)
  },

  joinStorm(stormId: string, team: Team): StormParticipant {
    const storm = storms.get(stormId)
    if (!storm) {
      throw new Error('数据风暴不存在')
    }
    if (storm.status !== 'recruiting' && storm.status !== 'countdown') {
      throw new Error('数据风暴已开始或结束，无法加入')
    }

    const existing = storm.participantTeams.find((p) => p.teamId === team.id)
    if (existing) {
      throw new Error('团队已加入此数据风暴')
    }

    const teamPower = this.calculateTeamPower(team)
    if (teamPower < storm.target.minPowerRequired * 0.5) {
      throw new Error('团队能力不足以参与此数据风暴')
    }

    const participant: StormParticipant = {
      teamId: team.id,
      teamName: team.name,
      contribution: 0,
      players: team.members.map((m) => m.playerId),
      rewardShare: 0,
    }

    storm.participantTeams.push(participant)

    if (storm.participantTeams.length >= 3) {
      this.startCountdown(stormId)
    }

    return participant
  },

  leaveStorm(stormId: string, teamId: string): void {
    const storm = storms.get(stormId)
    if (!storm) {
      throw new Error('数据风暴不存在')
    }
    if (storm.status !== 'recruiting' && storm.status !== 'countdown') {
      throw new Error('数据风暴已开始，无法退出')
    }
    if (storm.initiatorTeamId === teamId) {
      throw new Error('发起团队不能退出数据风暴')
    }

    const index = storm.participantTeams.findIndex((p) => p.teamId === teamId)
    if (index === -1) {
      throw new Error('团队未加入此数据风暴')
    }

    storm.participantTeams.splice(index, 1)

    if (storm.participantTeams.length < 3 && storm.status === 'countdown') {
      storm.status = 'recruiting'
      storm.countdownEndTime = undefined
    }
  },

  startCountdown(stormId: string, countdownMs: number = 60000): void {
    const storm = storms.get(stormId)
    if (!storm) {
      throw new Error('数据风暴不存在')
    }
    if (storm.status !== 'recruiting') {
      throw new Error('只能在招募阶段开始倒计时')
    }
    if (storm.participantTeams.length < 2) {
      throw new Error('至少需要2个团队才能开始')
    }

    storm.status = 'countdown'
    storm.countdownEndTime = new Date(Date.now() + countdownMs).toISOString()
  },

  startStorm(stormId: string): void {
    const storm = storms.get(stormId)
    if (!storm) {
      throw new Error('数据风暴不存在')
    }
    if (storm.status !== 'countdown') {
      throw new Error('只能在倒计时阶段开始数据风暴')
    }

    const now = new Date()
    const countdownEnd = new Date(storm.countdownEndTime!)
    if (now < countdownEnd) {
      throw new Error('倒计时尚未结束')
    }

    storm.status = 'active'
    storm.startTime = now.toISOString()
  },

  getCountdownRemaining(stormId: string): number {
    const storm = storms.get(stormId)
    if (!storm || !storm.countdownEndTime) {
      return 0
    }
    const remaining = new Date(storm.countdownEndTime).getTime() - Date.now()
    return Math.max(0, remaining)
  },

  calculateContribution(
    stormId: string,
    teamId: string,
    team: Team,
    deltaTime: number
  ): number {
    const storm = storms.get(stormId)
    if (!storm) {
      throw new Error('数据风暴不存在')
    }
    if (storm.status !== 'active') {
      return 0
    }

    const participant = storm.participantTeams.find((p) => p.teamId === teamId)
    if (!participant) {
      throw new Error('团队未参与此数据风暴')
    }

    const teamPower = this.calculateTeamPower(team)
    const contributionRate = (deltaTime / 1000) * (teamPower / 100)
    const contribution = participant.contribution + contributionRate

    participant.contribution = contribution
    storm.totalDamage += contributionRate

    this.updateRewardShares(stormId)

    return contribution
  },

  updateRewardShares(stormId: string): void {
    const storm = storms.get(stormId)
    if (!storm) {
      return
    }

    const totalContribution = storm.participantTeams.reduce((sum, p) => sum + p.contribution, 0)
    if (totalContribution === 0) {
      return
    }

    const initiatorBonus = 0.1
    const remainingShare = 1 - initiatorBonus

    for (const participant of storm.participantTeams) {
      const baseShare = (participant.contribution / totalContribution) * remainingShare
      if (participant.teamId === storm.initiatorTeamId) {
        participant.rewardShare = baseShare + initiatorBonus
      } else {
        participant.rewardShare = baseShare
      }
    }
  },

  completeStorm(
    stormId: string,
    success: boolean
  ): {
    success: boolean
    totalRewards: number
    totalPoints: number
    data: StolenData[]
    shares: Array<{ teamId: string; teamName: string; credits: number; points: number; share: number }>
  } {
    const storm = storms.get(stormId)
    if (!storm) {
      throw new Error('数据风暴不存在')
    }
    if (storm.status !== 'active') {
      throw new Error('数据风暴未进行中')
    }

    storm.status = success ? 'completed' : 'failed'
    storm.endTime = new Date().toISOString()

    const target = storm.target
    const totalCredits = success
      ? Math.floor(
          (target.rewards.minCredits +
            Math.random() * (target.rewards.maxCredits - target.rewards.minCredits)) *
            storm.participantTeams.length *
            1.5
        )
      : 0
    const totalPoints = success ? target.rewards.points * storm.participantTeams.length : 0

    let data: StolenData[] = []
    if (success) {
      const dataCount = Math.floor(2 + Math.random() * 4)
      data = this.generateStormData(target, dataCount)
    }

    const shares = storm.participantTeams.map((p) => ({
      teamId: p.teamId,
      teamName: p.teamName,
      credits: Math.floor(totalCredits * p.rewardShare),
      points: Math.floor(totalPoints * p.rewardShare),
      share: p.rewardShare,
    }))

    return {
      success,
      totalRewards: totalCredits,
      totalPoints,
      data,
      shares,
    }
  },

  generateStormData(target: HackTarget, count: number): StolenData[] {
    const data: StolenData[] = []
    const rarities: Array<{ rarity: StolenData['rarity']; weight: number; multiplier: number }> = [
      { rarity: 'common', weight: 50, multiplier: 1 },
      { rarity: 'rare', weight: 30, multiplier: 2.5 },
      { rarity: 'epic', weight: 15, multiplier: 5 },
      { rarity: 'legendary', weight: 5, multiplier: 10 },
    ]

    const dataNames: Record<string, string[]> = {
      corporate: ['核心数据库', '高管邮件', '并购计划', '技术专利', '年度预算', '源代码'],
      government: ['绝密档案', '国家安全协议', '特工名单', '国防预算', '军事蓝图', '加密主密钥'],
    }

    for (let i = 0; i < count; i++) {
      const roll = Math.random() * 100
      let cumulative = 0
      let selectedRarity = rarities[0]
      for (const r of rarities) {
        cumulative += r.weight
        if (roll <= cumulative) {
          selectedRarity = r
          break
        }
      }

      const names = dataNames[target.type] || dataNames.corporate
      const dataType = target.rewards.dataTypes[Math.floor(Math.random() * target.rewards.dataTypes.length)]
      const name = names[Math.floor(Math.random() * names.length)]
      const baseValue = Math.floor(
        (target.rewards.minCredits + Math.random() * (target.rewards.maxCredits - target.rewards.minCredits)) *
          selectedRarity.multiplier *
          1.5
      )

      data.push({
        id: `storm_data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
        type: dataType,
        name,
        rarity: selectedRarity.rarity,
        baseValue,
        ownerId: '',
        createdAt: new Date().toISOString(),
      })
    }

    return data
  },

  getStorm(stormId: string): DataStorm | undefined {
    return storms.get(stormId)
  },

  getActiveStorms(): DataStorm[] {
    return Array.from(storms.values()).filter(
      (s) => s.status === 'recruiting' || s.status === 'countdown' || s.status === 'active'
    )
  },

  getTeamStorms(teamId: string): DataStorm[] {
    return Array.from(storms.values()).filter((s) =>
      s.participantTeams.some((p) => p.teamId === teamId)
    )
  },

  updateStorm(stormId: string, updates: Partial<DataStorm>): void {
    const storm = storms.get(stormId)
    if (storm) {
      Object.assign(storm, updates)
    }
  },

  checkAndUpdateStatus(stormId: string): StormStatus {
    const storm = storms.get(stormId)
    if (!storm) {
      throw new Error('数据风暴不存在')
    }

    if (storm.status === 'countdown' && storm.countdownEndTime) {
      if (new Date() >= new Date(storm.countdownEndTime)) {
        storm.status = 'active'
        storm.startTime = new Date().toISOString()
      }
    }

    return storm.status
  },
}
