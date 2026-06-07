import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Users, Zap, Award, Clock, Crown, Lock, Code, Eye } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import type { Team, TeamMember, PlayerSkills } from '../../shared/types';
import { cn } from '@/lib/utils';
import { getRoleBadgeClass, formatCredits } from '@/data/mockData';

interface TeamDetailModalProps {
  team: Team | null;
  isOpen: boolean;
  onClose: () => void;
}

const skillConfig = {
  cracking: { label: '破解', icon: Lock, color: '#00f5ff' },
  programming: { label: '编程', icon: Code, color: '#ff00ff' },
  stealth: { label: '匿踪', icon: Eye, color: '#00ff88' },
} as const;

const mockRecentBattles = [
  { id: 1, target: '荒坂科技研发服务器', result: 'success', points: 500, date: '2026-06-07' },
  { id: 2, target: '夜之城市民信息库', result: 'success', points: 300, date: '2026-06-06' },
  { id: 3, target: 'NCPD警用通讯系统', result: 'failed', points: 0, date: '2026-06-05' },
  { id: 4, target: '媒体集团新闻资料库', result: 'success', points: 250, date: '2026-06-04' },
  { id: 5, target: '赛博娱乐集团数据库', result: 'success', points: 100, date: '2026-06-03' },
];

const calculateAvgSkills = (members: TeamMember[]): PlayerSkills => {
  if (members.length === 0) return { cracking: 0, programming: 0, stealth: 0 };
  const total = members.reduce(
    (sum, m) => ({
      cracking: sum.cracking + m.skills.cracking,
      programming: sum.programming + m.skills.programming,
      stealth: sum.stealth + m.skills.stealth,
    }),
    { cracking: 0, programming: 0, stealth: 0 }
  );
  return {
    cracking: Math.round(total.cracking / members.length),
    programming: Math.round(total.programming / members.length),
    stealth: Math.round(total.stealth / members.length),
  };
};

export default function TeamDetailModal({ team, isOpen, onClose }: TeamDetailModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!team) return null;

  const avgSkills = calculateAvgSkills(team.members);
  const radarData = Object.entries(skillConfig).map(([key, config]) => ({
    skill: config.label,
    value: avgSkills[key as keyof PlayerSkills],
    fullMark: 100,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto cyber-card p-0"
          >
            <div className="sticky top-0 z-20 bg-cyber-bg-card border-b border-cyber-primary/30 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-cyber-primary" />
                <h2 className="font-display text-xl font-bold text-cyber-primary neon-text-cyan">
                  {team.name}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-cyber-primary/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-cyber-muted hover:text-cyber-primary" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-cyber-bg-light/50 border border-cyber-primary/20">
                  <Zap className="w-5 h-5 text-cyber-warning mx-auto mb-1" />
                  <p className="text-lg font-mono font-bold text-cyber-warning">Lv.{team.level}</p>
                  <p className="text-xs text-cyber-muted">等级</p>
                </div>
                <div className="text-center p-3 bg-cyber-bg-light/50 border border-cyber-primary/20">
                  <Users className="w-5 h-5 text-cyber-primary mx-auto mb-1" />
                  <p className="text-lg font-mono font-bold text-cyber-primary">{team.members.length}</p>
                  <p className="text-xs text-cyber-muted">成员</p>
                </div>
                <div className="text-center p-3 bg-cyber-bg-light/50 border border-cyber-primary/20">
                  <Award className="w-5 h-5 text-cyber-secondary mx-auto mb-1" />
                  <p className="text-lg font-mono font-bold text-cyber-secondary">{team.totalPoints.toLocaleString()}</p>
                  <p className="text-xs text-cyber-muted">总积分</p>
                </div>
                <div className="text-center p-3 bg-cyber-bg-light/50 border border-cyber-primary/20">
                  <Crown className="w-5 h-5 text-cyber-success mx-auto mb-1" />
                  <p className="text-lg font-mono font-bold text-cyber-success">{team.power}</p>
                  <p className="text-xs text-cyber-muted">战力</p>
                </div>
              </div>

              <div className="p-4 bg-cyber-bg-light/30 border border-cyber-secondary/30">
                <p className="text-xs text-cyber-muted font-mono mb-1">团队暗号</p>
                <p className="font-mono text-cyber-secondary neon-text-magenta">
                  {team.codeName}
                </p>
                <p className="text-sm text-cyber-muted mt-2 italic">"{team.motto}"</p>
              </div>

              <div>
                <h3 className="font-display text-sm tracking-wider text-cyber-primary mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  成员列表
                </h3>
                <div className="space-y-2">
                  {team.members.map((member, index) => (
                    <motion.div
                      key={member.playerId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 bg-cyber-bg-light/50 border border-cyber-primary/20 hover:border-cyber-primary/40 transition-colors"
                    >
                      <img
                        src={member.avatar}
                        alt={member.username}
                        className="w-10 h-10 rounded-lg border-2 border-cyber-primary/50"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display font-bold text-white">
                            {member.username}
                          </span>
                          <span className={cn('cyber-badge text-xs', getRoleBadgeClass(member.role))}>
                            {member.role === 'leader' ? '队长' : member.role === 'officer' ? '副队' : '成员'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          {(Object.keys(skillConfig) as Array<keyof PlayerSkills>).map((skillKey) => {
                            const config = skillConfig[skillKey];
                            return (
                              <div key={skillKey} className="flex items-center gap-1">
                                <config.icon className="w-3 h-3" style={{ color: config.color }} />
                                <span className="text-xs font-mono" style={{ color: config.color }}>
                                  {member.skills[skillKey]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-cyber-muted flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          加入
                        </div>
                        <p className="text-xs font-mono text-gray-400">
                          {new Date(member.joinedAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-display text-sm tracking-wider text-cyber-primary mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  综合技能雷达
                </h3>
                <div className="h-64 bg-cyber-bg-light/30 border border-cyber-primary/20 p-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="#00f5ff30" />
                      <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: '#00f5ff', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                      />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fill: '#888', fontSize: 10 }}
                        axisLine={false}
                      />
                      <Radar
                        name="技能值"
                        dataKey="value"
                        stroke="#00f5ff"
                        fill="#00f5ff"
                        fillOpacity={0.3}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="font-display text-sm tracking-wider text-cyber-primary mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  最近战绩
                </h3>
                <div className="space-y-2">
                  {mockRecentBattles.map((battle, index) => (
                    <motion.div
                      key={battle.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-cyber-bg-light/50 border border-cyber-primary/20"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'w-2 h-2 rounded-full',
                            battle.result === 'success' ? 'bg-cyber-success shadow-neon-green' : 'bg-cyber-danger shadow-neon-red'
                          )}
                        />
                        <div>
                          <p className="text-sm text-white">{battle.target}</p>
                          <p className="text-xs text-cyber-muted">{battle.date}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            'font-mono font-bold',
                            battle.result === 'success' ? 'text-cyber-success' : 'text-cyber-danger'
                          )}
                        >
                          {battle.result === 'success' ? `+${battle.points}` : '失败'}
                        </p>
                        {battle.points > 0 && (
                          <p className="text-xs text-cyber-warning">{formatCredits(battle.points * 50)}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
