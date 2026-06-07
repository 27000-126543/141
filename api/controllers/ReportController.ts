import type { Request, Response } from 'express';
import type {
  WeeklyReport,
  RankingResponse,
  RankEntry,
  APIError,
  Team,
} from '../../shared/types.js';
import { getTeamById } from './TeamController.js';

const generateWeeklyReport = (team: Team): WeeklyReport => {
  const weekEnd = new Date();
  const weekStart = new Date(weekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

  const targetHeatmap = [
    { targetId: 'target-001', targetName: '赛博娱乐集团', attackCount: 8, successRate: 100 },
    { targetId: 'target-003', targetName: '夜之城市民信息库', attackCount: 6, successRate: 83.3 },
    { targetId: 'target-005', targetName: '媒体集团', attackCount: 5, successRate: 80 },
    { targetId: 'target-004', targetName: 'NCPD系统', attackCount: 3, successRate: 66.7 },
    { targetId: 'target-002', targetName: '荒坂科技', attackCount: 2, successRate: 50 },
  ];

  const teamGrowth: Array<{ date: string; power: number; level: number }> = [];
  let currentPower = team.power - 65;
  let currentLevel = Math.max(1, team.level - 1);

  for (let i = 6; i >= 0; i--) {
    const date = new Date(weekEnd.getTime() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const powerIncrease = Math.floor(Math.random() * 20) + 5;
    currentPower += powerIncrease;
    if (currentPower >= (currentLevel + 1) * 100) {
      currentLevel++;
    }
    teamGrowth.push({ date, power: Math.min(team.power, currentPower), level: Math.min(team.level, currentLevel) });
  }

  const memberPerformance = team.members.map(member => ({
    playerId: member.playerId,
    username: member.username,
    hacksParticipated: Math.floor(Math.random() * 15) + 10,
    contributionScore: Math.floor(Math.random() * 30) + 70,
  })).sort((a, b) => b.contributionScore - a.contributionScore);

  const totalSkills = team.members.reduce(
    (sum, m) => ({
      cracking: sum.cracking + m.skills.cracking,
      programming: sum.programming + m.skills.programming,
      stealth: sum.stealth + m.skills.stealth,
    }),
    { cracking: 0, programming: 0, stealth: 0 }
  );

  const skillDistribution = {
    cracking: Math.round(totalSkills.cracking / team.members.length),
    programming: Math.round(totalSkills.programming / team.members.length),
    stealth: Math.round(totalSkills.stealth / team.members.length),
  };

  const totalHacks = targetHeatmap.reduce((sum, t) => sum + t.attackCount, 0);
  const successRate = totalHacks > 0
    ? Math.round(targetHeatmap.reduce((sum, t) => sum + t.attackCount * t.successRate, 0) / totalHacks * 10) / 10
    : 0;

  return {
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
    teamStats: {
      totalHacks,
      successRate,
      totalPoints: team.totalPoints,
      totalCreditsEarned: Math.floor(Math.random() * 100000) + 100000,
    },
    targetHeatmap,
    teamGrowth,
    memberPerformance,
    skillDistribution,
  };
};

const mockTeams: Team[] = [
  {
    id: 'team-top1',
    name: 'Ghost Shell',
    codeName: 'GHOST_SHELL',
    motto: 'We are the shadow in the net',
    leaderId: 'player-top1',
    members: [],
    power: 950,
    level: 12,
    totalPoints: 45600,
    joinCondition: { minReputation: 5000, minSkills: 500 },
    pendingApplications: [],
    createdAt: '2026-01-01T00:00:00Z',
  },
  {
    id: 'team-top2',
    name: 'Neon Reapers',
    codeName: 'NEON_REAPERS',
    motto: 'We come for the data, we leave with everything',
    leaderId: 'player-top2',
    members: [],
    power: 780,
    level: 10,
    totalPoints: 38200,
    joinCondition: { minReputation: 3000, minSkills: 350 },
    pendingApplications: [],
    createdAt: '2026-01-10T00:00:00Z',
  },
  {
    id: 'team-top3',
    name: 'Cyber Syndicate',
    codeName: 'CYBER_SYNDICATE',
    motto: 'In unity, there is power',
    leaderId: 'player-top3',
    members: [],
    power: 820,
    level: 11,
    totalPoints: 35800,
    joinCondition: { minReputation: 4000, minSkills: 400 },
    pendingApplications: [],
    createdAt: '2026-01-05T00:00:00Z',
  },
  {
    id: 'team-top5',
    name: 'Dark Matter',
    codeName: 'DARK_MATTER',
    motto: 'Silent. Deadly. Everywhere.',
    leaderId: 'player-top5',
    members: [],
    power: 650,
    level: 8,
    totalPoints: 28900,
    joinCondition: { minReputation: 2500, minSkills: 300 },
    pendingApplications: [],
    createdAt: '2026-02-01T00:00:00Z',
  },
  {
    id: 'team-top6',
    name: 'Byte Knights',
    codeName: 'BYTE_KNIGHTS',
    motto: 'Code is our sword, data is our treasure',
    leaderId: 'player-top6',
    members: [],
    power: 580,
    level: 7,
    totalPoints: 21500,
    joinCondition: { minReputation: 2000, minSkills: 250 },
    pendingApplications: [],
    createdAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'team-top7',
    name: 'Zero Hour',
    codeName: 'ZERO_HOUR',
    motto: 'We strike when the clock strikes zero',
    leaderId: 'player-top7',
    members: [],
    power: 720,
    level: 9,
    totalPoints: 19800,
    joinCondition: { minReputation: 3000, minSkills: 350 },
    pendingApplications: [],
    createdAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'team-top8',
    name: 'Silent Protocol',
    codeName: 'SILENT_PROTOCOL',
    motto: 'No sound. No trace. Just results.',
    leaderId: 'player-top8',
    members: [],
    power: 520,
    level: 6,
    totalPoints: 15600,
    joinCondition: { minReputation: 1500, minSkills: 200 },
    pendingApplications: [],
    createdAt: '2026-03-01T00:00:00Z',
  },
  {
    id: 'team-top9',
    name: 'Quantum Leap',
    codeName: 'QUANTUM_LEAP',
    motto: 'We jump through firewalls like they are not there',
    leaderId: 'player-top9',
    members: [],
    power: 550,
    level: 7,
    totalPoints: 14200,
    joinCondition: { minReputation: 1800, minSkills: 220 },
    pendingApplications: [],
    createdAt: '2026-02-25T00:00:00Z',
  },
  {
    id: 'team-top10',
    name: 'Net Runners',
    codeName: 'NET_RUNNERS',
    motto: 'The net is our playground',
    leaderId: 'player-top10',
    members: [],
    power: 420,
    level: 5,
    totalPoints: 11000,
    joinCondition: { minReputation: 1000, minSkills: 150 },
    pendingApplications: [],
    createdAt: '2026-03-10T00:00:00Z',
  },
];

const wealthData: Record<string, number> = {
  'team-top1': 2450000,
  'team-top2': 1890000,
  'team-top3': 2580000,
  'team-top5': 1650000,
  'team-top6': 980000,
  'team-top7': 1250000,
  'team-top8': 720000,
  'team-top9': 650000,
  'team-top10': 520000,
  'team-001': 281000,
};

const generateRankings = (type: 'points' | 'wealth' | 'level', currentTeamId?: string): RankingResponse => {
  const allTeams = [...mockTeams];
  const currentTeam = currentTeamId ? getTeamById(currentTeamId) : undefined;

  if (currentTeam && !allTeams.some(t => t.id === currentTeamId)) {
    allTeams.push(currentTeam);
  }

  const entries: RankEntry[] = allTeams.map(team => {
    let value: number;
    switch (type) {
      case 'wealth':
        value = wealthData[team.id] || team.totalPoints * 50;
        break;
      case 'level':
        value = team.level;
        break;
      case 'points':
      default:
        value = team.totalPoints;
    }

    return {
      rank: 0,
      previousRank: Math.floor(Math.random() * 10) + 1,
      teamId: team.id,
      teamName: team.name,
      teamLevel: team.level,
      memberCount: team.members.length || Math.floor(Math.random() * 8) + 2,
      value,
    };
  });

  entries.sort((a, b) => {
    if (type === 'level') {
      return b.value - a.value || b.teamLevel - a.teamLevel;
    }
    return b.value - a.value;
  });

  entries.forEach((entry, index) => {
    entry.rank = index + 1;
    entry.previousRank = entry.rank + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
    entry.previousRank = Math.max(1, Math.min(entries.length, entry.previousRank));
  });

  return {
    type,
    entries,
    lastUpdated: new Date().toISOString(),
  };
};

export const getWeeklyReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId } = req.query;

    if (!teamId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Team ID is required',
        code: 400,
      } as APIError);
      return;
    }

    const team = getTeamById(teamId as string);
    if (!team) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Team not found',
        code: 404,
      } as APIError);
      return;
    }

    const report = generateWeeklyReport(team);
    res.status(200).json(report);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const getRanking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, teamId } = req.query;

    const validTypes: Array<'points' | 'wealth' | 'level'> = ['points', 'wealth', 'level'];
    const rankingType = validTypes.includes(type as 'points' | 'wealth' | 'level')
      ? (type as 'points' | 'wealth' | 'level')
      : 'points';

    const ranking = generateRankings(rankingType, teamId as string);
    res.status(200).json(ranking);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};
