import type {
  Player,
  Team,
  HackTarget,
  HackSession,
  MarketOrder,
  DataStorm,
  WeeklyReport,
  RankingResponse,
  StolenData,
  MarketAnnouncement,
} from '../../shared/types';

export const mockPlayer: Player = {
  id: 'player-001',
  username: 'NightHawk',
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NightHawk',
  skills: {
    cracking: 75,
    programming: 68,
    stealth: 82,
  },
  reputation: 2450,
  credits: 125000,
  teamId: 'team-001',
  teamRole: 'leader',
  createdAt: '2026-01-15T10:30:00Z',
};

export const mockPlayer2: Player = {
  id: 'player-002',
  username: 'CyberWolf',
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberWolf',
  skills: {
    cracking: 62,
    programming: 85,
    stealth: 70,
  },
  reputation: 1890,
  credits: 89000,
  teamId: 'team-001',
  teamRole: 'officer',
  createdAt: '2026-02-01T14:20:00Z',
};

export const mockPlayer3: Player = {
  id: 'player-003',
  username: 'GhostProtocol',
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=GhostProtocol',
  skills: {
    cracking: 55,
    programming: 60,
    stealth: 90,
  },
  reputation: 1560,
  credits: 67000,
  teamId: 'team-001',
  teamRole: 'operator',
  createdAt: '2026-02-15T09:15:00Z',
};

export const mockPlayer4: Player = {
  id: 'player-004',
  username: 'ZeroDay',
  avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ZeroDay',
  skills: {
    cracking: 45,
    programming: 50,
    stealth: 55,
  },
  reputation: 890,
  credits: 35000,
  teamId: null,
  teamRole: null,
  createdAt: '2026-03-01T16:45:00Z',
};

