import type { Request, Response } from 'express';
import type { Team, Application, TeamMember, APIError, TeamRole } from '../../shared/types.js';
import { getPlayerById, updatePlayer } from './AuthController.js';

const teams = new Map<string, Team>();
const applications = new Map<string, Application>();

const calculateTeamPower = (members: Array<{ skills: { cracking: number; programming: number; stealth: number } }>): number => {
  if (members.length === 0) return 0;
  const totalSkills = members.reduce((sum, m) => {
    return sum + m.skills.cracking + m.skills.programming + m.skills.stealth;
  }, 0);
  const avgSkill = totalSkills / members.length;
  return Math.round(avgSkill * members.length * 1.2);
};

const calculateTeamLevel = (totalPoints: number): number => {
  return Math.floor(Math.sqrt(totalPoints / 100)) + 1;
};

const mockTeam: Team = {
  id: 'team-001',
  name: 'Black Symphony',
  codeName: 'CYBER_SYMPHONY_77',
  motto: 'We code the night, we own the net',
  leaderId: 'player-001',
  members: [
    {
      playerId: 'player-001',
      username: 'NightHawk',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NightHawk',
      role: 'leader',
      skills: { cracking: 75, programming: 68, stealth: 82 },
      joinedAt: '2026-01-15T10:30:00Z',
    },
    {
      playerId: 'player-002',
      username: 'CyberWolf',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberWolf',
      role: 'officer',
      skills: { cracking: 62, programming: 85, stealth: 70 },
      joinedAt: '2026-02-01T14:20:00Z',
    },
    {
      playerId: 'player-003',
      username: 'GhostProtocol',
      avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=GhostProtocol',
      role: 'operator',
      skills: { cracking: 55, programming: 60, stealth: 90 },
      joinedAt: '2026-02-15T09:15:00Z',
    },
  ],
  power: 485,
  level: 5,
  totalPoints: 12450,
  joinCondition: {
    minReputation: 1000,
    minSkills: 150,
  },
  pendingApplications: [
    {
      id: 'app-001',
      teamId: 'team-001',
      playerId: 'player-004',
      playerUsername: 'ZeroDay',
      playerAvatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ZeroDay',
      playerSkills: { cracking: 45, programming: 50, stealth: 55 },
      playerReputation: 890,
      status: 'pending',
      message: 'Looking to join a skilled team. I specialize in stealth operations.',
      createdAt: '2026-06-05T12:00:00Z',
    },
  ],
  createdAt: '2026-01-15T10:30:00Z',
};

teams.set(mockTeam.id, mockTeam);
applications.set('app-001', mockTeam.pendingApplications[0]);

