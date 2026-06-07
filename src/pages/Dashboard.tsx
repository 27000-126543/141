import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Zap,
  Target,
  TrendingUp,
  Coins,
  Star,
  Shield,
  AlertTriangle,
  Bell,
  Play,
  Plus,
  ArrowRight,
  Activity,
  Crown,
} from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import SkillBar from '@/components/SkillBar';
import TeamPowerMeter from '@/components/TeamPowerMeter';
import { cn } from '@/lib/utils';
import { getRiskLevel, getRarityColor, formatCredits } from '@/data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();
  const { player, team, currentHackSession, announcements, activeDataStorms } = useGameStore();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="cyber-card p-8 text-center max-w-md"
        >
          <Shield className="w-16 h-16 text-cyber-danger mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-cyber-danger mb-2">访问被拒绝</h2>
          <p className="text-cyber-muted mb-6">请先登录系统以访问主控台</p>
          <button
            onClick={() => navigate('/login')}
            className="cyber-btn"
          >
            前往登录
          </button>
        </motion.div>
      </div>
    );
  }

  const totalSkills = player.skills.cracking + player.skills.programming + player.skills.stealth;

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
            <h1 className="font-display text-3xl font-bold text-cyber-primary neon-text-cyan">
              主控台
            </h1>
            <p className="text-cyber-muted font-mono text-sm mt-1">
              // 欢迎回来, {player.username} | {new Date().toLocaleDateString('zh-CN')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-cyber-muted hover:text-cyber-primary cursor-pointer transition-colors" />
              {announcements.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyber-danger rounded-full text-xs flex items-center justify-center text-white">
                  {announcements.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 cyber-card">
              <Coins className="w-5 h-5 text-cyber-warning" />
              <span className="font-mono font-bold text-cyber-warning">
                {formatCredits(player.credits)}
              </span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={itemVariants} className="cyber-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyber-primary/10 rounded-lg">
                <Star className="w-6 h-6 text-cyber-primary" />
              </div>
              <div>
                <p className="text-cyber-muted text-xs font-display">声望</p>
                <p className="font-mono text-2xl font-bold text-cyber-primary">
                  {player.reputation.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="cyber-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyber-secondary/10 rounded-lg">
                <Zap className="w-6 h-6 text-cyber-secondary" />
              </div>
              <div>
                <p className="text-cyber-muted text-xs font-display">总技能值</p>
                <p className="font-mono text-2xl font-bold text-cyber-secondary">
                  {totalSkills}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="cyber-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyber-success/10 rounded-lg">
                <Users className="w-6 h-6 text-cyber-success" />
              </div>
              <div>
                <p className="text-cyber-muted text-xs font-display">团队状态</p>
                <p className="font-mono text-xl font-bold text-cyber-success">
                  {team ? team.name : '无团队'}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="cyber-card">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-cyber-warning/10 rounded-lg">
                <Activity className="w-6 h-6 text-cyber-warning" />
              </div>
              <div>
                <p className="text-cyber-muted text-xs font-display">活跃风暴</p>
                <p className="font-mono text-2xl font-bold text-cyber-warning">
                  {activeDataStorms.length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
            {currentHackSession && (
              <div className="cyber-card border-cyber-danger/50 scan-line">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-danger via-cyber-warning to-cyber-danger animate-pulse" />
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Target className="w-6 h-6 text-cyber-danger" />
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-danger rounded-full animate-ping" />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-cyber-danger">
                        入侵进行中
                      </h3>
                      <p className="text-cyber-muted text-sm">{currentHackSession.target.name}</p>
                    </div>
                  </div>
                  <span className="cyber-badge badge-leader flex items-center gap-1">
                    <Play className="w-3 h-3" /> ACTIVE
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-cyber-muted">入侵进度</span>
                      <span className="font-mono text-cyber-primary">{currentHackSession.progress.toFixed(1)}%</span>
                    </div>
                    <div className="progress-bar">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${currentHackSession.progress}%` }}
                        className="progress-bar-fill"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-cyber-muted">剩余流量</span>
                        <span className="font-mono text-cyber-success">{currentHackSession.remainingTraffic.toFixed(1)}%</span>
                      </div>
                      <div className="progress-bar">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentHackSession.remainingTraffic}%` }}
                          className="progress-bar-fill"
                          style={{ background: 'linear-gradient(90deg, #00ff88, #00f5ff)' }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-cyber-muted">检测风险</span>
                        <span className={cn(
                          'font-mono',
                          getRiskLevel(currentHackSession.detectionRisk) === 'low' && 'text-cyber-success',
                          getRiskLevel(currentHackSession.detectionRisk) === 'medium' && 'text-cyber-warning',
                          getRiskLevel(currentHackSession.detectionRisk) === 'high' && 'text-cyber-danger',
                        )}>
                          {currentHackSession.detectionRisk.toFixed(1)}%
                        </span>
                      </div>
                      <div className="risk-indicator">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${currentHackSession.detectionRisk}%` }}
                          className={cn(
                            'risk-indicator-fill',
                            getRiskLevel(currentHackSession.detectionRisk) === 'low' && 'risk-low',
                            getRiskLevel(currentHackSession.detectionRisk) === 'medium' && 'risk-medium',
                            getRiskLevel(currentHackSession.detectionRisk) === 'high' && 'risk-high',
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/hack')}
                    className="cyber-btn cyber-btn-danger w-full flex items-center justify-center gap-2"
                  >
                    <Target className="w-5 h-5" />
                    继续入侵
                  </button>
                </div>
              </div>
            )}

            {team ? (
              <TeamPowerMeter />
            ) : (
              <motion.div
                variants={itemVariants}
                className="cyber-card text-center py-12"
              >
                <Users className="w-16 h-16 text-cyber-muted mx-auto mb-4" />
                <h3 className="font-display text-xl font-bold text-cyber-primary mb-2">
                  还没有加入团队
                </h3>
                <p className="text-cyber-muted mb-6 max-w-md mx-auto">
                  加入或创建一个团队，与其他黑客一起执行更大规模的入侵行动，分享战利品
                </p>
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => navigate('/team')}
                    className="cyber-btn flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    创建团队
                  </button>
                  <button
                    onClick={() => navigate('/teams')}
                    className="cyber-btn cyber-btn-success flex items-center gap-2"
                  >
                    <Users className="w-5 h-5" />
                    浏览团队
                  </button>
                </div>
              </motion.div>
            )}

            <motion.div variants={itemVariants} className="cyber-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-lg font-bold text-cyber-primary flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  最近公告
                </h3>
                <span className="text-xs text-cyber-muted font-mono">
                  {announcements.length} 条新消息
                </span>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {announcements.slice(0, 5).map((ann, index) => (
                  <motion.div
                    key={ann.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 bg-cyber-bg-light border border-cyber-primary/20 hover:border-cyber-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn('text-sm font-bold', getRarityColor(ann.rarity))}>
                        {ann.dataName}
                      </span>
                      <span className="text-xs text-cyber-warning font-mono">
                        ¥{ann.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-cyber-muted">
                      {ann.sellerName} → {ann.buyerName}
                    </p>
                    <p className="text-xs text-cyber-muted mt-1">
                      {new Date(ann.timestamp).toLocaleTimeString('zh-CN')}
                    </p>
                  </motion.div>
                ))}
                {announcements.length === 0 && (
                  <p className="text-center text-cyber-muted py-8">暂无公告</p>
                )}
              </div>
            </motion.div>
          </motion.div>

          <div className="space-y-6">
            <motion.div variants={itemVariants} className="cyber-card">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={player.avatar}
                  alt={player.username}
                  className="w-12 h-12 rounded-lg border-2 border-cyber-primary"
                />
                <div>
                  <h3 className="font-display font-bold text-cyber-primary flex items-center gap-2">
                    {player.username}
                    {player.teamRole === 'leader' && (
                      <Crown className="w-4 h-4 text-cyber-warning" />
                    )}
                  </h3>
                  <p className="text-xs text-cyber-muted font-mono">
                    ID: {player.id.slice(-8).toUpperCase()}
                  </p>
                </div>
              </div>
              <SkillBar skills={player.skills} />
            </motion.div>

            <motion.div variants={itemVariants} className="cyber-card">
              <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                快速操作
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => navigate('/hack')}
                  className="w-full cyber-btn flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    开始入侵
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/market')}
                  className="w-full cyber-btn cyber-btn-success flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Coins className="w-5 h-5" />
                    数据市场
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/storm')}
                  className="w-full cyber-btn flex items-center justify-between group"
                  style={{ borderColor: '#ff00ff', color: '#ff00ff' }}
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-5 h-5" />
                    数据风暴
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/team')}
                  className="w-full cyber-btn cyber-btn-success flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    团队管理
                  </span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </motion.div>

            {activeDataStorms.length > 0 && (
              <motion.div variants={itemVariants} className="cyber-card border-cyber-secondary/50">
                <h3 className="font-display text-lg font-bold text-cyber-secondary mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  活跃数据风暴
                </h3>
                {activeDataStorms.map((storm) => (
                  <div
                    key={storm.id}
                    className="p-3 bg-cyber-secondary/10 border border-cyber-secondary/30 mb-3 last:mb-0"
                  >
                    <p className="font-bold text-cyber-secondary text-sm mb-1">
                      {storm.target.name}
                    </p>
                    <p className="text-xs text-cyber-muted">
                      发起者: {storm.initiatorTeamName}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-cyber-muted">
                        {storm.participantTeams.length} 支队伍参与
                      </span>
                      <span className="cyber-badge badge-officer text-xs">
                        {storm.status === 'recruiting' ? '招募中' : '进行中'}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