export const mockTeam: Team = {
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

export const mockHackTargets: HackTarget[] = [
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
    id: 'target-003',
    name: '夜之城市民信息库',
    type: 'government',
    description: '全市居民身份、医疗、教育记录，中等防护等级',
    firewallLevel: 6,
    antiTracking: 5,
    alertProbability: 0.35,
    minPowerRequired: 350,
    rewards: {
      dataTypes: ['citizen_records', 'health_data'],
      minCredits: 25000,
      maxCredits: 75000,
      points: 300,
    },
    estimatedTime: 240,
  },
  {
    id: 'target-004',
    name: 'NCPD警用通讯系统',
    type: 'government',
    description: '实时通讯监听和案件档案，快速响应系统',
    firewallLevel: 7,
    antiTracking: 6,
    alertProbability: 0.40,
    minPowerRequired: 420,
    rewards: {
      dataTypes: ['police_intel', 'case_files'],
      minCredits: 35000,
      maxCredits: 100000,
      points: 400,
    },
    estimatedTime: 280,
  },
  {
    id: 'target-005',
    name: '媒体集团新闻资料库',
    type: 'corporate',
    description: '未公开的新闻素材和机密采访记录，防护一般',
    firewallLevel: 5,
    antiTracking: 4,
    alertProbability: 0.25,
    minPowerRequired: 280,
    rewards: {
      dataTypes: ['unpublished_news', 'source_records'],
      minCredits: 15000,
      maxCredits: 45000,
      points: 250,
    },
    estimatedTime: 180,
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
  {
    id: 'target-007',
    name: '税务总局金融数据库',
    type: 'government',
    description: '企业和个人税务记录，洗钱线索，多重加密',
    firewallLevel: 8,
    antiTracking: 7,
    alertProbability: 0.50,
    minPowerRequired: 550,
    rewards: {
      dataTypes: ['financial_records', 'tax_data'],
      minCredits: 60000,
      maxCredits: 180000,
      points: 600,
    },
    estimatedTime: 320,
  },
];

export const mockStolenData: StolenData[] = [
  {
    id: 'data-001',
    type: 'user_profiles',
    name: '50万用户个人信息包',
    rarity: 'rare',
    baseValue: 8500,
    ownerId: 'player-001',
    createdAt: '2026-06-01T14:30:00Z',
  },
  {
    id: 'data-002',
    type: 'tech_blueprints',
    name: '义体神经接口设计图',
    rarity: 'epic',
    baseValue: 85000,
    ownerId: 'player-001',
    createdAt: '2026-06-03T09:15:00Z',
  },
  {
    id: 'data-003',
    type: 'payment_records',
    name: '黑市交易记录合集',
    rarity: 'common',
    baseValue: 3200,
    ownerId: 'player-002',
    createdAt: '2026-06-02T16:45:00Z',
  },
  {
    id: 'data-004',
    type: 'police_intel',
    name: 'NCPD线人名单',
    rarity: 'legendary',
    baseValue: 125000,
    ownerId: 'player-001',
    createdAt: '2026-06-04T22:10:00Z',
  },
  {
    id: 'data-005',
    type: 'research_data',
    name: 'AI训练数据集',
    rarity: 'rare',
    baseValue: 12000,
    ownerId: 'player-003',
    createdAt: '2026-06-05T11:30:00Z',
  },
];

export const mockMarketOrders: MarketOrder[] = [
  {
    id: 'order-001',
    dataId: 'data-001',
    data: mockStolenData[0],
    sellerId: 'player-001',
    sellerName: 'NightHawk',
    price: 9500,
    suggestedMin: 7650,
    suggestedMax: 11050,
    status: 'listed',
    createdAt: '2026-06-05T12:00:00Z',
  },
  {
    id: 'order-002',
    dataId: 'data-002',
    data: mockStolenData[1],
    sellerId: 'player-001',
    sellerName: 'NightHawk',
    price: 95000,
    suggestedMin: 76500,
    suggestedMax: 110500,
    status: 'listed',
    createdAt: '2026-06-05T13:30:00Z',
  },
  {
    id: 'order-003',
    dataId: 'data-003',
    data: mockStolenData[2],
    sellerId: 'player-002',
    sellerName: 'CyberWolf',
    price: 3500,
    suggestedMin: 2880,
    suggestedMax: 4160,
    status: 'sold',
    createdAt: '2026-06-04T10:00:00Z',
    soldAt: '2026-06-04T15:30:00Z',
    buyerId: 'player-004',
    buyerName: 'ZeroDay',
  },
  {
    id: 'order-004',
    dataId: 'data-005',
    data: mockStolenData[4],
    sellerId: 'player-003',
    sellerName: 'GhostProtocol',
    price: 13500,
    suggestedMin: 10800,
    suggestedMax: 15600,
    status: 'listed',
    createdAt: '2026-06-05T14:00:00Z',
  },
];

export const mockHackSession: HackSession = {
  id: 'session-001',
  teamId: 'team-001',
  targetId: 'target-003',
  target: mockHackTargets[2],
  status: 'hacking',
  progress: 45.5,
  remainingTraffic: 72.3,
  detectionRisk: 38.2,
  startTime: new Date(Date.now() - 120000).toISOString(),
  activeSkills: [
    {
      type: 'cracking',
      boostAmount: 25,
      expiresAt: new Date(Date.now() + 30000).toISOString(),
    },
  ],
  events: [
    {
      id: 'event-001',
      type: 'vulnerability_found',
      description: '发现CVE-2026-7777漏洞，进度提升15%',
      effect: 15,
      isPositive: true,
      createdAt: new Date(Date.now() - 80000).toISOString(),
    },
    {
      id: 'event-002',
      type: 'counter_hack',
      description: '检测到反追踪系统扫描，风险提升10%',
      effect: 10,
      isPositive: false,
      createdAt: new Date(Date.now() - 40000).toISOString(),
    },
  ],
  dataStolen: [],
};

export const mockDataStorm: DataStorm = {
  id: 'storm-001',
  initiatorTeamId: 'team-001',
  initiatorTeamName: 'Black Symphony',
  targetId: 'target-006',
  target: mockHackTargets[5],
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

export const mockWeeklyReport: WeeklyReport = {
  weekStart: '2026-06-01T00:00:00Z',
  weekEnd: '2026-06-07T23:59:59Z',
  teamStats: {
    totalHacks: 24,
    successRate: 79.2,
    totalPoints: 3250,
    totalCreditsEarned: 185000,
  },
  targetHeatmap: [
    { targetId: 'target-001', targetName: '赛博娱乐集团', attackCount: 8, successRate: 100 },
    { targetId: 'target-003', targetName: '夜之城市民信息库', attackCount: 6, successRate: 83.3 },
    { targetId: 'target-005', targetName: '媒体集团', attackCount: 5, successRate: 80 },
    { targetId: 'target-004', targetName: 'NCPD系统', attackCount: 3, successRate: 66.7 },
    { targetId: 'target-002', targetName: '荒坂科技', attackCount: 2, successRate: 50 },
  ],
  teamGrowth: [
    { date: '2026-06-01', power: 420, level: 4 },
    { date: '2026-06-02', power: 435, level: 4 },
    { date: '2026-06-03', power: 450, level: 4 },
    { date: '2026-06-04', power: 465, level: 5 },
    { date: '2026-06-05', power: 480, level: 5 },
    { date: '2026-06-06', power: 485, level: 5 },
    { date: '2026-06-07', power: 485, level: 5 },
  ],
  memberPerformance: [
    { playerId: 'player-001', username: 'NightHawk', hacksParticipated: 24, contributionScore: 95 },
    { playerId: 'player-002', username: 'CyberWolf', hacksParticipated: 22, contributionScore: 88 },
    { playerId: 'player-003', username: 'GhostProtocol', hacksParticipated: 20, contributionScore: 82 },
  ],
  skillDistribution: {
    cracking: 64,
    programming: 71,
    stealth: 81,
  },
};

export const mockRankingPoints: RankingResponse = {
  type: 'points',
  entries: [
    { rank: 1, previousRank: 1, teamId: 'team-top1', teamName: 'Ghost Shell', teamLevel: 12, memberCount: 8, value: 45600 },
    { rank: 2, previousRank: 3, teamId: 'team-top2', teamName: 'Neon Reapers', teamLevel: 10, memberCount: 6, value: 38200 },
    { rank: 3, previousRank: 2, teamId: 'team-top3', teamName: 'Cyber Syndicate', teamLevel: 11, memberCount: 7, value: 35800 },
    { rank: 4, previousRank: 5, teamId: 'team-001', teamName: 'Black Symphony', teamLevel: 5, memberCount: 3, value: 12450 },
    { rank: 5, previousRank: 4, teamId: 'team-top5', teamName: 'Dark Matter', teamLevel: 8, memberCount: 5, value: 28900 },
    { rank: 6, previousRank: 7, teamId: 'team-top6', teamName: 'Byte Knights', teamLevel: 7, memberCount: 4, value: 21500 },
    { rank: 7, previousRank: 6, teamId: 'team-top7', teamName: 'Zero Hour', teamLevel: 9, memberCount: 5, value: 19800 },
    { rank: 8, previousRank: 9, teamId: 'team-top8', teamName: 'Silent Protocol', teamLevel: 6, memberCount: 4, value: 15600 },
    { rank: 9, previousRank: 8, teamId: 'team-top9', teamName: 'Quantum Leap', teamLevel: 7, memberCount: 4, value: 14200 },
    { rank: 10, previousRank: 10, teamId: 'team-top10', teamName: 'Net Runners', teamLevel: 5, memberCount: 3, value: 11000 },
  ],
  lastUpdated: new Date().toISOString(),
};

export const mockRankingWealth: RankingResponse = {
  type: 'wealth',
  entries: [
    { rank: 1, previousRank: 2, teamId: 'team-top1', teamName: 'Cyber Syndicate', teamLevel: 11, memberCount: 7, value: 2580000 },
    { rank: 2, previousRank: 1, teamId: 'team-top2', teamName: 'Ghost Shell', teamLevel: 12, memberCount: 8, value: 2450000 },
    { rank: 3, previousRank: 4, teamId: 'team-top3', teamName: 'Neon Reapers', teamLevel: 10, memberCount: 6, value: 1890000 },
    { rank: 4, previousRank: 3, teamId: 'team-top4', teamName: 'Dark Matter', teamLevel: 8, memberCount: 5, value: 1650000 },
    { rank: 8, previousRank: 10, teamId: 'team-001', teamName: 'Black Symphony', teamLevel: 5, memberCount: 3, value: 281000 },
  ],
  lastUpdated: new Date().toISOString(),
};

export const mockRankingLevel: RankingResponse = {
  type: 'level',
  entries: [
    { rank: 1, previousRank: 1, teamId: 'team-top1', teamName: 'Ghost Shell', teamLevel: 12, memberCount: 8, value: 12 },
    { rank: 2, previousRank: 2, teamId: 'team-top2', teamName: 'Cyber Syndicate', teamLevel: 11, memberCount: 7, value: 11 },
    { rank: 3, previousRank: 3, teamId: 'team-top3', teamName: 'Neon Reapers', teamLevel: 10, memberCount: 6, value: 10 },
    { rank: 15, previousRank: 18, teamId: 'team-001', teamName: 'Black Symphony', teamLevel: 5, memberCount: 3, value: 5 },
  ],
  lastUpdated: new Date().toISOString(),
};

export const mockAnnouncements: MarketAnnouncement[] = [
  {
    id: 'ann-001',
    dataName: 'NCPD线人名单',
    rarity: 'legendary',
    sellerName: 'NightHawk',
    buyerName: 'Anonymous',
    price: 135000,
    timestamp: new Date(Date.now() - 120000).toISOString(),
  },
  {
    id: 'ann-002',
    dataName: '义体神经接口设计图',
    rarity: 'epic',
    sellerName: 'CyberWolf',
    buyerName: 'ShadowBroker',
    price: 92000,
    timestamp: new Date(Date.now() - 300000).toISOString(),
  },
  {
    id: 'ann-003',
    dataName: '50万用户个人信息包',
    rarity: 'rare',
    sellerName: 'GhostProtocol',
    buyerName: 'DataMiner',
    price: 9800,
    timestamp: new Date(Date.now() - 600000).toISOString(),
  },
];

export const calculateTeamPower = (members: Array<{ skills: { cracking: number; programming: number; stealth: number } }>): number => {
  if (members.length === 0) return 0;
  const totalSkills = members.reduce((sum, m) => {
    return sum + m.skills.cracking + m.skills.programming + m.skills.stealth;
  }, 0);
  const avgSkill = totalSkills / members.length;
  return Math.round(avgSkill * members.length * 1.2);
};

export const getRiskLevel = (risk: number): 'low' | 'medium' | 'high' => {
  if (risk < 30) return 'low';
  if (risk < 60) return 'medium';
  return 'high';
};

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'text-gray-400';
    case 'rare': return 'text-cyber-primary';
    case 'epic': return 'text-cyber-secondary';
    case 'legendary': return 'text-cyber-warning';
    default: return 'text-gray-400';
  }
};

