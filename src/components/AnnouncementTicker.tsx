import { motion } from 'framer-motion';
import { Radio } from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import { formatCredits, getRarityColor } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function AnnouncementTicker() {
  const { announcements } = useGameStore();

  if (announcements.length === 0) return null;

  const tickerContent = announcements.map((ann) => (
    <span key={ann.id} className="inline-flex items-center gap-2 mx-8 whitespace-nowrap">
      <span className="text-cyber-muted">交易公告:</span>
      <span className={cn('font-bold', getRarityColor(ann.rarity))}>
        [{ann.rarity.toUpperCase()}]
      </span>
      <span className="text-white">{ann.dataName}</span>
      <span className="text-cyber-muted">由</span>
      <span className="text-cyber-primary">{ann.sellerName}</span>
      <span className="text-cyber-muted">出售给</span>
      <span className="text-cyber-secondary">{ann.buyerName}</span>
      <span className="text-cyber-muted">价格</span>
      <span className="text-cyber-success font-bold">{formatCredits(ann.price)}</span>
    </span>
  ));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="h-12 bg-cyber-bg-card/95 border-t border-cyber-primary/30 backdrop-blur-sm flex items-center overflow-hidden relative"
    >
      <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-cyber-bg-card to-transparent z-10" />
      <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-cyber-bg-card to-transparent z-10" />

      <div className="flex items-center gap-3 px-4 border-r border-cyber-primary/30 h-full bg-cyber-primary/10 z-20">
        <Radio className="w-4 h-4 text-cyber-primary animate-pulse" />
        <span className="font-display text-xs text-cyber-primary neon-text-cyan tracking-wider">
          全服公告
        </span>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap py-2">
          {tickerContent}
          {tickerContent}
        </div>
      </div>
    </motion.div>
  );
}
