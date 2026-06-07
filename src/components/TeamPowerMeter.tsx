import { motion } from 'framer-motion';
import { Zap, TrendingUp } from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';

export default function TeamPowerMeter() {
  const { team } = useGameStore();
  const power = team?.power || 0;
  const level = team?.level || 1;
  const maxPower = 1000;
  const displayPower = Math.min(maxPower, Math.max(0, power));
  const percentage = (displayPower / maxPower) * 100;

  const getPowerColor = (p: number) => {
    if (p >= 800) return { from: '#ff00ff', to: '#ff3366', glow: 'shadow-neon-magenta' };
    if (p >= 500) return { from: '#00f5ff', to: '#ff00ff', glow: 'shadow-neon-cyan' };
    if (p >= 300) return { from: '#00ff88', to: '#00f5ff', glow: 'shadow-neon-green' };
    return { from: '#00f5ff', to: '#00ff88', glow: '' };
  };

  const colorScheme = getPowerColor(displayPower);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="cyber-card"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-cyber-warning" />
          <span className="font-display text-sm tracking-wider text-gray-400">团队能力值</span>
        </div>
        <div className="flex items-center gap-1 text-cyber-warning">
          <TrendingUp className="w-4 h-4" />
          <span className="font-mono text-xs">Lv.{level}</span>
        </div>
      </div>

      <div className="flex items-end gap-3 mb-3">
        <motion.span
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="font-display text-4xl font-bold neon-text-cyan text-cyber-primary"
        >
          {displayPower}
        </motion.span>
        <span className="text-cyber-muted text-sm mb-1">/ {maxPower}</span>
      </div>

      <div className="progress-bar h-4">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: 0.4, ease: 'easeOut' }}
          className={`progress-bar-fill h-full ${colorScheme.glow}`}
          style={{
            background: `linear-gradient(90deg, ${colorScheme.from}, ${colorScheme.to})`,
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-data-flow" />
        </motion.div>
      </div>

      <div className="flex justify-between mt-2">
        <span className="text-xs text-cyber-muted">新手</span>
        <span className="text-xs text-cyber-muted">精英</span>
        <span className="text-xs text-cyber-muted">传奇</span>
      </div>

      <div className="mt-4 pt-4 border-t border-cyber-primary/20">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-bold text-cyber-primary">{team?.members.length || 0}</p>
            <p className="text-xs text-cyber-muted">成员</p>
          </div>
          <div>
            <p className="text-lg font-bold text-cyber-secondary">{team?.totalPoints?.toLocaleString() || 0}</p>
            <p className="text-xs text-cyber-muted">总积分</p>
          </div>
          <div>
            <p className="text-lg font-bold text-cyber-warning">
              {team?.pendingApplications?.length || 0}
            </p>
            <p className="text-xs text-cyber-muted">申请</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
