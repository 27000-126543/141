import type { Request, Response } from 'express';
import type {
  HackTarget,
  HackSession,
  HackEvent,
  ActiveSkill,
  StolenData,
  APIError,
  SkillType,
} from '../../shared/types.js';
import { getTeamById } from './TeamController.js';
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

const hackSessions = new Map<string, HackSession>();
const sessionTimers = new Map<string, NodeJS.Timeout>();

const eventTypes: Array<{ type: HackEvent['type']; description: string; isPositive: boolean; minEffect: number; maxEffect: number }> = [
  { type: 'vulnerability_found', description: '发现CVE漏洞，进度大幅提升', isPositive: true, minEffect: 10, maxEffect: 25 },
  { type: 'encryption_weakness', description: '检测到加密弱点，获取额外数据', isPositive: true, minEffect: 8, maxEffect: 18 },
  { type: 'counter_hack', description: '检测到反追踪系统扫描', isPositive: false, minEffect: 5, maxEffect: 15 },
  { type: 'system_crash', description: '目标系统出现异常崩溃', isPositive: true, minEffect: 15, maxEffect: 30 },
  { type: 'traffic_spike', description: '网络流量激增，风险上升', isPositive: false, minEffect: 8, maxEffect: 20 },
  { type: 'honeypot', description: '触发蜜罐陷阱！', isPositive: false, minEffect: 20, maxEffect: 35 },
];

const dataNames: Record<string, string[]> = {
  user_profiles: ['用户个人信息包', '账户凭证合集', '社交关系图谱'],
  payment_records: ['交易记录数据库', '信用卡信息包', '黑市交易记录'],
  tech_blueprints: ['义体设计图', '神经接口文档', '芯片架构方案'],
  research_data: ['AI训练数据集', '实验研究报告', '原型测试数据'],
  citizen_records: ['市民身份档案', '人口普查数据', '居住登记信息'],
  health_data: ['医疗健康记录', '精神健康档案', '义体适配数据'],
  police_intel: ['线人名单', '案件调查档案', '警员部署计划'],
  case_files: ['未公开案件卷宗', '证据收集记录', '证人保护档案'],
  unpublished_news: ['新闻原稿素材', '机密采访录音', '调查报告草稿'],
  source_records: ['消息来源档案', '线人联系方式', '情报收集记录'],
  weapon_specs: ['武器系统设计图', '弹道性能数据', '电子对抗方案'],
  military_intel: ['军事部署计划', '兵力配置数据', '战略目标清单'],
  financial_records: ['企业财务报表', '资金流向追踪', '离岸账户数据'],
  tax_data: ['税务申报记录', '资产清查报告', '审计工作底稿'],
};

const getRandomRarity = (): 'common' | 'rare' | 'epic' | 'legendary' => {
  const rand = Math.random();
  if (rand < 0.5) return 'common';
  if (rand < 0.8) return 'rare';
  if (rand < 0.95) return 'epic';
  return 'legendary';
};

const generateStolenData = (target: HackTarget, ownerId: string): StolenData[] => {
  const dataList: StolenData[] = [];
  const dataCount = Math.floor(Math.random() * 3) + 1;

  for (let i = 0; i < dataCount; i++) {
    const dataType = target.rewards.dataTypes[Math.floor(Math.random() * target.rewards.dataTypes.length)];
    const names = dataNames[dataType] || ['未知数据包'];
    const name = names[Math.floor(Math.random() * names.length)];
    const rarity = getRandomRarity();
    const baseMultiplier = rarity === 'common' ? 0.5 : rarity === 'rare' ? 1 : rarity === 'epic' ? 2 : 5;

    dataList.push({
      id: `data-${Date.now()}-${i}`,
      type: dataType,
      name,
      rarity,
      baseValue: Math.round((target.rewards.minCredits + target.rewards.maxCredits) / 4 * baseMultiplier),
      ownerId,
      createdAt: new Date().toISOString(),
    });
  }

  return dataList;
};

const generateHackEvent = (): HackEvent => {
  const eventTemplate = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  const effect = Math.floor(Math.random() * (eventTemplate.maxEffect - eventTemplate.minEffect + 1)) + eventTemplate.minEffect;

  return {
    id: `event-${Date.now()}`,
    type: eventTemplate.type,
    description: eventTemplate.description,
    effect,
    isPositive: eventTemplate.isPositive,
    createdAt: new Date().toISOString(),
  };
};

const calculateActiveSkillBonus = (session: HackSession): number => {
  const now = new Date().toISOString();
  let bonus = 0;
  session.activeSkills = session.activeSkills.filter(skill => skill.expiresAt > now);
  session.activeSkills.forEach(skill => {
    bonus += skill.boostAmount / 100;
  });
  return bonus;
};

