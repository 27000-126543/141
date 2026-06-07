import { create } from 'zustand';
import type {
  Player,
  Team,
  HackTarget,
  HackSession,
  MarketOrder,
  DataStorm,
  WeeklyReport,
  RankingResponse,
  MarketAnnouncement,
  StolenData,
  SkillType,
} from '../../shared/types';
import {
  mockPlayer,
  mockTeam,
  mockHackTargets,
  mockHackSession,
  mockMarketOrders,
  mockDataStorm,
  mockWeeklyReport,
  mockRankingPoints,
  mockRankingWealth,
  mockRankingLevel,
  mockAnnouncements,
  mockStolenData,
  calculateTeamPower,
} from '../data/mockData';

interface GameState {
  player: Player | null;
  team: Team | null;
  hackTargets: HackTarget[];
  currentHackSession: HackSession | null;
  marketOrders: MarketOrder[];
  playerInventory: StolenData[];
  activeDataStorms: DataStorm[];
  weeklyReport: WeeklyReport | null;
  rankings: {
    points: RankingResponse | null;
    wealth: RankingResponse | null;
    level: RankingResponse | null;
  };
  announcements: MarketAnnouncement[];
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;

  createTeam: (name: string, codeName: string, motto: string, minReputation: number, minSkills: number) => Promise<boolean>;
  applyToTeam: (teamId: string) => Promise<boolean>;
  approveApplication: (applicationId: string, approve: boolean, role?: 'officer' | 'operator') => Promise<boolean>;
  changeMemberRole: (playerId: string, role: 'officer' | 'operator') => Promise<boolean>;
  kickMember: (playerId: string) => Promise<boolean>;

  startHack: (targetId: string) => Promise<boolean>;
  useSkill: (skillType: SkillType) => Promise<boolean>;
  updateHackProgress: (sessionId: string, progress: number, risk: number, traffic: number) => void;
  completeHack: (sessionId: string, success: boolean) => void;

  listDataForSale: (dataId: string, price: number) => Promise<boolean>;
  buyData: (orderId: string) => Promise<boolean>;
  cancelListing: (orderId: string) => Promise<boolean>;

  createDataStorm: (targetId: string) => Promise<boolean>;
  joinDataStorm: (stormId: string) => Promise<boolean>;

  getWeeklyReport: () => Promise<void>;
  getRanking: (type: 'points' | 'wealth' | 'level') => Promise<void>;

