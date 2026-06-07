import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Crown,
  Settings,
  UserPlus,
  UserX,
  Shield,
  Edit3,
  Check,
  X,
  Target,
  Lock,
  Code,
  Eye,
  Plus,
  AlertCircle,
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { useGameStore } from '@/stores/useGameStore';
import SkillBar from '@/components/SkillBar';
import { cn } from '@/lib/utils';
import { getRoleBadgeClass } from '@/data/mockData';
import type { TeamMember, Application } from '../../shared/types';

export default function Team() {
  const {
    player,
    team,
    createTeam,
    approveApplication,
    changeMemberRole,
    kickMember,
    isLoading,
    error,
    setError,
  } = useGameStore();

  const [showCreateForm, setShowCreateForm] = useState(!team);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedRoleApp, setSelectedRoleApp] = useState<string | null>(null);

  const [teamName, setTeamName] = useState('');
  const [codeName, setCodeName] = useState('');
  const [motto, setMotto] = useState('');
  const [minReputation, setMinReputation] = useState(0);
  const [minSkills, setMinSkills] = useState(0);

  const isLeader = player?.teamRole === 'leader';

  const radarData = useMemo(() => {
    if (!team) return [];
    const avgSkills = team.members.reduce(
      (acc, m) => ({
        cracking: acc.cracking + m.skills.cracking,
        programming: acc.programming + m.skills.programming,
        stealth: acc.stealth + m.skills.stealth,
      }),
      { cracking: 0, programming: 0, stealth: 0 }
    );
    const count = team.members.length;
    return [
      { skill: '破解', value: Math.round(avgSkills.cracking / count), fullMark: 100 },
      { skill: '编程', value: Math.round(avgSkills.programming / count), fullMark: 100 },
      { skill: '匿踪', value: Math.round(avgSkills.stealth / count), fullMark: 100 },
      { skill: '协作', value: Math.round(team.members.length * 20), fullMark: 100 },
      { skill: '声望', value: Math.min(100, Math.round(team.totalPoints / 100)), fullMark: 100 },
      { skill: '经验', value: Math.min(100, team.level * 10), fullMark: 100 },
    ];
  }, [team]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!teamName.trim() || !codeName.trim()) {
      setError('请输入团队名称和暗号');
      return;
    }

    const success = await createTeam(teamName.trim(), codeName.trim(), motto.trim(), minReputation, minSkills);
    if (success) {
      setShowCreateForm(false);
    }
  };

  const handleApprove = async (appId: string, role: 'officer' | 'operator') => {
    await approveApplication(appId, true, role);
    setSelectedRoleApp(null);
  };

  const handleReject = async (appId: string) => {
    await approveApplication(appId, false);
  };

  const handleKickMember = async (playerId: string) => {
    if (window.confirm('确定要踢出该成员吗？')) {
      await kickMember(playerId);
    }
  };

  const handleChangeRole = async (playerId: string, role: 'officer' | 'operator') => {
    await changeMemberRole(playerId, role);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card p-8 text-center max-w-md"
        >
          <Shield className="w-16 h-16 text-cyber-danger mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-cyber-danger mb-2">访问被拒绝</h2>
          <p className="text-cyber-muted">请先登录系统</p>
        </motion.div>
      </div>
    );
  }

  if (showCreateForm && !team) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 grid-bg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg"
        >
          <div className="cyber-card p-8">
            <div className="text-center mb-8">
              <Users className="w-16 h-16 text-cyber-primary mx-auto mb-4" />
              <h1 className="font-display text-2xl font-bold text-cyber-primary neon-text-cyan mb-2">
                创建新团队
              </h1>
              <p className="text-cyber-muted text-sm">
                // 在网络中建立你的势力
              </p>
            </div>

            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                  <Target className="w-4 h-4" />
                  团队名称
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="BLACK_SYNMPHONY"
                  className="cyber-input"
                  maxLength={30}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                  <Code className="w-4 h-4" />
                  团队暗号
                </label>
                <input
                  type="text"
                  value={codeName}
                  onChange={(e) => setCodeName(e.target.value)}
                  placeholder="CYBER_CODE_77"
                  className="cyber-input font-mono"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                  <Edit3 className="w-4 h-4" />
                  团队格言
                </label>
                <textarea
                  value={motto}
                  onChange={(e) => setMotto(e.target.value)}
                  placeholder="We code the night, we own the net"
                  className="cyber-input resize-none h-20"
                  maxLength={100}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                    <Lock className="w-4 h-4" />
                    最低声望要求
                  </label>
                  <input
                    type="number"
                    value={minReputation}
                    onChange={(e) => setMinReputation(Number(e.target.value))}
                    min={0}
                    max={10000}
                    className="cyber-input"
                  />
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                    <Eye className="w-4 h-4" />
                    最低技能总值
                  </label>
                  <input
                    type="number"
                    value={minSkills}
                    onChange={(e) => setMinSkills(Number(e.target.value))}
                    min={0}
                    max={300}
                    className="cyber-input"
                  />
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-cyber-danger/10 border border-cyber-danger/30 text-cyber-danger text-sm font-mono"
                  >
                    ERROR: {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className={cn(
                  'cyber-btn w-full py-3 flex items-center justify-center gap-2',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Plus className="w-5 h-5" />
                {isLoading ? '创建中...' : '创建团队'}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card p-12 text-center max-w-lg"
        >
          <Users className="w-20 h-20 text-cyber-muted mx-auto mb-6" />
          <h2 className="font-display text-2xl font-bold text-cyber-primary mb-3">
            还没有加入团队
          </h2>
          <p className="text-cyber-muted mb-8">
            加入一个团队与其他黑客协作，或创建你自己的团队，在网络中建立势力
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => setShowCreateForm(true)}
              className="cyber-btn flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              创建团队
            </button>
            <button
              className="cyber-btn cyber-btn-success flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              浏览团队
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-6"
      >
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold text-cyber-primary neon-text-cyan flex items-center gap-3">
              <Users className="w-8 h-8" />
              团队管理
            </h1>
            <p className="text-cyber-muted font-mono text-sm mt-1">
              // {team.name} | {team.codeName}
            </p>
          </div>
          {isLeader && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={cn(
                'cyber-btn flex items-center gap-2',
                showSettings && 'border-cyber-secondary text-cyber-secondary'
              )}
            >
              <Settings className={cn('w-5 h-5', showSettings && 'animate-spin')} />
              团队设置
            </button>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="cyber-card">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <div className="flex items-start gap-4 mb-6">
                <div className="p-4 bg-gradient-to-br from-cyber-primary/20 to-cyber-secondary/20 rounded-xl border border-cyber-primary/30">
                  <Users className="w-12 h-12 text-cyber-primary" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display text-2xl font-bold text-cyber-primary mb-1">
                    {team.name}
                  </h2>
                  <p className="font-mono text-cyber-secondary text-sm mb-2">
                    {team.codeName}
                  </p>
                  <p className="text-cyber-muted italic text-sm">
                    "{team.motto}"
                  </p>
                </div>
                <div className="text-right">
                  <div className="cyber-badge badge-leader flex items-center gap-1 mb-1">
                    <Crown className="w-3 h-3" />
                    Lv.{team.level}
                  </div>
                  <p className="font-mono text-cyber-warning font-bold">
                    {team.power} 战力
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-3 bg-cyber-bg-light border border-cyber-primary/20">
                  <p className="font-mono text-2xl font-bold text-cyber-primary">
                    {team.members.length}
                  </p>
                  <p className="text-xs text-cyber-muted font-display">成员</p>
                </div>
                <div className="text-center p-3 bg-cyber-bg-light border border-cyber-secondary/20">
                  <p className="font-mono text-2xl font-bold text-cyber-secondary">
                    {team.totalPoints.toLocaleString()}
                  </p>
                  <p className="text-xs text-cyber-muted font-display">总积分</p>
                </div>
                <div className="text-center p-3 bg-cyber-bg-light border border-cyber-warning/20">
                  <p className="font-mono text-2xl font-bold text-cyber-warning">
                    {team.pendingApplications.length}
                  </p>
                  <p className="text-xs text-cyber-muted font-display">申请</p>
                </div>
              </div>

              <div className="p-4 bg-cyber-bg-light border border-cyber-primary/20">
                <h4 className="font-display text-sm font-bold text-cyber-muted mb-3 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  加入条件
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-cyber-muted">最低声望:</span>
                    <span className="ml-2 font-mono text-cyber-primary">
                      {team.joinCondition.minReputation}
                    </span>
                  </div>
                  <div>
                    <span className="text-cyber-muted">最低技能:</span>
                    <span className="ml-2 font-mono text-cyber-primary">
                      {team.joinCondition.minSkills}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-72">
              <h4 className="font-display text-sm font-bold text-cyber-muted mb-3 text-center">
                团队能力雷达图
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#00f5ff30" />
                  <PolarAngleAxis
                    dataKey="skill"
                    tick={{ fill: '#6b7280', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: '#6b7280', fontSize: 10 }}
                    stroke="#00f5ff30"
                  />
                  <Radar
                    name="团队能力"
                    dataKey="value"
                    stroke="#00f5ff"
                    fill="#00f5ff"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a24',
                      border: '1px solid #00f5ff50',
                      borderRadius: '0',
                      fontFamily: 'JetBrains Mono',
                    }}
                    itemStyle={{ color: '#00f5ff' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>

        <AnimatePresence>
          {showSettings && isLeader && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <motion.div variants={itemVariants} className="cyber-card border-cyber-secondary/50">
                <h3 className="font-display text-lg font-bold text-cyber-secondary mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  团队设置
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                      <Lock className="w-4 h-4" />
                      最低声望要求
                    </label>
                    <input
                      type="number"
                      defaultValue={team.joinCondition.minReputation}
                      className="cyber-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                      <Eye className="w-4 h-4" />
                      最低技能总值
                    </label>
                    <input
                      type="number"
                      defaultValue={team.joinCondition.minSkills}
                      className="cyber-input"
                    />
                  </div>
                </div>
                <div className="mt-4 flex justify-end gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="cyber-btn"
                  >
                    保存设置
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {team.pendingApplications.length > 0 && isLeader && (
          <motion.div variants={itemVariants} className="cyber-card border-cyber-warning/50">
            <h3 className="font-display text-lg font-bold text-cyber-warning mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              待处理申请 ({team.pendingApplications.length})
            </h3>
            <div className="space-y-4">
              {team.pendingApplications.map((app: Application) => (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-cyber-bg-light border border-cyber-warning/30"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={app.playerAvatar}
                      alt={app.playerUsername}
                      className="w-12 h-12 rounded-lg border border-cyber-warning"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-bold text-cyber-warning">
                          {app.playerUsername}
                        </h4>
                        <span className="text-xs text-cyber-muted font-mono">
                          声望: {app.playerReputation}
                        </span>
                      </div>
                      <p className="text-xs text-cyber-muted mb-2">{app.message}</p>
                      <div className="mb-3">
                        <SkillBar skills={app.playerSkills} showLabels={false} />
                      </div>
                      {selectedRoleApp === app.id ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cyber-muted">分配角色:</span>
                          <button
                            onClick={() => handleApprove(app.id, 'officer')}
                            className="cyber-badge badge-officer hover:shadow-neon-cyan transition-all cursor-pointer"
                          >
                            官员
                          </button>
                          <button
                            onClick={() => handleApprove(app.id, 'operator')}
                            className="cyber-badge badge-operator hover:shadow-neon-cyan transition-all cursor-pointer"
                          >
                            操作员
                          </button>
                          <button
                            onClick={() => setSelectedRoleApp(null)}
                            className="cyber-badge text-cyber-danger border-cyber-danger/50 hover:shadow-neon-red transition-all cursor-pointer"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedRoleApp(app.id)}
                            className="cyber-btn cyber-btn-success py-1 px-4 text-xs flex items-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            批准
                          </button>
                          <button
                            onClick={() => handleReject(app.id)}
                            className="cyber-btn cyber-btn-danger py-1 px-4 text-xs flex items-center gap-1"
                          >
                            <X className="w-4 h-4" />
                            拒绝
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div variants={itemVariants} className="cyber-card">
          <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            团队成员 ({team.members.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {team.members.map((member: TeamMember, index: number) => (
              <motion.div
                key={member.playerId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 bg-cyber-bg-light border border-cyber-primary/30 hover:border-cyber-primary/60 transition-all group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <img
                    src={member.avatar}
                    alt={member.username}
                    className="w-14 h-14 rounded-lg border-2 border-cyber-primary/50 group-hover:border-cyber-primary transition-colors"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-cyber-primary">{member.username}</h4>
                      <span className={cn('cyber-badge text-xs', getRoleBadgeClass(member.role))}>
                        {member.role === 'leader' ? (
                          <span className="flex items-center gap-1">
                            <Crown className="w-3 h-3" /> 首领
                          </span>
                        ) : member.role === 'officer' ? '官员' : '操作员'}
                      </span>
                    </div>
                    <p className="text-xs text-cyber-muted font-mono">
                      加入于 {new Date(member.joinedAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                </div>

                <SkillBar skills={member.skills} />

                {isLeader && member.role !== 'leader' && (
                  <div className="mt-4 pt-4 border-t border-cyber-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-cyber-muted">更改角色:</span>
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.playerId, e.target.value as 'officer' | 'operator')}
                        className="bg-cyber-bg border border-cyber-primary/30 text-cyber-primary text-xs px-2 py-1 font-mono focus:outline-none focus:border-cyber-primary"
                      >
                        <option value="officer">官员</option>
                        <option value="operator">操作员</option>
                      </select>
                    </div>
                    <button
                      onClick={() => handleKickMember(member.playerId)}
                      className="text-cyber-danger hover:neon-text-red transition-all p-1"
                      title="踢出成员"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