const processHackSession = (session: HackSession) => {
  if (session.status !== 'hacking') return;

  const skillBonus = calculateActiveSkillBonus(session);
  const baseProgress = (100 / session.target.estimatedTime) * (1 + skillBonus);

  session.progress = Math.min(100, session.progress + baseProgress);

  const riskChange = (session.target.alertProbability * 2) - skillBonus * 0.5;
  session.detectionRisk = Math.min(100, Math.max(0, session.detectionRisk + riskChange));

  const trafficDrain = 100 / session.target.estimatedTime;
  session.remainingTraffic = Math.max(0, session.remainingTraffic - trafficDrain);

  if (Math.random() < 0.15) {
    const event = generateHackEvent();
    session.events.push(event);

    if (event.isPositive) {
      session.progress = Math.min(100, session.progress + event.effect);
    } else {
      session.detectionRisk = Math.min(100, session.detectionRisk + event.effect);
    }

    io?.emit('hack:event', { sessionId: session.id, event });
  }

  io?.emit('hack:update', {
    sessionId: session.id,
    progress: session.progress,
    detectionRisk: session.detectionRisk,
    remainingTraffic: session.remainingTraffic,
  });

  if (session.detectionRisk >= 100) {
    completeHackSession(session, 'detected');
    return;
  }

  if (session.progress >= 100) {
    completeHackSession(session, 'success');
    return;
  }

  if (session.remainingTraffic <= 0) {
    completeHackSession(session, 'failed');
    return;
  }
};

const completeHackSession = (session: HackSession, status: 'success' | 'failed' | 'detected') => {
  session.status = status;

  const timer = sessionTimers.get(session.id);
  if (timer) {
    clearInterval(timer);
    sessionTimers.delete(session.id);
  }

  let rewards = { credits: 0, points: 0, data: [] as StolenData[] };

  if (status === 'success') {
    const team = getTeamById(session.teamId);
    const credits = Math.floor(Math.random() * (session.target.rewards.maxCredits - session.target.rewards.minCredits + 1)) + session.target.rewards.minCredits;
    const data = generateStolenData(session.target, session.teamId);

    rewards = {
      credits,
      points: session.target.rewards.points,
      data,
    };

    session.dataStolen = data;

    if (team) {
      team.totalPoints += session.target.rewards.points;
    }
  }

  io?.emit('hack:complete', {
    sessionId: session.id,
    success: status === 'success',
    rewards,
  });
};

export const getTargets = async (req: Request, res: Response): Promise<void> => {
  try {
    res.status(200).json(hackTargets);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const startHack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { teamId, targetId } = req.body;

    if (!teamId || !targetId) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Team ID and target ID are required',
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

    if (team.power < target.minPowerRequired) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Team power is insufficient for this target',
        code: 400,
      } as APIError);
      return;
    }

    const activeSessions = Array.from(hackSessions.values()).filter(
      s => s.teamId === teamId && s.status === 'hacking'
    );

    if (activeSessions.length > 0) {
      res.status(409).json({
        error: 'Conflict',
        message: 'Team already has an active hack session',
        code: 409,
      } as APIError);
      return;
    }

    const sessionId = `session-${Date.now()}`;
    const newSession: HackSession = {
      id: sessionId,
      teamId,
      targetId,
      target,
      status: 'hacking',
      progress: 0,
      remainingTraffic: 100,
      detectionRisk: 10 + target.alertProbability * 20,
      startTime: new Date().toISOString(),
      activeSkills: [],
      events: [],
      dataStolen: [],
    };

    hackSessions.set(sessionId, newSession);

    const timer = setInterval(() => {
      const session = hackSessions.get(sessionId);
      if (session) {
        processHackSession(session);
      }
    }, 1000);

    sessionTimers.set(sessionId, timer);

    res.status(201).json(newSession);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const getSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const session = hackSessions.get(id);
    if (!session) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Hack session not found',
        code: 404,
      } as APIError);
      return;
    }

    res.status(200).json(session);
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const useSkill = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { skillType } = req.body;

    if (!skillType) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Skill type is required',
        code: 400,
      } as APIError);
      return;
    }

    const validSkills: SkillType[] = ['cracking', 'programming', 'stealth'];
    if (!validSkills.includes(skillType)) {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Invalid skill type',
        code: 400,
      } as APIError);
      return;
    }

    const session = hackSessions.get(id);
    if (!session) {
      res.status(404).json({
        error: 'Not Found',
        message: 'Hack session not found',
        code: 404,
      } as APIError);
      return;
    }

    if (session.status !== 'hacking') {
      res.status(400).json({
        error: 'Validation Error',
        message: 'Hack session is not active',
        code: 400,
      } as APIError);
      return;
    }

    const existingSkill = session.activeSkills.find(s => s.type === skillType);
    if (existingSkill && new Date(existingSkill.expiresAt) > new Date()) {
      res.status(409).json({
        error: 'Conflict',
        message: 'This skill is already active',
        code: 409,
      } as APIError);
      return;
    }

    const activeSkill: ActiveSkill = {
      type: skillType,
      boostAmount: 30,
      expiresAt: new Date(Date.now() + 30000).toISOString(),
    };

    session.activeSkills = session.activeSkills.filter(s => s.type !== skillType);
    session.activeSkills.push(activeSkill);

    if (skillType === 'stealth') {
      session.detectionRisk = Math.max(0, session.detectionRisk - 15);
    }

    res.status(200).json({
      success: true,
      message: `Skill ${skillType} activated`,
      session,
    });
  } catch {
    res.status(500).json({
      error: 'Server Error',
      message: 'An unexpected error occurred',
      code: 500,
    } as APIError);
  }
};

export const getHackSession = (sessionId: string): HackSession | undefined => {
  return hackSessions.get(sessionId);
};
