import { motion } from 'framer-motion';
import {
  User,
  Settings,
  Shield,
  Coins,
  Star,
  Zap,
  Clock,
  Award,
  Edit3,
  LogOut,
  Crown,
} from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import SkillBar from '@/components/SkillBar';

export default function Profile() {
  const { player, team, logout } = useGameStore();
  const navigate = useNavigate();

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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!player) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="cyber-card p-8 text-center max-w-md">
          <User className="w-16 h-16 text-cyber-danger mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-cyber-danger mb-2">访问被拒绝</h2>
          <p className="text-cyber-muted">请先登录以查看个人资料</p>
        </div>
      </div>
    );
  }

  const totalSkills = player.skills.cracking + player.skills.programming + player.skills.stealth;
  const playerLevel = Math.floor(totalSkills / 30) + 1;
  const expToNextLevel = (playerLevel + 1) * 30;
  const currentExp = totalSkills % 30;
  const expProgress = (currentExp / expToNextLevel) * 100;

  const getRoleLabel = (role: string | null) => {
    switch (role) {
      case 'leader': return '团长';
      case 'officer': return '军官';
      case 'operator': return '操作员';
      default: return '自由黑客';
    }
  };

  const getRoleColor = (role: string | null) => {
    switch (role) {
      case 'leader': return 'text-cyber-warning';
      case 'officer': return 'text-cyber-primary';
      case 'operator': return 'text-cyber-success';
      default: return 'text-cyber-muted';
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-bold text-cyber-primary neon-text-cyan mb-2">
          个人资料
        </h1>
        <p className="text-cyber-muted font-mono text-sm">
          // 管理你的黑客身份
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-1 space-y-6">
          <div className="cyber-card text-center">
            <div className="relative inline-block mb-4">
              <img
                src={player.avatar}
                alt={player.username}
                className="w-32 h-32 rounded-xl border-4 border-cyber-primary mx-auto"
              />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
                <span className="cyber-badge badge-leader font-bold">
                  Lv.{playerLevel}
                </span>
              </div>
            </div>

            <h2 className="font-display text-2xl font-bold text-cyber-primary flex items-center justify-center gap-2">
              {player.username}
              {player.teamRole === 'leader' && <Crown className="w-5 h-5 text-cyber-warning" />}
            </h2>

            <p className={cn('font-display font-bold mt-1', getRoleColor(player.teamRole))}>
              {getRoleLabel(player.teamRole)}
            </p>

            {team && (
              <p className="text-cyber-muted text-sm mt-1">
                所属团队: <span className="text-cyber-primary">{team.name}</span>
              </p>
            )}

            <div className="mt-4">
              <div className="flex justify-between text-xs text-cyber-muted mb-1">
                <span>经验值</span>
                <span>{currentExp} / {expToNextLevel}</span>
              </div>
              <div className="progress-bar h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${expProgress}%` }}
                  className="progress-bar-fill"
                  style={{ background: 'linear-gradient(90deg, #00f5ff, #ff00ff)' }}
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button className="cyber-btn flex-1 flex items-center justify-center gap-2">
                <Edit3 className="w-4 h-4" />
                编辑资料
              </button>
              <button
                onClick={handleLogout}
                className="cyber-btn cyber-btn-danger flex-1 flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                退出登录
              </button>
            </div>
          </div>

          <div className="cyber-card">
            <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              账户信息
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-cyber-primary/10">
                <span className="text-cyber-muted">玩家 ID</span>
                <span className="font-mono text-cyber-primary">{player.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-cyber-primary/10">
                <span className="text-cyber-muted">注册时间</span>
                <span className="font-mono text-cyber-primary">
                  {new Date(player.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-cyber-primary/10">
                <span className="text-cyber-muted">总技能值</span>
                <span className="font-mono text-cyber-secondary">{totalSkills}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-cyber-muted">安全等级</span>
                <span className="cyber-badge badge-officer">安全</span>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="cyber-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-warning/10 rounded-lg">
                  <Coins className="w-6 h-6 text-cyber-warning" />
                </div>
                <div>
                  <p className="text-cyber-muted text-xs font-display">账户余额</p>
                  <p className="font-mono text-2xl font-bold text-cyber-warning">
                    ¥{player.credits.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-primary/10 rounded-lg">
                  <Star className="w-6 h-6 text-cyber-primary" />
                </div>
                <div>
                  <p className="text-cyber-muted text-xs font-display">声望值</p>
                  <p className="font-mono text-2xl font-bold text-cyber-primary">
                    {player.reputation.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-success/10 rounded-lg">
                  <Zap className="w-6 h-6 text-cyber-success" />
                </div>
                <div>
                  <p className="text-cyber-muted text-xs font-display">总技能值</p>
                  <p className="font-mono text-2xl font-bold text-cyber-success">
                    {totalSkills}
                  </p>
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-secondary/10 rounded-lg">
                  <Clock className="w-6 h-6 text-cyber-secondary" />
                </div>
                <div>
                  <p className="text-cyber-muted text-xs font-display">活跃天数</p>
                  <p className="font-mono text-2xl font-bold text-cyber-secondary">
                    {Math.floor((Date.now() - new Date(player.createdAt).getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="cyber-card">
            <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              技能属性
            </h3>
            <SkillBar skills={player.skills} />
          </div>

          {team && (
            <div className="cyber-card">
              <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                团队信息
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-cyber-bg-light rounded-lg">
                  <p className="text-cyber-muted text-sm">团队名称</p>
                  <p className="font-display text-xl font-bold text-cyber-primary">{team.name}</p>
                  <p className="text-xs text-cyber-muted mt-1">「{team.codeName}」</p>
                </div>
                <div className="p-4 bg-cyber-bg-light rounded-lg">
                  <p className="text-cyber-muted text-sm">团队等级</p>
                  <p className="font-display text-xl font-bold text-cyber-secondary">Lv.{team.level}</p>
                </div>
                <div className="p-4 bg-cyber-bg-light rounded-lg">
                  <p className="text-cyber-muted text-sm">团队战力</p>
                  <p className="font-display text-xl font-bold text-cyber-success">{team.power.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-cyber-bg-light rounded-lg">
                  <p className="text-cyber-muted text-sm">团队成员</p>
                  <p className="font-display text-xl font-bold text-cyber-warning">{team.members.length} 人</p>
                </div>
              </div>
              <div className="mt-4 p-4 bg-cyber-bg-light rounded-lg">
                <p className="text-cyber-muted text-sm mb-2">团队宣言</p>
                <p className="text-cyber-primary italic">「{team.motto}」</p>
              </div>
            </div>
          )}

          <div className="cyber-card">
            <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              成就徽章
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { name: '初出茅庐', icon: '🌱', unlocked: true },
                { name: '首次入侵', icon: '🎯', unlocked: true },
                { name: '团队创建者', icon: '👥', unlocked: !!team && team.leaderId === player.id },
                { name: '百万富翁', icon: '💰', unlocked: player.credits >= 1000000 },
                { name: '传奇黑客', icon: '🏆', unlocked: player.reputation >= 10000 },
                { name: '技能大师', icon: '⚡', unlocked: totalSkills >= 300 },
                { name: '风暴英雄', icon: '🌪️', unlocked: false },
                { name: '数据猎手', icon: '📊', unlocked: false },
              ].map((achievement, index) => (
                <motion.div
                  key={achievement.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    'p-4 rounded-lg text-center transition-all',
                    achievement.unlocked
                      ? 'bg-cyber-primary/10 border border-cyber-primary/30'
                      : 'bg-cyber-bg-light border border-cyber-muted/20 opacity-50',
                  )}
                >
                  <span className="text-3xl block mb-2">{achievement.icon}</span>
                  <span className={cn(
                    'text-sm font-bold',
                    achievement.unlocked ? 'text-cyber-primary' : 'text-cyber-muted',
                  )}>
                    {achievement.name}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
