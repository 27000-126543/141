export interface PlayerSkills {
  cracking: number;
  programming: number;
  stealth: number;
}

export interface Player {
  id: string;
  username: string;
  avatar: string;
  skills: PlayerSkills;
  reputation: number;
  credits: number;
  teamId: string | null;
  teamRole: 'leader' | 'officer' | 'operator' | null;
  createdAt: string;
}

export interface TeamMember {
  playerId: string;
  username: string;
  avatar: string;
  role: 'leader' | 'officer' | 'operator';
  skills: PlayerSkills;
  joinedAt: string;
}

export interface Application {
  id: string;
  teamId: string;
  playerId: string;
  playerUsername: string;
  playerAvatar: string;
  playerSkills: PlayerSkills;
  playerReputation: number;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  codeName: string;
  motto: string;
  leaderId: string;
  members: TeamMember[];
  power: number;
  level: number;
  totalPoints: number;
  joinCondition: {
    minReputation: number;
    minSkills: number;
  };
  pendingApplications: Application[];
  createdAt: string;
}

export interface HackTarget {
  id: string;
  name: string;
  type: 'corporate' | 'government';
  description: string;
  firewallLevel: number;
  antiTracking: number;
  alertProbability: number;
  minPowerRequired: number;
  rewards: {
    dataTypes: string[];
    minCredits: number;
    maxCredits: number;
    points: number;
  };
  estimatedTime: number;
}

export interface HackEvent {
  id: string;
  type: 'vulnerability_found' | 'counter_hack' | 'system_crash' | 'traffic_spike' | 'encryption_weakness' | 'honeypot';
  description: string;
  effect: number;
  isPositive: boolean;
  createdAt: string;
}

export interface ActiveSkill {
  type: 'cracking' | 'programming' | 'stealth';
  boostAmount: number;
  expiresAt: string;
}

export interface StolenData {
  id: string;
  type: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  baseValue: number;
  ownerId: string;
  createdAt: string;
}

export interface HackSession {
  id: string;
  teamId: string;
  targetId: string;
  target: HackTarget;
  status: 'hacking' | 'success' | 'failed' | 'detected';
  progress: number;
  remainingTraffic: number;
  detectionRisk: number;
  startTime: string;
  activeSkills: ActiveSkill[];
  events: HackEvent[];
  dataStolen: StolenData[];
}

export interface MarketOrder {
  id: string;
  dataId: string;
  data: StolenData;
  sellerId: string;
  sellerName: string;
  price: number;
  suggestedMin: number;
  suggestedMax: number;
  status: 'listed' | 'sold' | 'cancelled';
  createdAt: string;
  soldAt?: string;
  buyerId?: string;
  buyerName?: string;
}

export interface PriceSuggestion {
  avg7d: number;
  range: [number, number];
  historicalPrices: Array<{ date: string; price: number }>;
}

export interface StormParticipant {
  teamId: string;
  teamName: string;
  contribution: number;
  players: string[];
  rewardShare: number;
}

export interface DataStorm {
  id: string;
  initiatorTeamId: string;
  initiatorTeamName: string;
  targetId: string;
  target: HackTarget;
  status: 'recruiting' | 'countdown' | 'active' | 'completed' | 'failed';
  participantTeams: StormParticipant[];
  startTime: string;
  countdownEndTime?: string;
  endTime?: string;
  totalDamage: number;
}

export interface WeeklyReport {
  weekStart: string;
  weekEnd: string;
  teamStats: {
    totalHacks: number;
    successRate: number;
    totalPoints: number;
    totalCreditsEarned: number;
  };
  targetHeatmap: Array<{ targetId: string; targetName: string; attackCount: number; successRate: number }>;
  teamGrowth: Array<{ date: string; power: number; level: number }>;
  memberPerformance: Array<{
    playerId: string;
    username: string;
    hacksParticipated: number;
    contributionScore: number;
  }>;
  skillDistribution: {
    cracking: number;
    programming: number;
    stealth: number;
  };
}

export interface RankEntry {
  rank: number;
  previousRank: number;
  teamId: string;
  teamName: string;
  teamLevel: number;
  memberCount: number;
  value: number;
}

export interface RankingResponse {
  type: 'points' | 'wealth' | 'level';
  entries: RankEntry[];
  lastUpdated: string;
}

export interface MarketAnnouncement {
  id: string;
  dataName: string;
  rarity: string;
  sellerName: string;
  buyerName: string;
  price: number;
  timestamp: string;
}

export interface AuthResponse {
  token: string;
  player: Player;
}

export interface APIError {
  error: string;
  message: string;
  code: number;
}

export type SkillType = 'cracking' | 'programming' | 'stealth';
export type TeamRole = 'leader' | 'officer' | 'operator';
export type RarityType = 'common' | 'rare' | 'epic' | 'legendary';
export type HackStatus = 'hacking' | 'success' | 'failed' | 'detected';
export type StormStatus = 'recruiting' | 'countdown' | 'active' | 'completed' | 'failed';

export interface SocketEvents {
  'hack:update': { sessionId: string; progress: number; detectionRisk: number; remainingTraffic: number };
  'hack:event': { sessionId: string; event: HackEvent };
  'hack:complete': { sessionId: string; success: boolean; rewards: { credits: number; points: number; data: StolenData[] } };
  'market:announce': MarketAnnouncement;
  'storm:update': { stormId: string; participants: StormParticipant[]; totalDamage: number };
  'storm:complete': { stormId: string; success: boolean; totalRewards: number; shares: Array<{ teamId: string; amount: number }> };
}
