import type {
  Team,
  HackTarget,
  HackSession,
  HackEvent,
  ActiveSkill,
  StolenData,
  SkillType,
  HackStatus,
} from '../../shared/types'

const hackSessions = new Map<string, HackSession>()

export const HackService = {
  calculateTeamPower(team: Team): number {
    const totalSkills = team.members.reduce(
      (sum, member) => sum + member.skills.cracking + member.skills.programming + member.skills.stealth,
      0
    )
    const memberBonus = team.members.length * 10
    const levelBonus = team.level * 20
    return Math.floor(totalSkills + memberBonus + levelBonus)
  },

  startHackSession(team: Team, target: HackTarget): HackSession {
    const teamPower = this.calculateTeamPower(team)
    if (teamPower < target.minPowerRequired) {
      throw new Error(`团队能力不足，需要 ${target.minPowerRequired}，当前 ${teamPower}`)
    }

    const sessionId = `hack_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const session: HackSession = {
      id: sessionId,
      teamId: team.id,
      targetId: target.id,
      target,
      status: 'hacking',
      progress: 0,
      remainingTraffic: 100,
      detectionRisk: 0,
      startTime: new Date().toISOString(),
      activeSkills: [],
      events: [],
      dataStolen: [],
    }

    hackSessions.set(sessionId, session)
    return session
  },

  calculateHackProgress(session: HackSession, team: Team, deltaTime: number): Partial<HackSession> {
    if (session.status !== 'hacking') {
      return {}
    }

    const teamPower = this.calculateTeamPower(team)
    const powerRatio = teamPower / session.target.minPowerRequired
    const skillBonus = session.activeSkills.reduce((sum, skill) => sum + skill.boostAmount, 0)
    const eventModifiers = session.events.reduce((sum, e) => sum + (e.isPositive ? e.effect : -e.effect), 0)

    const baseProgress = (deltaTime / 1000) * (5 + powerRatio * 2)
    const progressIncrease = Math.min(baseProgress * (1 + skillBonus / 100 + eventModifiers / 100), 100 - session.progress)

    const newProgress = Math.min(session.progress + progressIncrease, 100)
    const trafficConsumption = progressIncrease * (0.5 + session.target.antiTracking * 0.1)
    const newRemainingTraffic = Math.max(0, session.remainingTraffic - trafficConsumption)

    const baseRisk = progressIncrease * session.target.alertProbability * 0.5
    const stealthReduction = team.members.reduce((sum, m) => sum + m.skills.stealth, 0) * 0.01
    const riskIncrease = Math.max(0, baseRisk * (1 - stealthReduction))
    const newDetectionRisk = Math.min(session.detectionRisk + riskIncrease, 100)

    const validActiveSkills = session.activeSkills.filter(
      (skill) => new Date(skill.expiresAt) > new Date()
    )

    return {
      progress: newProgress,
      remainingTraffic: newRemainingTraffic,
      detectionRisk: newDetectionRisk,
      activeSkills: validActiveSkills,
    }
  },

  generateRandomEvent(): HackEvent | null {
    const roll = Math.random()
    if (roll > 0.15) {
      return null
    }

    const eventTypes: Array<{
      type: HackEvent['type']
      description: string
      effectRange: [number, number]
      isPositive: boolean
    }> = [
      {
        type: 'vulnerability_found',
        description: '发现系统漏洞，入侵速度提升！',
        effectRange: [10, 25],
        isPositive: true,
      },
      {
        type: 'counter_hack',
        description: '遭遇反骇客攻击，检测风险上升！',
        effectRange: [5, 15],
        isPositive: false,
      },
      {
        type: 'system_crash',
        description: '目标系统临时崩溃，获得额外时间！',
        effectRange: [8, 18],
        isPositive: true,
      },
      {
        type: 'traffic_spike',
        description: '网络流量异常峰值，流量消耗增加！',
        effectRange: [5, 12],
        isPositive: false,
      },
      {
        type: 'encryption_weakness',
        description: '加密算法存在弱点，数据窃取加速！',
        effectRange: [12, 22],
        isPositive: true,
      },
      {
        type: 'honeypot',
        description: '警告！检测到蜜罐陷阱！',
        effectRange: [15, 30],
        isPositive: false,
      },
    ]

    const selected = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const effect = Math.floor(
      Math.random() * (selected.effectRange[1] - selected.effectRange[0]) + selected.effectRange[0]
    )

    return {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: selected.type,
      description: selected.description,
      effect,
      isPositive: selected.isPositive,
      createdAt: new Date().toISOString(),
    }
  },

  useSkill(sessionId: string, skillType: SkillType, boostAmount: number, durationMs: number): ActiveSkill {
    const session = hackSessions.get(sessionId)
    if (!session) {
      throw new Error('入侵会话不存在')
    }
    if (session.status !== 'hacking') {
      throw new Error('入侵已结束，无法使用技能')
    }

    const skill: ActiveSkill = {
      type: skillType,
      boostAmount,
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
    }

    session.activeSkills.push(skill)
    return skill
  },

  generateStolenData(target: HackTarget, count: number): StolenData[] {
    const data: StolenData[] = []
    const rarities: Array<{ rarity: StolenData['rarity']; weight: number; multiplier: number }> = [
      { rarity: 'common', weight: 60, multiplier: 1 },
      { rarity: 'rare', weight: 25, multiplier: 2.5 },
      { rarity: 'epic', weight: 12, multiplier: 5 },
      { rarity: 'legendary', weight: 3, multiplier: 10 },
    ]

    const dataNames: Record<string, string[]> = {
      corporate: ['客户数据库', '财务报表', '产品设计图', '员工信息', '商业计划书', '源代码仓库'],
      government: ['机密档案', '安全协议', '人员名单', '预算文件', '项目蓝图', '加密密钥'],
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
          selectedRarity.multiplier /
          count
      )

      data.push({
        id: `data_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`,
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

  completeHackSession(
    sessionId: string,
    teamId: string
  ): {
    success: boolean
    status: HackStatus
    credits: number
    points: number
    data: StolenData[]
  } {
    const session = hackSessions.get(sessionId)
    if (!session) {
      throw new Error('入侵会话不存在')
    }
    if (session.teamId !== teamId) {
      throw new Error('无权操作此入侵会话')
    }
    if (session.status !== 'hacking') {
      throw new Error('入侵已结束')
    }

    let status: HackStatus
    let success = false
    let credits = 0
    let points = 0
    let data: StolenData[] = []

    if (session.detectionRisk >= 100) {
      status = 'detected'
      success = false
    } else if (session.remainingTraffic <= 0) {
      status = 'failed'
      success = false
    } else if (session.progress >= 100) {
      status = 'success'
      success = true

      const efficiency = session.remainingTraffic / 100
      const riskBonus = 1 - session.detectionRisk / 200
      credits = Math.floor(
        (session.target.rewards.minCredits +
          Math.random() * (session.target.rewards.maxCredits - session.target.rewards.minCredits)) *
          efficiency *
          riskBonus
      )
      points = session.target.rewards.points

      const dataCount = Math.floor(1 + Math.random() * 3)
      data = this.generateStolenData(session.target, dataCount).map((d) => ({
        ...d,
        ownerId: teamId,
      }))
      session.dataStolen = data
    } else {
      status = 'failed'
      success = false
    }

    session.status = status
    return { success, status, credits, points, data }
  },

  getSession(sessionId: string): HackSession | undefined {
    return hackSessions.get(sessionId)
  },

  getTeamSessions(teamId: string): HackSession[] {
    return Array.from(hackSessions.values()).filter((s) => s.teamId === teamId)
  },

  addEvent(sessionId: string, event: HackEvent): void {
    const session = hackSessions.get(sessionId)
    if (session) {
      session.events.push(event)
    }
  },

  updateSession(sessionId: string, updates: Partial<HackSession>): void {
    const session = hackSessions.get(sessionId)
    if (session) {
      Object.assign(session, updates)
    }
  },
}
