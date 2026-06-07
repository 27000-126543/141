import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import type { StolenData, PriceSuggestion as PriceSuggestionType } from '../../shared/types';
import StolenDataCard from './StolenDataCard';
import PriceSuggestion from './PriceSuggestion';

interface ListingModalProps {
  data: StolenData;
  price: number;
  suggestion: PriceSuggestionType;
  onPriceChange: (price: number) => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ListingModal({
  data,
  price,
  suggestion,
  onPriceChange,
  onClose,
  onConfirm,
}: ListingModalProps) {
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
          <h2 className="text-2xl font-display font-bold text-cyber-primary">上架数据</h2>
          <button onClick={onClose} className="text-cyber-muted hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <StolenDataCard data={data} />

          <PriceSuggestion
            suggestion={suggestion}
            value={price}
            onChange={onPriceChange}
            min={100}
            max={data.baseValue * 3}
          />

          <div className="flex gap-3 pt-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="flex-1 py-3 font-display font-bold uppercase tracking-wider border border-cyber-muted text-cyber-muted hover:bg-cyber-muted/10 transition-all"
            >
              取消
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="flex-1 py-3 cyber-btn cyber-btn-success font-display font-bold uppercase tracking-wider"
            >
              <Check className="w-5 h-5 inline mr-2" />
              确认上架
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
