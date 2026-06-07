import type { Request, Response } from 'express';
import type {
  DataStorm,
  StormParticipant,
  HackTarget,
  APIError,
} from '../../shared/types.js';
import { getTeamById, updateTeam } from './TeamController.js';
import type { Server } from 'socket.io';

let io: Server | null = null;

export const setSocketServer = (socketServer: Server) => {
  io = socketServer;
};

const hackTargets: HackTarget[] = [
  {
    id: 'target-001',
    name: '赛博娱乐集团用户数据库',
    type: 'corporate',
    description: '包含200万用户个人信息和消费记录，安全防护相对薄弱',
    firewallLevel: 3,
    antiTracking: 2,
    alertProbability: 0.15,
    minPowerRequired: 150,
    rewards: {
      dataTypes: ['user_profiles', 'payment_records'],
      minCredits: 5000,
      maxCredits: 15000,
      points: 100,
    },
    estimatedTime: 120,
  },
  {
    id: 'target-002',
    name: '荒坂科技研发服务器',
    type: 'corporate',
    description: '最新义体技术研发资料，高度保密，防护森严',
    firewallLevel: 8,
    antiTracking: 7,
    alertProbability: 0.45,
    minPowerRequired: 500,
    rewards: {
      dataTypes: ['tech_blueprints', 'research_data'],
      minCredits: 50000,
      maxCredits: 150000,
      points: 500,
    },
    estimatedTime: 300,
  },
  {
    id: 'target-006',
    name: '军用科技武器系统',
    type: 'corporate',
    description: '下一代武器系统设计文档和测试数据，最高安全等级',
    firewallLevel: 9,
    antiTracking: 8,
    alertProbability: 0.55,
    minPowerRequired: 650,
    rewards: {
      dataTypes: ['weapon_specs', 'military_intel'],
      minCredits: 100000,
      maxCredits: 300000,
      points: 750,
    },
    estimatedTime: 360,
  },
];

const storms = new Map<string, DataStorm>();
const stormTimers = new Map<string, NodeJS.Timeout>();

const mockStorm: DataStorm = {
  id: 'storm-001',
  initiatorTeamId: 'team-001',
  initiatorTeamName: 'Black Symphony',
  targetId: 'target-006',
  target: hackTargets[2],
  status: 'recruiting',
  participantTeams: [
    {
      teamId: 'team-001',
      teamName: 'Black Symphony',
      contribution: 0,
      players: ['player-001', 'player-002', 'player-003'],
      rewardShare: 0,
    },
    {
      teamId: 'team-002',
      teamName: 'Neon Reapers',
      contribution: 0,
      players: ['player-005', 'player-006'],
      rewardShare: 0,
    },
  ],
  startTime: new Date().toISOString(),
  countdownEndTime: new Date(Date.now() + 300000).toISOString(),
  totalDamage: 0,
};

storms.set(mockStorm.id, mockStorm);

const processStormSession = (storm: DataStorm) => {
  if (storm.status === 'recruiting') {
    const now = Date.now();
    const countdownEnd = storm.countdownEndTime ? new Date(storm.countdownEndTime).getTime() : now;

    if (now >= countdownEnd) {
      if (storm.participantTeams.length >= 2) {
        storm.status = 'active';
        storm.endTime = new Date(Date.now() + storm.target.estimatedTime * 1000).toISOString();

        const totalPower = storm.participantTeams.reduce((sum, p) => {
          const team = getTeamById(p.teamId);
          return sum + (team?.power || 0);
        }, 0);

        storm.participantTeams.forEach(p => {
          const team = getTeamById(p.teamId);
          if (team) {
            p.rewardShare = team.power / totalPower;
          }
        });
      } else {
        storm.status = 'failed';
        const timer = stormTimers.get(storm.id);
        if (timer) {
          clearInterval(timer);
          stormTimers.delete(storm.id);
        }
        return;
      }
    }
    return;
  }

  if (storm.status !== 'active') return;

  const totalPower = storm.participantTeams.reduce((sum, p) => {
    const team = getTeamById(p.teamId);
    return sum + (team?.power || 0);
  }, 0);

  const baseDamage = (totalPower / 100) * (1 - storm.target.firewallLevel * 0.05);
  const damagePerTeam = baseDamage / storm.participantTeams.length;

  storm.participantTeams.forEach(p => {
    p.contribution += damagePerTeam;
  });

  storm.totalDamage += baseDamage;

  const maxDamage = storm.target.firewallLevel * 1000;
  if (storm.totalDamage >= maxDamage) {
    completeStorm(storm, true);
    return;
  }

  const endTime = storm.endTime ? new Date(storm.endTime).getTime() : 0;
  if (Date.now() >= endTime) {
    completeStorm(storm, storm.totalDamage >= maxDamage * 0.7);
    return;
  }

  io?.emit('storm:update', {
    stormId: storm.id,
    participants: storm.participantTeams,
    totalDamage: storm.totalDamage,
  });
};

