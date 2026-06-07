import { motion } from 'framer-motion';
import { Clock, User } from 'lucide-react';
import type { MarketOrder } from '../../shared/types';
import { cn } from '@/lib/utils';
import { formatCredits } from '../data/mockData';

interface MarketOrderCardProps {
  order: MarketOrder;
  playerCredits: number;
  onClick: () => void;
  onBuy: () => void;
}

export default function MarketOrderCard({
  order,
  playerCredits,
  onClick,
  onBuy,
}: MarketOrderCardProps) {
  const canAfford = playerCredits >= order.price;
  const isBelowSuggested = order.price < order.suggestedMin;
  const isAboveSuggested = order.price > order.suggestedMax;

  return (
    <div
      onClick={onClick}
      className={cn(
        'cyber-card cursor-pointer group',
        `rarity-${order.data.rarity}`,
        `border-l-4`
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={cn('cyber-badge border', `rarity-${order.data.rarity}`)}>
            {order.data.rarity}
          </span>
          <span className="text-xs text-cyber-muted font-mono">{order.data.type}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-cyber-muted">
          <Clock className="w-3 h-3" />
          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
        </div>
      </div>

      <h3 className={cn('font-display font-bold text-lg mb-2', `rarity-${order.data.rarity}`)}>
        {order.data.name}
      </h3>

      <div className="flex items-center gap-2 mb-3 text-sm">
        <User className="w-4 h-4 text-cyber-muted" />
        <span className="text-cyber-muted">卖家:</span>
        <span className="text-cyber-primary font-mono">{order.sellerName}</span>
      </div>

      <div className="bg-cyber-bg-light p-3 mb-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-cyber-muted">建议价格</span>
          <span className="text-xs font-mono text-cyber-muted">
            {formatCredits(order.suggestedMin)} - {formatCredits(order.suggestedMax)}
          </span>
        </div>
        <div className="relative h-1.5 bg-cyber-bg-card rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyber-success/50 via-cyber-primary/50 to-cyber-warning/50" />
          <div
            className="absolute top-0 bottom-0 w-1 bg-white rounded-full shadow-lg"
            style={{
              left: `${Math.min(100, Math.max(0, ((order.price - order.suggestedMin) / (order.suggestedMax - order.suggestedMin)) * 100))}%`,
            }}
          />
        </div>
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-xs text-cyber-muted mb-1">售价</div>
          <div className={cn(
            'font-mono font-bold text-xl',
            isBelowSuggested ? 'text-cyber-success' : isAboveSuggested ? 'text-cyber-warning' : 'text-cyber-primary'
          )}>
            {formatCredits(order.price)}
          </div>
        </div>

        <motion.button
          whileHover={canAfford ? { scale: 1.05 } : {}}
          whileTap={canAfford ? { scale: 0.95 } : {}}
          onClick={(e) => {
            e.stopPropagation();
            if (canAfford) onBuy();
          }}
          disabled={!canAfford}
          className={cn(
            'cyber-btn text-sm px-4 py-2',
            canAfford ? 'cyber-btn-success' : 'opacity-50 cursor-not-allowed border-gray-500 text-gray-500'
          )}
        >
          {canAfford ? '购买' : '余额不足'}
        </motion.button>
      </div>
    </div>
  );
}