export const getRoleBadgeClass = (role: string): string => {
  switch (role) {
    case 'leader': return 'badge-leader';
    case 'officer': return 'badge-officer';
    case 'operator': return 'badge-operator';
    default: return '';
  }
};

export const formatCredits = (amount: number): string => {
  if (amount >= 1000000) {
    return `¥${(amount / 1000000).toFixed(2)}M`;
  }
  if (amount >= 1000) {
    return `¥${(amount / 1000).toFixed(1)}K`;
  }
  return `¥${amount.toFixed(0)}`;
};

export const formatTimeRemaining = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const mockTeams: Record<string, Team> = {
  'team-top1': {
    id: 'team-top1',
    name: 'Ghost Shell',
    codeName: 'GHOST_SHELL',
    motto: 'We are the shadow in the net',
    leaderId: 'player-top1',
    members: [
      { playerId: 'p1', username: 'Major', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Major', role: 'leader', skills: { cracking: 95, programming: 92, stealth: 88 }, joinedAt: '2026-01-01T00:00:00Z' },
      { playerId: 'p2', username: 'Batou', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Batou', role: 'officer', skills: { cracking: 88, programming: 85, stealth: 82 }, joinedAt: '2026-01-02T00:00:00Z' },
      { playerId: 'p3', username: 'Togusa', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Togusa', role: 'operator', skills: { cracking: 78, programming: 75, stealth: 90 }, joinedAt: '2026-01-05T00:00:00Z' },
      { playerId: 'p4', username: 'Ishikawa', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Ishikawa', role: 'operator', skills: { cracking: 90, programming: 95, stealth: 70 }, joinedAt: '2026-01-10T00:00:00Z' },
      { playerId: 'p5', username: 'Saito', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Saito', role: 'operator', skills: { cracking: 85, programming: 70, stealth: 95 }, joinedAt: '2026-01-15T00:00:00Z' },
      { playerId: 'p6', username: 'Pazu', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Pazu', role: 'operator', skills: { cracking: 80, programming: 88, stealth: 75 }, joinedAt: '2026-01-20T00:00:00Z' },
      { playerId: 'p7', username: 'Borma', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Borma', role: 'operator', skills: { cracking: 92, programming: 78, stealth: 80 }, joinedAt: '2026-02-01T00:00:00Z' },
      { playerId: 'p8', username: 'Kuze', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Kuze', role: 'operator', skills: { cracking: 85, programming: 90, stealth: 85 }, joinedAt: '2026-02-10T00:00:00Z' },
    ],
    power: 950,
    level: 12,
    totalPoints: 45600,
    joinCondition: { minReputation: 5000, minSkills: 500 },
    pendingApplications: [],
    createdAt: '2026-01-01T00:00:00Z',
  },
  'team-top2': {
    id: 'team-top2',
    name: 'Neon Reapers',
    codeName: 'NEON_REAPERS',
    motto: 'We come for the data, we leave with everything',
    leaderId: 'player-top2',
    members: [
      { playerId: 'n1', username: 'ReaperKing', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ReaperKing', role: 'leader', skills: { cracking: 85, programming: 90, stealth: 75 }, joinedAt: '2026-01-10T00:00:00Z' },
      { playerId: 'n2', username: 'NeonGhost', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NeonGhost', role: 'officer', skills: { cracking: 80, programming: 85, stealth: 85 }, joinedAt: '2026-01-12T00:00:00Z' },
      { playerId: 'n3', username: 'PixelPirate', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=PixelPirate', role: 'operator', skills: { cracking: 78, programming: 82, stealth: 80 }, joinedAt: '2026-01-15T00:00:00Z' },
      { playerId: 'n4', username: 'DataHunter', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=DataHunter', role: 'operator', skills: { cracking: 88, programming: 75, stealth: 78 }, joinedAt: '2026-01-20T00:00:00Z' },
      { playerId: 'n5', username: 'CodeNinja', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CodeNinja', role: 'operator', skills: { cracking: 75, programming: 92, stealth: 72 }, joinedAt: '2026-02-01T00:00:00Z' },
      { playerId: 'n6', username: 'ByteBandit', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ByteBandit', role: 'operator', skills: { cracking: 82, programming: 78, stealth: 82 }, joinedAt: '2026-02-10T00:00:00Z' },
    ],
    power: 780,
    level: 10,
    totalPoints: 38200,
    joinCondition: { minReputation: 3000, minSkills: 350 },
    pendingApplications: [],
    createdAt: '2026-01-10T00:00:00Z',
  },
  'team-top3': {
    id: 'team-top3',
    name: 'Cyber Syndicate',
    codeName: 'CYBER_SYNDICATE',
    motto: 'In unity, there is power',
    leaderId: 'player-top3',
    members: [
      { playerId: 's1', username: 'SyndicateBoss', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=SyndicateBoss', role: 'leader', skills: { cracking: 90, programming: 88, stealth: 80 }, joinedAt: '2026-01-05T00:00:00Z' },
      { playerId: 's2', username: 'ShadowBroker', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ShadowBroker', role: 'officer', skills: { cracking: 85, programming: 92, stealth: 75 }, joinedAt: '2026-01-08T00:00:00Z' },
      { playerId: 's3', username: 'DarkDealer', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=DarkDealer', role: 'operator', skills: { cracking: 80, programming: 85, stealth: 88 }, joinedAt: '2026-01-12T00:00:00Z' },
      { playerId: 's4', username: 'CryptoKing', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CryptoKing', role: 'operator', skills: { cracking: 92, programming: 78, stealth: 70 }, joinedAt: '2026-01-18T00:00:00Z' },
      { playerId: 's5', username: 'NetMage', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NetMage', role: 'operator', skills: { cracking: 78, programming: 95, stealth: 72 }, joinedAt: '2026-01-25T00:00:00Z' },
      { playerId: 's6', username: 'HackWizard', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=HackWizard', role: 'operator', skills: { cracking: 88, programming: 82, stealth: 78 }, joinedAt: '2026-02-01T00:00:00Z' },
      { playerId: 's7', username: 'ByteSorcerer', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=ByteSorcerer', role: 'operator', skills: { cracking: 82, programming: 88, stealth: 85 }, joinedAt: '2026-02-05T00:00:00Z' },
    ],
    power: 820,
    level: 11,
    totalPoints: 35800,
    joinCondition: { minReputation: 4000, minSkills: 400 },
    pendingApplications: [],
    createdAt: '2026-01-05T00:00:00Z',
  },
  'team-top5': {
    id: 'team-top5',
    name: 'Dark Matter',
    codeName: 'DARK_MATTER',
    motto: 'Silent. Deadly. Everywhere.',
    leaderId: 'player-top5',
    members: [
      { playerId: 'd1', username: 'VoidWalker', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=VoidWalker', role: 'leader', skills: { cracking: 75, programming: 80, stealth: 92 }, joinedAt: '2026-02-01T00:00:00Z' },
      { playerId: 'd2', username: 'Phantom', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Phantom', role: 'officer', skills: { cracking: 70, programming: 75, stealth: 95 }, joinedAt: '2026-02-03T00:00:00Z' },
      { playerId: 'd3', username: 'Wraith', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Wraith', role: 'operator', skills: { cracking: 68, programming: 72, stealth: 90 }, joinedAt: '2026-02-07T00:00:00Z' },
      { playerId: 'd4', username: 'Specter', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Specter', role: 'operator', skills: { cracking: 72, programming: 68, stealth: 88 }, joinedAt: '2026-02-10T00:00:00Z' },
      { playerId: 'd5', username: 'Shadow', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Shadow', role: 'operator', skills: { cracking: 65, programming: 70, stealth: 93 }, joinedAt: '2026-02-15T00:00:00Z' },
    ],
    power: 650,
    level: 8,
    totalPoints: 28900,
    joinCondition: { minReputation: 2500, minSkills: 300 },
    pendingApplications: [],
    createdAt: '2026-02-01T00:00:00Z',
  },
  'team-top6': {
    id: 'team-top6',
    name: 'Byte Knights',
    codeName: 'BYTE_KNIGHTS',
    motto: 'Code is our sword, data is our treasure',
    leaderId: 'player-top6',
    members: [
      { playerId: 'b1', username: 'SirHackalot', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=SirHackalot', role: 'leader', skills: { cracking: 72, programming: 85, stealth: 65 }, joinedAt: '2026-02-15T00:00:00Z' },
      { playerId: 'b2', username: 'CodePaladin', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CodePaladin', role: 'officer', skills: { cracking: 68, programming: 88, stealth: 60 }, joinedAt: '2026-02-17T00:00:00Z' },
      { playerId: 'b3', username: 'BitWarrior', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=BitWarrior', role: 'operator', skills: { cracking: 70, programming: 80, stealth: 62 }, joinedAt: '2026-02-20T00:00:00Z' },
      { playerId: 'b4', username: 'LogicGuard', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=LogicGuard', role: 'operator', skills: { cracking: 65, programming: 82, stealth: 58 }, joinedAt: '2026-02-25T00:00:00Z' },
    ],
    power: 580,
    level: 7,
    totalPoints: 21500,
    joinCondition: { minReputation: 2000, minSkills: 250 },
    pendingApplications: [],
    createdAt: '2026-02-15T00:00:00Z',
  },
  'team-top7': {
    id: 'team-top7',
    name: 'Zero Hour',
    codeName: 'ZERO_HOUR',
    motto: 'We strike when the clock strikes zero',
    leaderId: 'player-top7',
    members: [
      { playerId: 'z1', username: 'TimeBomb', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=TimeBomb', role: 'leader', skills: { cracking: 85, programming: 78, stealth: 75 }, joinedAt: '2026-01-20T00:00:00Z' },
      { playerId: 'z2', username: 'Countdown', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Countdown', role: 'officer', skills: { cracking: 82, programming: 80, stealth: 72 }, joinedAt: '2026-01-22T00:00:00Z' },
      { playerId: 'z3', username: 'Deadline', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Deadline', role: 'operator', skills: { cracking: 80, programming: 75, stealth: 78 }, joinedAt: '2026-01-25T00:00:00Z' },
      { playerId: 'z4', username: 'Midnight', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Midnight', role: 'operator', skills: { cracking: 78, programming: 82, stealth: 70 }, joinedAt: '2026-01-30T00:00:00Z' },
      { playerId: 'z5', username: 'TwelveAM', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=TwelveAM', role: 'operator', skills: { cracking: 75, programming: 70, stealth: 80 }, joinedAt: '2026-02-05T00:00:00Z' },
    ],
    power: 720,
    level: 9,
    totalPoints: 19800,
    joinCondition: { minReputation: 3000, minSkills: 350 },
    pendingApplications: [],
    createdAt: '2026-01-20T00:00:00Z',
  },
  'team-top8': {
    id: 'team-top8',
    name: 'Silent Protocol',
    codeName: 'SILENT_PROTOCOL',
    motto: 'No sound. No trace. Just results.',
    leaderId: 'player-top8',
    members: [
      { playerId: 'sp1', username: 'MuteHacker', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=MuteHacker', role: 'leader', skills: { cracking: 65, programming: 70, stealth: 88 }, joinedAt: '2026-03-01T00:00:00Z' },
      { playerId: 'sp2', username: 'SilentBob', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=SilentBob', role: 'operator', skills: { cracking: 60, programming: 68, stealth: 90 }, joinedAt: '2026-03-03T00:00:00Z' },
      { playerId: 'sp3', username: 'GhostMode', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=GhostMode', role: 'operator', skills: { cracking: 62, programming: 65, stealth: 85 }, joinedAt: '2026-03-07T00:00:00Z' },
      { playerId: 'sp4', username: 'StealthOperative', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=StealthOperative', role: 'operator', skills: { cracking: 58, programming: 62, stealth: 92 }, joinedAt: '2026-03-10T00:00:00Z' },
    ],
    power: 520,
    level: 6,
    totalPoints: 15600,
    joinCondition: { minReputation: 1500, minSkills: 200 },
    pendingApplications: [],
    createdAt: '2026-03-01T00:00:00Z',
  },
  'team-top9': {
    id: 'team-top9',
    name: 'Quantum Leap',
    codeName: 'QUANTUM_LEAP',
    motto: 'We jump through firewalls like they are not there',
    leaderId: 'player-top9',
    members: [
      { playerId: 'q1', username: 'QubitKing', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=QubitKing', role: 'leader', skills: { cracking: 80, programming: 75, stealth: 70 }, joinedAt: '2026-02-25T00:00:00Z' },
      { playerId: 'q2', username: 'Superposition', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Superposition', role: 'operator', skills: { cracking: 75, programming: 80, stealth: 65 }, joinedAt: '2026-02-27T00:00:00Z' },
      { playerId: 'q3', username: 'Entanglement', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=Entanglement', role: 'operator', skills: { cracking: 72, programming: 78, stealth: 68 }, joinedAt: '2026-03-01T00:00:00Z' },
      { playerId: 'q4', username: 'QuantumTunnel', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=QuantumTunnel', role: 'operator', skills: { cracking: 78, programming: 70, stealth: 72 }, joinedAt: '2026-03-05T00:00:00Z' },
    ],
    power: 550,
    level: 7,
    totalPoints: 14200,
    joinCondition: { minReputation: 1800, minSkills: 220 },
    pendingApplications: [],
    createdAt: '2026-02-25T00:00:00Z',
  },
  'team-top10': {
    id: 'team-top10',
    name: 'Net Runners',
    codeName: 'NET_RUNNERS',
    motto: 'The net is our playground',
    leaderId: 'player-top10',
    members: [
      { playerId: 'nr1', username: 'NetSurfer', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=NetSurfer', role: 'leader', skills: { cracking: 60, programming: 65, stealth: 55 }, joinedAt: '2026-03-10T00:00:00Z' },
      { playerId: 'nr2', username: 'WebWalker', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=WebWalker', role: 'operator', skills: { cracking: 58, programming: 62, stealth: 52 }, joinedAt: '2026-03-12T00:00:00Z' },
      { playerId: 'nr3', username: 'CyberCruiser', avatar: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=CyberCruiser', role: 'operator', skills: { cracking: 55, programming: 60, stealth: 58 }, joinedAt: '2026-03-15T00:00:00Z' },
    ],
    power: 420,
    level: 5,
    totalPoints: 11000,
    joinCondition: { minReputation: 1000, minSkills: 150 },
    pendingApplications: [],
    createdAt: '2026-03-10T00:00:00Z',
  },
};
