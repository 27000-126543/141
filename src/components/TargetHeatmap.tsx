import { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Zap, CheckCircle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TargetHeatmapItem {
  targetId: string;
  targetName: string;
  attackCount: number;
  successRate: number;
}

interface TargetHeatmapProps {
  data: TargetHeatmapItem[];
}

export default function TargetHeatmap({ data }: TargetHeatmapProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const maxAttacks = Math.max(...data.map(d => d.attackCount), 1);

  const getSuccessColor = (rate: number) => {
    if (rate >= 80) return { color: '#00ff88', glow: 'shadow-neon-green' };
    if (rate >= 50) return { color: '#ffcc00', glow: 'shadow-neon-yellow' };
    return { color: '#ff3366', glow: 'shadow-neon-red' };
  };

  const getGradient = (rate: number) => {
    if (rate >= 80) return 'linear-gradient(90deg, #00ff8833, #00ff88)';
    if (rate >= 50) return 'linear-gradient(90deg, #ffcc0033, #ffcc00)';
    return 'linear-gradient(90deg, #ff336633, #ff3366)';
  };

  return (
    <div className="space-y-4">
      {data.map((item, index) => {
        const widthPercent = (item.attackCount / maxAttacks) * 100;
        const colorScheme = getSuccessColor(item.successRate);
        const isHovered = hoveredId === item.targetId;

        return (
          <motion.div
            key={item.targetId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            onMouseEnter={() => setHoveredId(item.targetId)}
            onMouseLeave={() => setHoveredId(null)}
            className="relative group"
          >
            <div className="flex items-center gap-4">
              <div className="w-32 flex-shrink-0">
                <p className="text-sm font-display text-gray-300 truncate">
                  {item.targetName}
                </p>
              </div>

              <div className="flex-1 relative h-8 bg-cyber-bg-light border border-cyber-primary/20 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${widthPercent}%` }}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1, ease: 'easeOut' }}
                  className="absolute inset-y-0 left-0"
                  style={{
                    background: getGradient(item.successRate),
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-data-flow" />
                </motion.div>

                <div className="absolute inset-0 flex items-center px-3 justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyber-warning" />
                    <span className="font-mono text-sm font-bold text-white">
                      {item.attackCount} 次攻击
                    </span>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 px-2 py-0.5 rounded border',
                      colorScheme.glow
                    )}
                    style={{
                      borderColor: `${colorScheme.color}50`,
                      backgroundColor: `${colorScheme.color}20`,
                    }}
                  >
                    {item.successRate >= 80 ? (
                      <CheckCircle className="w-3 h-3" style={{ color: colorScheme.color }} />
                    ) : item.successRate >= 50 ? (
                      <Target className="w-3 h-3" style={{ color: colorScheme.color }} />
                    ) : (
                      <XCircle className="w-3 h-3" style={{ color: colorScheme.color }} />
                    )}
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: colorScheme.color }}
                    >
                      {item.successRate}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: isHovered ? 1 : 0,
                height: isHovered ? 'auto' : 0,
              }}
              className="overflow-hidden"
            >
              <div className="mt-2 p-3 bg-cyber-bg-light/50 border border-cyber-primary/20 ml-36">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-cyber-muted text-xs">攻击次数</p>
                    <p className="font-mono font-bold text-cyber-primary">
                      {item.attackCount} 次
                    </p>
                  </div>
                  <div>
                    <p className="text-cyber-muted text-xs">成功率</p>
                    <p
                      className="font-mono font-bold"
                      style={{ color: colorScheme.color }}
                    >
                      {item.successRate}%
                    </p>
                  </div>
                  <div>
                    <p className="text-cyber-muted text-xs">成功次数</p>
                    <p className="font-mono font-bold text-cyber-success">
                      {Math.floor(item.attackCount * item.successRate / 100)} 次
                    </p>
                  </div>
                  <div>
                    <p className="text-cyber-muted text-xs">失败次数</p>
                    <p className="font-mono font-bold text-cyber-danger">
                      {item.attackCount - Math.floor(item.attackCount * item.successRate / 100)} 次
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );
      })}

      <div className="flex items-center justify-center gap-6 pt-4 border-t border-cyber-primary/20 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(90deg, #ff336633, #ff3366)' }} />
          <span className="text-xs text-cyber-muted">低成功率 {'<'}50%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(90deg, #ffcc0033, #ffcc00)' }} />
          <span className="text-xs text-cyber-muted">中成功率 50-80%</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-sm" style={{ background: 'linear-gradient(90deg, #00ff8833, #00ff88)' }} />
          <span className="text-xs text-cyber-muted">高成功率 {'>'}80%</span>
        </div>
      </div>
    </div>
  );
}