export const getTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const teamId = req.query.teamId as string;
    const playerId = req.query.playerId as string;

    let team: Team | undefined;

    if (teamId) {
      team = teams.get(teamId);
    } else if (playerId) {
      const player = getPlayerById(playerId);
      if (player?.teamId) {
        team = teams.get(player.teamId);
      }
    }

    if (!team) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Team not found',
        code: 404,
      } as APIError);
      return;
    }

    res.status(200).json(team);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const createTeam = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId, name, codeName, motto, minReputation, minSkills } = req.body;

    if (!playerId || !name) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Player ID and team name are required',
        code: 400,
      } as APIError);
      return;
    }

    const player = getPlayerById(playerId);
    if (!player) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Player not found',
        code: 404,
      } as APIError);
      return;
    }

    if (player.teamId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Player is already in a team',
        code: 400,
      } as APIError);
      return;
    }

    const teamId = `team-${Date.now()}`;
    const leaderMember: TeamMember = {
      playerId: player.id,
      username: player.username,
      avatar: player.avatar,
      role: 'leader',
      skills: player.skills,
      joinedAt: new Date().toISOString(),
    };

    const newTeam: Team = {
      id: teamId,
      name,
      codeName: codeName || name.toUpperCase().replace(/\s/g, '_'),
      motto: motto || '',
      leaderId: player.id,
      members: [leaderMember],
      power: calculateTeamPower([leaderMember]),
      level: 1,
      totalPoints: 0,
      joinCondition: {
        minReputation: minReputation || 0,
        minSkills: minSkills || 0,
      },
      pendingApplications: [],
      createdAt: new Date().toISOString(),
    };

    teams.set(teamId, newTeam);
    updatePlayer(playerId, { teamId, teamRole: 'leader' });

    res.status(201).json(newTeam);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const createApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId, teamId, message } = req.body;

    if (!playerId || !teamId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Player ID and team ID are required',
        code: 400,
      } as APIError);
      return;
    }

    const player = getPlayerById(playerId);
    const team = teams.get(teamId);

    if (!player || !team) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Player or team not found',
        code: 404,
      } as APIError);
      return;
    }

    if (player.teamId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Player is already in a team',
        code: 400,
      } as APIError);
      return;
    }

    const existingApp = team.pendingApplications.find(app => app.playerId === playerId && app.status === 'pending');
    if (existingApp) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Application already pending',
        code: 409,
      } as APIError);
      return;
    }

    const appId = `app-${Date.now()}`;
    const application: Application = {
      id: appId,
      teamId,
      playerId,
      playerUsername: player.username,
      playerAvatar: player.avatar,
      playerSkills: player.skills,
      playerReputation: player.reputation,
      status: 'pending',
      message: message || '',
      createdAt: new Date().toISOString(),
    };

    team.pendingApplications.push(application);
    applications.set(appId, application);

    res.status(201).json(application);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const approveApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { approverId } = req.body;

    if (!approverId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Approver ID is required',
        code: 400,
      } as APIError);
      return;
    }

    const application = applications.get(id);
    if (!application) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Application not found',
        code: 404,
      } as APIError);
      return;
    }

    const team = teams.get(application.teamId);
    if (!team) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Team not found',
        code: 404,
      } as APIError);
      return;
    }

    const approver = team.members.find(m => m.playerId === approverId);
    if (!approver || (approver.role !== 'leader' && approver.role !== 'officer')) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Insufficient permissions to approve applications',
        code: 403,
      } as APIError);
      return;
    }

    const player = getPlayerById(application.playerId);
    if (!player) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Player not found',
        code: 404,
      } as APIError);
      return;
    }

    if (player.teamId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Player is already in a team',
        code: 400,
      } as APIError);
      return;
    }

    application.status = 'approved';

    const newMember: TeamMember = {
      playerId: player.id,
      username: player.username,
      avatar: player.avatar,
      role: 'operator',
      skills: player.skills,
      joinedAt: new Date().toISOString(),
    };

    team.members.push(newMember);
    team.power = calculateTeamPower(team.members);
    team.level = calculateTeamLevel(team.totalPoints);

    updatePlayer(application.playerId, { teamId: team.id, teamRole: 'operator' });

    res.status(200).json({
      success: true,
      message: 'Application approved',
      team,
    });
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const updateMemberRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params;
    const { role, updaterId } = req.body;

    if (!role || !updaterId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Role and updater ID are required',
        code: 400,
      } as APIError);
      return;
    }

    const validRoles: TeamRole[] = ['leader', 'officer', 'operator'];
    if (!validRoles.includes(role)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid role',
        code: 400,
      } as APIError);
      return;
    }

    const player = getPlayerById(playerId);
    if (!player?.teamId) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Player or team not found',
        code: 404,
      } as APIError);
      return;
    }

    const team = teams.get(player.teamId);
    if (!team) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Team not found',
        code: 404,
      } as APIError);
      return;
    }

    const updater = team.members.find(m => m.playerId === updaterId);
    if (!updater || updater.role !== 'leader') {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Only team leader can update roles',
        code: 403,
      } as APIError);
      return;
    }

    const member = team.members.find(m => m.playerId === playerId);
    if (!member) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Member not found in team',
        code: 404,
      } as APIError);
      return;
    }

    if (role === 'leader' && member.playerId !== updaterId) {
      const oldLeader = team.members.find(m => m.role === 'leader');
      if (oldLeader) {
        oldLeader.role = 'officer';
        updatePlayer(oldLeader.playerId, { teamRole: 'officer' });
      }
      team.leaderId = playerId;
    }

    member.role = role;
    updatePlayer(playerId, { teamRole: role });

    res.status(200).json({
      success: true,
      message: 'Role updated',
      team,
    });
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const removeMember = async (req: Request, res: Response): Promise<void> => {
  try {
    const { playerId } = req.params;
    const { removerId } = req.body;

    if (!removerId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Remover ID is required',
        code: 400,
      } as APIError);
      return;
    }

    const player = getPlayerById(playerId);
    if (!player?.teamId) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Player or team not found',
        code: 404,
      } as APIError);
      return;
    }

    const team = teams.get(player.teamId);
    if (!team) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Team not found',
        code: 404,
      } as APIError);
      return;
    }

    const remover = team.members.find(m => m.playerId === removerId);
    if (!remover || (remover.role !== 'leader' && playerId !== removerId)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Only leader can remove members, or members can leave',
        code: 403,
      } as APIError);
      return;
    }

    const member = team.members.find(m => m.playerId === playerId);
    if (!member) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Member not found in team',
        code: 404,
      } as APIError);
      return;
    }

    if (member.role === 'leader' && team.members.length > 1) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Leader cannot leave team, transfer leadership first',
        code: 400,
      } as APIError);
      return;
    }

    team.members = team.members.filter(m => m.playerId !== playerId);
    team.power = calculateTeamPower(team.members);
    team.level = calculateTeamLevel(team.totalPoints);

    updatePlayer(playerId, { teamId: null, teamRole: null });

    if (team.members.length === 0) {
      teams.delete(team.id);
    }

    res.status(200).json({
      success: true,
      message: 'Member removed',
      team: team.members.length > 0 ? team : null,
    });
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const getTeamById = (teamId: string): Team | undefined => {
  return teams.get(teamId);
};

export const updateTeam = (teamId: string, updates: Partial<Team>): Team | undefined => {
  const team = teams.get(teamId);
  if (!team) return undefined;

  const updatedTeam = { ...team, ...updates };
  teams.set(teamId, updatedTeam);
  return updatedTeam;
};
