import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  Trophy,
  Crown,
  Medal,
  TrendingUp,
  TrendingDown,
  Minus,
  Users,
  Coins,
  Star,
  Zap,
} from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import { cn } from '@/lib/utils';

type RankingType = 'points' | 'wealth' | 'level';

export default function Ranking() {
  const { rankings, getRanking, isLoading, player, team } = useGameStore();
  const [activeType, setActiveType] = useState<RankingType>('points');

  useEffect(() => {
    getRanking(activeType);
  }, [activeType, getRanking]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  };

  const currentRanking = rankings[activeType];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-300" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600" />;
    return <span className="w-6 h-6 flex items-center justify-center font-mono font-bold text-cyber-muted">#{rank}</span>;
  };

  const getTrendIcon = (current: number, previous: number) => {
    if (current < previous) return <TrendingUp className="w-4 h-4 text-cyber-success" />;
    if (current > previous) return <TrendingDown className="w-4 h-4 text-cyber-danger" />;
    return <Minus className="w-4 h-4 text-cyber-muted" />;
  };

  const getTypeConfig = (type: RankingType) => {
    switch (type) {
      case 'points':
        return { icon: <Star className="w-5 h-5" />, label: '积分榜', color: 'text-cyber-primary', unit: '分' };
      case 'wealth':
        return { icon: <Coins className="w-5 h-5" />, label: '财富榜', color: 'text-cyber-warning', unit: '¥' };
      case 'level':
        return { icon: <Zap className="w-5 h-5" />, label: '等级榜', color: 'text-cyber-success', unit: '级' };
    }
  };

  if (!player) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="cyber-card p-8 text-center max-w-md">
          <Trophy className="w-16 h-16 text-cyber-danger mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-cyber-danger mb-2">访问被拒绝</h2>
          <p className="text-cyber-muted">请先登录以查看排行榜</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto p-6 space-y-6"
    >
      <motion.div variants={itemVariants}>
        <h1 className="font-display text-3xl font-bold text-cyber-primary neon-text-cyan mb-2">
          全球排行榜
        </h1>
        <p className="text-cyber-muted font-mono text-sm">
          // 与全球顶尖黑客团队一较高下
        </p>
      </motion.div>

      <motion.div variants={itemVariants} className="flex gap-2">
        {(['points', 'wealth', 'level'] as RankingType[]).map((type) => {
          const config = getTypeConfig(type);
          return (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                'flex items-center gap-2 px-6 py-3 font-display font-bold transition-all',
                activeType === type
                  ? 'cyber-btn'
                  : 'cyber-card hover:border-cyber-primary/50 text-cyber-muted',
              )}
            >
              {config.icon}
              {config.label}
            </button>
          );
        })}
      </motion.div>

      {team && currentRanking && (
        <motion.div variants={itemVariants} className="cyber-card border-cyber-primary/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 bg-cyber-primary/10 rounded-xl">
                <Trophy className="w-8 h-8 text-cyber-primary" />
              </div>
              <div>
                <p className="text-cyber-muted text-sm">我的团队排名</p>
                <h3 className="font-display text-2xl font-bold text-cyber-primary">
                  {team.name}
                </h3>
              </div>
            </div>
            <div className="text-right">
              <p className="text-cyber-muted text-sm">当前排名</p>
              <p className="font-display text-3xl font-bold text-cyber-primary">
                #{currentRanking.entries.find(e => e.teamId === team.id)?.rank || '-'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-cyber-primary border-t-transparent rounded-full" />
        </div>
      ) : currentRanking ? (
        <motion.div variants={itemVariants} className="cyber-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg font-bold text-cyber-primary flex items-center gap-2">
              {getTypeConfig(activeType).icon}
              {getTypeConfig(activeType).label}
            </h3>
            <p className="text-xs text-cyber-muted font-mono">
              更新于 {new Date(currentRanking.lastUpdated).toLocaleString('zh-CN')}
            </p>
          </div>

          <div className="space-y-2">
            {currentRanking.entries.map((entry) => {
              const isMyTeam = team && entry.teamId === team.id;
              const config = getTypeConfig(activeType);

              return (
                <motion.div
                  key={entry.teamId}
                  variants={itemVariants}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-lg transition-all',
                    isMyTeam
                      ? 'bg-cyber-primary/10 border border-cyber-primary/50'
                      : 'bg-cyber-bg-light hover:bg-cyber-primary/5',
                    entry.rank <= 3 && 'border-l-4',
                    entry.rank === 1 && 'border-l-yellow-400',
                    entry.rank === 2 && 'border-l-gray-300',
                    entry.rank === 3 && 'border-l-amber-600',
                  )}
                >
                  <div className="w-10 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-cyber-primary">{entry.teamName}</span>
                      {isMyTeam && (
                        <span className="cyber-badge badge-leader text-xs">我的团队</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-cyber-muted mt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {entry.memberCount} 人
                      </span>
                      <span>Lv.{entry.teamLevel}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getTrendIcon(entry.rank, entry.previousRank)}
                    <div className="text-right">
                      <p className={cn('font-mono text-xl font-bold', config.color)}>
                        {config.unit === '¥' ? '¥' : ''}
                        {entry.value.toLocaleString()}
                        {config.unit !== '¥' ? config.unit : ''}
                      </p>
                      <p className="text-xs text-cyber-muted">
                        {entry.rank < entry.previousRank && (
                          <span className="text-cyber-success">
                            上升 {entry.previousRank - entry.rank} 位
                          </span>
                        )}
                        {entry.rank > entry.previousRank && (
                          <span className="text-cyber-danger">
                            下降 {entry.rank - entry.previousRank} 位
                          </span>
                        )}
                        {entry.rank === entry.previousRank && (
                          <span className="text-cyber-muted">排名不变</span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="cyber-card p-8 text-center max-w-md">
            <Trophy className="w-16 h-16 text-cyber-muted mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-cyber-muted mb-2">暂无排行数据</h2>
            <p className="text-cyber-muted">请稍后再试</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
