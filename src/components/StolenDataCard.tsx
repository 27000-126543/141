import { motion } from 'framer-motion';
import { Database } from 'lucide-react';
import type { StolenData, RarityType } from '../../shared/types';
import { cn } from '@/lib/utils';
import { formatCredits } from '../data/mockData';

interface StolenDataCardProps {
  data: StolenData;
  price?: number;
  showActions?: boolean;
  onList?: () => void;
  onClick?: () => void;
  className?: string;
}

const rarityConfig: Record<RarityType, { label: string; borderColor: string; bgColor: string }> = {
  common: {
    label: '普通',
    borderColor: 'border-gray-400/50',
    bgColor: 'from-gray-400/10 to-gray-400/5',
  },
  rare: {
    label: '稀有',
    borderColor: 'border-cyber-primary/50',
    bgColor: 'from-cyber-primary/10 to-cyber-primary/5',
  },
  epic: {
    label: '史诗',
    borderColor: 'border-cyber-secondary/50',
    bgColor: 'from-cyber-secondary/10 to-cyber-secondary/5',
  },
  legendary: {
    label: '传奇',
    borderColor: 'border-cyber-warning/50',
    bgColor: 'from-cyber-warning/10 to-cyber-warning/5',
  },
};

export default function StolenDataCard({
  data,
  price,
  showActions = false,
  onList,
  onClick,
  className,
}: StolenDataCardProps) {
  const config = rarityConfig[data.rarity];
  const isLegendary = data.rarity === 'legendary';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={onClick}
      className={cn(
        'relative p-4 border-2 bg-gradient-to-br cursor-pointer transition-all duration-300',
        config.borderColor,
        config.bgColor,
        isLegendary && 'shadow-neon-yellow',
        onClick && 'hover:shadow-lg',
        className
      )}
      style={{
        clipPath: 'polygon(0 0, 100% 0, 100% 85%, 92% 100%, 0 100%)',
      }}
    >
      {isLegendary && (
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-warning/20 via-transparent to-cyber-warning/20 animate-pulse pointer-events-none" />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className={cn('w-5 h-5', `text-${data.rarity === 'common' ? 'gray-400' : data.rarity === 'rare' ? 'cyber-primary' : data.rarity === 'epic' ? 'cyber-secondary' : 'cyber-warning'}`)} />
            <span
              className={cn(
                'cyber-badge border',
                `rarity-${data.rarity}`
              )}
            >
              {config.label}
            </span>
          </div>
          <span className="text-xs text-cyber-muted font-mono">{data.type}</span>
        </div>

        <h3 className={cn(
          'font-display font-bold text-sm mb-2 line-clamp-2',
          `rarity-${data.rarity}`
        )}>
          {data.name}
        </h3>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-xs text-cyber-muted">系统估值</span>
            <p className="font-mono font-bold text-cyber-success">
              {formatCredits(price ?? data.baseValue)}
            </p>
          </div>

          {showActions && onList && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onList();
              }}
              className="cyber-btn cyber-btn-success text-xs px-4 py-1"
            >
              上架
            </motion.button>
          )}
        </div>
      </div>

      {isLegendary && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyber-warning rounded-full animate-ping" />
      )}
    </motion.div>
  );
}