const completeStorm = (storm: DataStorm, success: boolean) => {
  storm.status = success ? 'completed' : 'failed';

  const timer = stormTimers.get(storm.id);
  if (timer) {
    clearInterval(timer);
    stormTimers.delete(storm.id);
  }

  const totalRewards = success
    ? Math.floor(
        Math.random() * (storm.target.rewards.maxCredits - storm.target.rewards.minCredits + 1) +
          storm.target.rewards.minCredits
      ) * storm.participantTeams.length
    : 0;

  const shares: Array<{ teamId: string; amount: number }> = [];

  if (success) {
    storm.participantTeams.forEach(p => {
      const amount = Math.floor(totalRewards * p.rewardShare);
      shares.push({ teamId: p.teamId, amount });

      const team = getTeamById(p.teamId);
      if (team) {
        updateTeam(p.teamId, { totalPoints: team.totalPoints + Math.floor(storm.target.rewards.points * p.rewardShare) });
      }
    });
  }

  io?.emit('storm:complete', {
    stormId: storm.id,
    success,
    totalRewards,
    shares,
  });
};

export const getActiveStorms = async (req: Request, res: Response): Promise<void> => {
  try {
    const activeStorms = Array.from(storms.values()).filter(
      s => s.status === 'recruiting' || s.status === 'active'
    );

    res.status(200).json(activeStorms);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const createStorm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId, targetId, playerIds } = req.body;

    if (!teamId || !targetId || !playerIds || !Array.isArray(playerIds)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Team ID, target ID, and player IDs are required',
        code: 400,
      } as APIError);
      return;
    }

    const team = getTeamById(teamId);
    const target = hackTargets.find(t => t.id === targetId);

    if (!team || !target) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Team or target not found',
        code: 404,
      } as APIError);
      return;
    }

    const validPlayerIds = playerIds.filter(id => team.members.some(m => m.playerId === id));
    if (validPlayerIds.length === 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'At least one valid team member is required',
        code: 400,
      } as APIError);
      return;
    }

    const activeStorms = Array.from(storms.values()).filter(
      s => s.status === 'recruiting' || s.status === 'active'
    );
    const teamInStorm = activeStorms.some(s =>
      s.participantTeams.some(p => p.teamId === teamId)
    );

    if (teamInStorm) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Team is already participating in an active storm',
        code: 409,
      } as APIError);
      return;
    }

    const stormId = `storm-${Date.now()}`;
    const participant: StormParticipant = {
      teamId,
      teamName: team.name,
      contribution: 0,
      players: validPlayerIds,
      rewardShare: 0,
    };

    const newStorm: DataStorm = {
      id: stormId,
      initiatorTeamId: teamId,
      initiatorTeamName: team.name,
      targetId,
      target,
      status: 'recruiting',
      participantTeams: [participant],
      startTime: new Date().toISOString(),
      countdownEndTime: new Date(Date.now() + 300000).toISOString(),
      totalDamage: 0,
    };

    storms.set(stormId, newStorm);

    const timer = setInterval(() => {
      const storm = storms.get(stormId);
      if (storm) {
        processStormSession(storm);
      }
    }, 1000);

    stormTimers.set(stormId, timer);

    res.status(201).json(newStorm);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const joinStorm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { teamId, playerIds } = req.body;

    if (!teamId || !playerIds || !Array.isArray(playerIds)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Team ID and player IDs are required',
        code: 400,
      } as APIError);
      return;
    }

    const storm = storms.get(id);
    const team = getTeamById(teamId);

    if (!storm || !team) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Storm or team not found',
        code: 404,
      } as APIError);
      return;
    }

    if (storm.status !== 'recruiting') {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Storm is not accepting new participants',
        code: 400,
      } as APIError);
      return;
    }

    const existingParticipant = storm.participantTeams.find(p => p.teamId === teamId);
    if (existingParticipant) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Team is already participating in this storm',
        code: 409,
      } as APIError);
      return;
    }

    if (team.power < storm.target.minPowerRequired * 0.5) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Team power is insufficient for this storm',
        code: 400,
      } as APIError);
      return;
    }

    const validPlayerIds = playerIds.filter(pid => team.members.some(m => m.playerId === pid));
    if (validPlayerIds.length === 0) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'At least one valid team member is required',
        code: 400,
      } as APIError);
      return;
    }

    const participant: StormParticipant = {
      teamId,
      teamName: team.name,
      contribution: 0,
      players: validPlayerIds,
      rewardShare: 0,
    };

    storm.participantTeams.push(participant);

    io?.emit('storm:update', {
      stormId: storm.id,
      participants: storm.participantTeams,
      totalDamage: storm.totalDamage,
    });

    res.status(200).json({
      success: true,
      message: 'Joined storm successfully',
      storm,
    });
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const getStormById = (stormId: string): DataStorm | undefined => {
  return storms.get(stormId);
};
