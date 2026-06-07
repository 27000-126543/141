import { motion } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';
import type { MarketOrder } from '../../shared/types';
import { cn } from '@/lib/utils';
import { formatCredits } from '../data/mockData';
import StolenDataCard from './StolenDataCard';

interface OrderDetailModalProps {
  order: MarketOrder;
  playerCredits: number;
  onClose: () => void;
  onBuy: () => void;
}

export default function OrderDetailModal({
  order,
  playerCredits,
  onClose,
  onBuy,
}: OrderDetailModalProps) {
  const canAfford = playerCredits >= order.price;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-cyber-bg-card border-2 border-cyber-primary/50 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)' }}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 className="text-2xl font-display font-bold text-cyber-primary">订单详情</h2>
          <button onClick={onClose} className="text-cyber-muted hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <StolenDataCard data={order.data} price={order.price} />

          <div className="bg-cyber-bg-light p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-cyber-muted">卖家</span>
              <span className="font-mono text-cyber-primary">{order.sellerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-muted">上架时间</span>
              <span className="font-mono text-cyber-muted">
                {new Date(order.createdAt).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-cyber-muted">建议价格区间</span>
              <span className="font-mono text-cyber-success">
                {formatCredits(order.suggestedMin)} - {formatCredits(order.suggestedMax)}
              </span>
            </div>
            <div className="border-t border-cyber-primary/20 pt-3 flex justify-between">
              <span className="text-cyber-muted font-bold">售价</span>
              <span className="font-mono font-bold text-xl text-cyber-primary">
                {formatCredits(order.price)}
              </span>
            </div>
          </div>

          {!canAfford && (
            <div className="flex items-center gap-2 text-cyber-danger bg-cyber-danger/10 p-3 border border-cyber-danger/30">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">
                余额不足，还差 {formatCredits(order.price - playerCredits)}
              </span>
            </div>
          )}

          <motion.button
            whileHover={canAfford ? { scale: 1.02 } : {}}
            whileTap={canAfford ? { scale: 0.98 } : {}}
            onClick={onBuy}
            disabled={!canAfford}
            className={cn(
              'w-full py-3 font-display font-bold uppercase tracking-wider',
              canAfford ? 'cyber-btn cyber-btn-success' : 'opacity-50 cursor-not-allowed border-gray-500 text-gray-500 bg-gray-500/10 border'
            )}
          >
            <Check className="w-5 h-5 inline mr-2" />
            {canAfford ? '确认购买' : '余额不足'}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