  addAnnouncement: (announcement: MarketAnnouncement) => void;
  setError: (error: string | null) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  player: null,
  team: null,
  hackTargets: [],
  currentHackSession: null,
  marketOrders: [],
  playerInventory: [],
  activeDataStorms: [],
  weeklyReport: null,
  rankings: {
    points: null,
    wealth: null,
    level: null,
  },
  announcements: [],
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '登录失败');
      }

      const data = await response.json();
      const { token, player } = data;

      localStorage.setItem('auth_token', token);

      const inventory = mockStolenData.filter(d => d.ownerId === player.id);

      set({
        player,
        team: mockTeam,
        hackTargets: mockHackTargets,
        marketOrders: mockMarketOrders,
        playerInventory: inventory,
        activeDataStorms: [mockDataStorm],
        announcements: mockAnnouncements,
        isAuthenticated: true,
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '登录失败，请检查用户名和密码',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, confirmPassword: password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '注册失败');
      }

      const data = await response.json();
      const { token, player } = data;

      localStorage.setItem('auth_token', token);

      set({
        player,
        isAuthenticated: true,
        isLoading: false,
        hackTargets: mockHackTargets,
      });
      return true;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '注册失败，用户名可能已存在',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    set({
      player: null,
      team: null,
      currentHackSession: null,
      isAuthenticated: false,
    });
  },

  createTeam: async (name: string, codeName: string, motto: string, minReputation: number, minSkills: number) => {
    set({ isLoading: true, error: null });
    const { player } = get();
    if (!player) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const newTeam: Team = {
        id: `team-${Date.now()}`,
        name,
        codeName,
        motto,
        leaderId: player.id,
        members: [
          {
            playerId: player.id,
            username: player.username,
            avatar: player.avatar,
            role: 'leader',
            skills: player.skills,
            joinedAt: new Date().toISOString(),
          },
        ],
        power: calculateTeamPower([{ skills: player.skills }]),
        level: 1,
        totalPoints: 0,
        joinCondition: {
          minReputation,
          minSkills,
        },
        pendingApplications: [],
        createdAt: new Date().toISOString(),
      };

      const updatedPlayer: Player = {
        ...player,
        teamId: newTeam.id,
        teamRole: 'leader',
      };

      set({ team: newTeam, player: updatedPlayer, isLoading: false });
      return true;
    } catch (error) {
      set({ error: '创建团队失败', isLoading: false });
      return false;
    }
  },

  applyToTeam: async (teamId: string) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: '申请失败', isLoading: false });
      return false;
    }
  },

  approveApplication: async (applicationId: string, approve: boolean, role: 'officer' | 'operator' = 'operator') => {
    set({ isLoading: true, error: null });
    const { team } = get();
    if (!team) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const application = team.pendingApplications.find(a => a.id === applicationId);
      
      if (approve && application) {
        const newMember: Team = {
          ...team,
          members: [
            ...team.members,
            {
              playerId: application.playerId,
              username: application.playerUsername,
              avatar: application.playerAvatar,
              role,
              skills: application.playerSkills,
              joinedAt: new Date().toISOString(),
            },
          ],
          pendingApplications: team.pendingApplications.filter(a => a.id !== applicationId),
        };
        newMember.power = calculateTeamPower(newMember.members);
        set({ team: newMember, isLoading: false });
      } else {
        set({
          team: {
            ...team,
            pendingApplications: team.pendingApplications.filter(a => a.id !== applicationId),
          },
          isLoading: false,
        });
      }
      return true;
    } catch (error) {
      set({ error: '审批失败', isLoading: false });
      return false;
    }
  },

  changeMemberRole: async (playerId: string, role: 'officer' | 'operator') => {
    set({ isLoading: true, error: null });
    const { team } = get();
    if (!team) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({
        team: {
          ...team,
          members: team.members.map(m =>
            m.playerId === playerId ? { ...m, role } : m
          ),
        },
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ error: '更改角色失败', isLoading: false });
      return false;
    }
  },

  kickMember: async (playerId: string) => {
    set({ isLoading: true, error: null });
    const { team } = get();
    if (!team) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedTeam = {
        ...team,
        members: team.members.filter(m => m.playerId !== playerId),
      };
      updatedTeam.power = calculateTeamPower(updatedTeam.members);
      set({ team: updatedTeam, isLoading: false });
      return true;
    } catch (error) {
      set({ error: '踢出成员失败', isLoading: false });
      return false;
    }
  },

  startHack: async (targetId: string) => {
    set({ isLoading: true, error: null });
    const { team, hackTargets } = get();
    if (!team) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const target = hackTargets.find(t => t.id === targetId);
      if (!target) {
        set({ error: '目标不存在', isLoading: false });
        return false;
      }

      if (team.power < target.minPowerRequired) {
        set({ error: '团队能力不足，无法入侵此目标', isLoading: false });
        return false;
      }

      const session: HackSession = {
        id: `session-${Date.now()}`,
        teamId: team.id,
        targetId,
        target,
        status: 'hacking',
        progress: 0,
        remainingTraffic: 100,
        detectionRisk: target.alertProbability * 20,
        startTime: new Date().toISOString(),
        activeSkills: [],
        events: [],
        dataStolen: [],
      };

      set({ currentHackSession: session, isLoading: false });
      return true;
    } catch (error) {
      set({ error: '启动入侵失败', isLoading: false });
      return false;
    }
  },

  useSkill: async (skillType: SkillType) => {
    set({ isLoading: true, error: null });
    const { currentHackSession, player } = get();
    if (!currentHackSession || !player) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const skillValue = player.skills[skillType];
      const boostAmount = skillValue * 0.3;
      
      const updatedSession: HackSession = {
        ...currentHackSession,
        activeSkills: [
          ...currentHackSession.activeSkills,
          {
            type: skillType,
            boostAmount,
            expiresAt: new Date(Date.now() + 15000).toISOString(),
          },
        ],
      };

      if (skillType === 'cracking') {
        updatedSession.progress = Math.min(100, updatedSession.progress + boostAmount * 0.5);
      } else if (skillType === 'programming') {
        updatedSession.remainingTraffic = Math.min(100, updatedSession.remainingTraffic + boostAmount * 0.3);
      } else if (skillType === 'stealth') {
        updatedSession.detectionRisk = Math.max(0, updatedSession.detectionRisk - boostAmount * 0.4);
      }

      set({ currentHackSession: updatedSession, isLoading: false });
      return true;
    } catch (error) {
      set({ error: '使用技能失败', isLoading: false });
      return false;
    }
  },

  updateHackProgress: (sessionId: string, progress: number, risk: number, traffic: number) => {
    const { currentHackSession } = get();
    if (!currentHackSession || currentHackSession.id !== sessionId) return;

    set({
      currentHackSession: {
        ...currentHackSession,
        progress: Math.min(100, Math.max(0, progress)),
        detectionRisk: Math.min(100, Math.max(0, risk)),
        remainingTraffic: Math.min(100, Math.max(0, traffic)),
      },
    });
  },

  completeHack: (sessionId: string, success: boolean) => {
    const { currentHackSession, player, team, playerInventory } = get();
    if (!currentHackSession || !player || !team) return;

    if (success) {
      const target = currentHackSession.target;
      const creditsEarned = Math.floor(
        target.rewards.minCredits + Math.random() * (target.rewards.maxCredits - target.rewards.minCredits)
      );
      
      const newData: StolenData[] = target.rewards.dataTypes.map((type, index) => {
        const rarityRoll = Math.random();
        let rarity: 'common' | 'rare' | 'epic' | 'legendary' = 'common';
        if (rarityRoll > 0.95) rarity = 'legendary';
        else if (rarityRoll > 0.8) rarity = 'epic';
        else if (rarityRoll > 0.5) rarity = 'rare';

        const rarityMultiplier = rarity === 'legendary' ? 5 : rarity === 'epic' ? 3 : rarity === 'rare' ? 2 : 1;
        const baseValue = Math.floor((target.rewards.minCredits / target.rewards.dataTypes.length) * rarityMultiplier);

        return {
          id: `data-${Date.now()}-${index}`,
          type,
          name: `${type}_${Date.now()}`,
          rarity,
          baseValue,
          ownerId: player.id,
          createdAt: new Date().toISOString(),
        };
      });

      set({
        currentHackSession: {
          ...currentHackSession,
          status: 'success',
          progress: 100,
          dataStolen: newData,
        },
        player: {
          ...player,
          credits: player.credits + creditsEarned,
          reputation: player.reputation + Math.floor(target.rewards.points / 10),
        },
        team: {
          ...team,
          totalPoints: team.totalPoints + target.rewards.points,
        },
        playerInventory: [...playerInventory, ...newData],
      });
    } else {
      set({
        currentHackSession: {
          ...currentHackSession,
          status: 'failed',
        },
        player: player ? {
          ...player,
          reputation: Math.max(0, player.reputation - 50),
        } : null,
      });
    }
  },

  listDataForSale: async (dataId: string, price: number) => {
    set({ isLoading: true, error: null });
    const { player, playerInventory, marketOrders } = get();
    if (!player) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const data = playerInventory.find(d => d.id === dataId);
      if (!data) {
        set({ error: '数据不存在', isLoading: false });
        return false;
      }

      const suggestedMin = Math.floor(data.baseValue * 0.9);
      const suggestedMax = Math.floor(data.baseValue * 1.3);

      const newOrder: MarketOrder = {
        id: `order-${Date.now()}`,
        dataId,
        data,
        sellerId: player.id,
        sellerName: player.username,
        price,
        suggestedMin,
        suggestedMax,
        status: 'listed',
        createdAt: new Date().toISOString(),
      };

      set({
        marketOrders: [...marketOrders, newOrder],
        playerInventory: playerInventory.filter(d => d.id !== dataId),
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ error: '上架失败', isLoading: false });
      return false;
    }
  },

  buyData: async (orderId: string) => {
    set({ isLoading: true, error: null });
    const { player, marketOrders, playerInventory } = get();
    if (!player) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const order = marketOrders.find(o => o.id === orderId);
      if (!order || order.status !== 'listed') {
        set({ error: '订单不存在或已售出', isLoading: false });
        return false;
      }

      if (player.credits < order.price) {
        set({ error: '余额不足', isLoading: false });
        return false;
      }

      const announcement: MarketAnnouncement = {
        id: `ann-${Date.now()}`,
        dataName: order.data.name,
        rarity: order.data.rarity,
        sellerName: order.sellerName,
        buyerName: player.username,
        price: order.price,
        timestamp: new Date().toISOString(),
      };

      set({
        player: {
          ...player,
          credits: player.credits - order.price,
        },
        marketOrders: marketOrders.map(o =>
          o.id === orderId
            ? { ...o, status: 'sold', buyerId: player.id, buyerName: player.username, soldAt: new Date().toISOString() }
            : o
        ),
        playerInventory: [...playerInventory, { ...order.data, ownerId: player.id }],
        announcements: [announcement, ...get().announcements].slice(0, 50),
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ error: '购买失败', isLoading: false });
      return false;
    }
  },

  cancelListing: async (orderId: string) => {
    set({ isLoading: true, error: null });
    const { marketOrders, playerInventory } = get();

    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      const order = marketOrders.find(o => o.id === orderId);
      if (!order) {
        set({ error: '订单不存在', isLoading: false });
        return false;
      }

      set({
        marketOrders: marketOrders.filter(o => o.id !== orderId),
        playerInventory: [...playerInventory, order.data],
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ error: '取消上架失败', isLoading: false });
      return false;
    }
  },

  createDataStorm: async (targetId: string) => {
    set({ isLoading: true, error: null });
    const { team, hackTargets, activeDataStorms, player } = get();
    if (!team || !player || team.leaderId !== player.id) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const target = hackTargets.find(t => t.id === targetId);
      if (!target) {
        set({ error: '目标不存在', isLoading: false });
        return false;
      }

      const newStorm: DataStorm = {
        id: `storm-${Date.now()}`,
        initiatorTeamId: team.id,
        initiatorTeamName: team.name,
        targetId,
        target,
        status: 'recruiting',
        participantTeams: [
          {
            teamId: team.id,
            teamName: team.name,
            contribution: 0,
            players: team.members.map(m => m.playerId),
            rewardShare: 0,
          },
        ],
        startTime: new Date().toISOString(),
        countdownEndTime: new Date(Date.now() + 300000).toISOString(),
        totalDamage: 0,
      };

      set({
        activeDataStorms: [...activeDataStorms, newStorm],
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ error: '创建数据风暴失败', isLoading: false });
      return false;
    }
  },

  joinDataStorm: async (stormId: string) => {
    set({ isLoading: true, error: null });
    const { team, activeDataStorms, player } = get();
    if (!team || !player) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      set({
        activeDataStorms: activeDataStorms.map(s =>
          s.id === stormId
            ? {
                ...s,
                participantTeams: [
                  ...s.participantTeams,
                  {
                    teamId: team.id,
                    teamName: team.name,
                    contribution: 0,
                    players: team.members.map(m => m.playerId),
                    rewardShare: 0,
                  },
                ],
              }
            : s
        ),
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({ error: '加入数据风暴失败', isLoading: false });
      return false;
    }
  },

  getWeeklyReport: async () => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 600));
      set({ weeklyReport: mockWeeklyReport, isLoading: false });
    } catch (error) {
      set({ error: '获取周报失败', isLoading: false });
    }
  },

  getRanking: async (type: 'points' | 'wealth' | 'level') => {
    set({ isLoading: true, error: null });
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const mockData = type === 'points' ? mockRankingPoints : type === 'wealth' ? mockRankingWealth : mockRankingLevel;
      set(state => ({
        rankings: { ...state.rankings, [type]: mockData },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: '获取排行榜失败', isLoading: false });
    }
  },

  addAnnouncement: (announcement: MarketAnnouncement) => {
    set(state => ({
      announcements: [announcement, ...state.announcements].slice(0, 50),
    }));
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));
