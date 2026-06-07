import type {
  Team,
  TeamMember,
  Application,
  Player,
  TeamRole,
  PlayerSkills,
} from '../../shared/types'

const teams = new Map<string, Team>()
const applications = new Map<string, Application>()

export const TeamService = {
  calculateTeamPower(team: Team): number {
    const totalSkills = team.members.reduce(
      (sum, member) => sum + member.skills.cracking + member.skills.programming + member.skills.stealth,
      0
    )
    const memberBonus = team.members.length * 10
    const levelBonus = team.level * 20
    return Math.floor(totalSkills + memberBonus + levelBonus)
  },

  calculateTeamLevel(totalPoints: number): number {
    if (totalPoints < 100) return 1
    if (totalPoints < 300) return 2
    if (totalPoints < 600) return 3
    if (totalPoints < 1000) return 4
    if (totalPoints < 1500) return 5
    if (totalPoints < 2100) return 6
    if (totalPoints < 2800) return 7
    if (totalPoints < 3600) return 8
    if (totalPoints < 4500) return 9
    return 10
  },

  createTeam(
    leader: Player,
    name: string,
    codeName: string,
    motto: string,
    minReputation: number = 0,
    minSkills: number = 0
  ): Team {
    if (!name || name.length < 2) {
      throw new Error('团队名称至少需要2个字符')
    }
    if (!codeName || codeName.length < 2) {
      throw new Error('团队代号至少需要2个字符')
    }
    if (leader.teamId) {
      throw new Error('您已加入其他团队')
    }

    const existingByName = Array.from(teams.values()).find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    )
    if (existingByName) {
      throw new Error('团队名称已存在')
    }

    const existingByCode = Array.from(teams.values()).find(
      (t) => t.codeName.toLowerCase() === codeName.toLowerCase()
    )
    if (existingByCode) {
      throw new Error('团队代号已存在')
    }

    const teamId = `team_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const leaderMember: TeamMember = {
      playerId: leader.id,
      username: leader.username,
      avatar: leader.avatar,
      role: 'leader',
      skills: leader.skills,
      joinedAt: new Date().toISOString(),
    }

    const team: Team = {
      id: teamId,
      name,
      codeName,
      motto,
      leaderId: leader.id,
      members: [leaderMember],
      power: 0,
      level: 1,
      totalPoints: 0,
      joinCondition: {
        minReputation,
        minSkills,
      },
      pendingApplications: [],
      createdAt: new Date().toISOString(),
    }

    team.power = this.calculateTeamPower(team)

    teams.set(teamId, team)

    return team
  },

  applyToJoin(teamId: string, player: Player, message: string): Application {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }
    if (player.teamId) {
      throw new Error('您已加入其他团队')
    }
    if (player.reputation < team.joinCondition.minReputation) {
      throw new Error(`声望不足，需要 ${team.joinCondition.minReputation}`)
    }

    const totalSkills = player.skills.cracking + player.skills.programming + player.skills.stealth
    if (totalSkills < team.joinCondition.minSkills) {
      throw new Error(`技能总和不足，需要 ${team.joinCondition.minSkills}`)
    }

    const existingApplication = Array.from(applications.values()).find(
      (a) => a.teamId === teamId && a.playerId === player.id && a.status === 'pending'
    )
    if (existingApplication) {
      throw new Error('您已提交申请，等待审批中')
    }

    const applicationId = `app_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const application: Application = {
      id: applicationId,
      teamId,
      playerId: player.id,
      playerUsername: player.username,
      playerAvatar: player.avatar,
      playerSkills: player.skills,
      playerReputation: player.reputation,
      status: 'pending',
      message,
      createdAt: new Date().toISOString(),
    }

    applications.set(applicationId, application)
    team.pendingApplications.push(application)

    return application
  },

  approveApplication(applicationId: string, approver: Player): Team {
    const application = applications.get(applicationId)
    if (!application) {
      throw new Error('申请不存在')
    }
    if (application.status !== 'pending') {
      throw new Error('申请已处理')
    }
    if (application.teamId !== approver.teamId) {
      throw new Error('无权审批其他团队的申请')
    }
    if (approver.teamRole !== 'leader' && approver.teamRole !== 'officer') {
      throw new Error('权限不足，只有首领和副手可以审批')
    }

    const team = teams.get(application.teamId)
    if (!team) {
      throw new Error('团队不存在')
    }

    application.status = 'approved'

    const newMember: TeamMember = {
      playerId: application.playerId,
      username: application.playerUsername,
      avatar: application.playerAvatar,
      role: 'operator',
      skills: application.playerSkills,
      joinedAt: new Date().toISOString(),
    }

    team.members.push(newMember)
    team.power = this.calculateTeamPower(team)

    const appIndex = team.pendingApplications.findIndex((a) => a.id === applicationId)
    if (appIndex !== -1) {
      team.pendingApplications[appIndex].status = 'approved'
    }

    return team
  },

  rejectApplication(applicationId: string, approver: Player): Application {
    const application = applications.get(applicationId)
    if (!application) {
      throw new Error('申请不存在')
    }
    if (application.status !== 'pending') {
      throw new Error('申请已处理')
    }
    if (application.teamId !== approver.teamId) {
      throw new Error('无权审批其他团队的申请')
    }
    if (approver.teamRole !== 'leader' && approver.teamRole !== 'officer') {
      throw new Error('权限不足，只有首领和副手可以审批')
    }

    const team = teams.get(application.teamId)
    if (team) {
      const appIndex = team.pendingApplications.findIndex((a) => a.id === applicationId)
      if (appIndex !== -1) {
        team.pendingApplications[appIndex].status = 'rejected'
      }
    }

    application.status = 'rejected'
    return application
  },

  changeMemberRole(
    teamId: string,
    memberId: string,
    newRole: TeamRole,
    operator: Player
  ): TeamMember {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }
    if (operator.teamId !== teamId) {
      throw new Error('无权操作其他团队')
    }
    if (operator.teamRole !== 'leader') {
      throw new Error('只有首领可以更改成员角色')
    }

    const member = team.members.find((m) => m.playerId === memberId)
    if (!member) {
      throw new Error('成员不存在')
    }
    if (member.role === 'leader' && newRole !== 'leader') {
      throw new Error('首领角色不能被更改，请先转让首领')
    }

    if (newRole === 'leader') {
      const oldLeader = team.members.find((m) => m.role === 'leader')
      if (oldLeader) {
        oldLeader.role = 'officer'
      }
      team.leaderId = memberId
    }

    member.role = newRole
    return member
  },

  kickMember(teamId: string, memberId: string, operator: Player): void {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }
    if (operator.teamId !== teamId) {
      throw new Error('无权操作其他团队')
    }

    const member = team.members.find((m) => m.playerId === memberId)
    if (!member) {
      throw new Error('成员不存在')
    }
    if (member.role === 'leader') {
      throw new Error('不能踢除首领')
    }

    if (operator.teamRole !== 'leader' && operator.teamRole !== 'officer') {
      throw new Error('权限不足，只有首领和副手可以踢人')
    }

    if (member.role === 'officer' && operator.teamRole !== 'leader') {
      throw new Error('只有首领可以踢除副手')
    }

    const memberIndex = team.members.findIndex((m) => m.playerId === memberId)
    if (memberIndex !== -1) {
      team.members.splice(memberIndex, 1)
      team.power = this.calculateTeamPower(team)
    }
  },

  leaveTeam(teamId: string, player: Player): void {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }
    if (player.teamId !== teamId) {
      throw new Error('您不在此团队中')
    }

    const member = team.members.find((m) => m.playerId === player.id)
    if (!member) {
      throw new Error('您不是团队成员')
    }
    if (member.role === 'leader') {
      throw new Error('首领不能直接离开团队，请先转让首领或解散团队')
    }

    const memberIndex = team.members.findIndex((m) => m.playerId === player.id)
    if (memberIndex !== -1) {
      team.members.splice(memberIndex, 1)
      team.power = this.calculateTeamPower(team)
    }
  },

  disbandTeam(teamId: string, leader: Player): void {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }
    if (team.leaderId !== leader.id) {
      throw new Error('只有首领可以解散团队')
    }

    teams.delete(teamId)

    const pendingApps = Array.from(applications.values()).filter(
      (a) => a.teamId === teamId && a.status === 'pending'
    )
    for (const app of pendingApps) {
      app.status = 'rejected'
    }
  },

  updateTeamPower(teamId: string): number {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }

    team.power = this.calculateTeamPower(team)
    return team.power
  },

  addTeamPoints(teamId: string, points: number): Team {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }

    team.totalPoints += points
    team.level = this.calculateTeamLevel(team.totalPoints)
    team.power = this.calculateTeamPower(team)

    return team
  },

  updateJoinCondition(
    teamId: string,
    minReputation: number,
    minSkills: number,
    operator: Player
  ): Team {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }
    if (operator.teamId !== teamId) {
      throw new Error('无权操作其他团队')
    }
    if (operator.teamRole !== 'leader') {
      throw new Error('只有首领可以修改加入条件')
    }

    team.joinCondition.minReputation = minReputation
    team.joinCondition.minSkills = minSkills

    return team
  },

  getTeam(teamId: string): Team | undefined {
    return teams.get(teamId)
  },

  getTeamByName(name: string): Team | undefined {
    return Array.from(teams.values()).find(
      (t) => t.name.toLowerCase() === name.toLowerCase()
    )
  },

  getAllTeams(): Team[] {
    return Array.from(teams.values()).sort((a, b) => b.power - a.power)
  },

  getPendingApplications(teamId: string): Application[] {
    return Array.from(applications.values()).filter(
      (a) => a.teamId === teamId && a.status === 'pending'
    )
  },

  getPlayerApplications(playerId: string): Application[] {
    return Array.from(applications.values()).filter((a) => a.playerId === playerId)
  },

  getApplication(applicationId: string): Application | undefined {
    return applications.get(applicationId)
  },

  updateMemberSkills(teamId: string, playerId: string, skills: PlayerSkills): void {
    const team = teams.get(teamId)
    if (!team) {
      return
    }

    const member = team.members.find((m) => m.playerId === playerId)
    if (member) {
      member.skills = skills
      team.power = this.calculateTeamPower(team)
    }
  },

  transferLeadership(teamId: string, newLeaderId: string, currentLeader: Player): void {
    const team = teams.get(teamId)
    if (!team) {
      throw new Error('团队不存在')
    }
    if (team.leaderId !== currentLeader.id) {
      throw new Error('只有首领可以转让首领位置')
    }

    const newLeader = team.members.find((m) => m.playerId === newLeaderId)
    if (!newLeader) {
      throw new Error('新首领必须是团队成员')
    }

    const oldLeader = team.members.find((m) => m.playerId === currentLeader.id)
    if (oldLeader) {
      oldLeader.role = 'officer'
    }

    newLeader.role = 'leader'
    team.leaderId = newLeaderId
  },
}
