import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import type { PriceSuggestion as PriceSuggestionType } from '../../shared/types';
import { cn } from '@/lib/utils';
import { formatCredits } from '../data/mockData';

interface PriceSuggestionProps {
  suggestion: PriceSuggestionType;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export default function PriceSuggestion({
  suggestion,
  value,
  onChange,
  min = 100,
  max = 10000000,
}: PriceSuggestionProps) {
  const [inputValue, setInputValue] = useState(value.toString());

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const [suggestedMin, suggestedMax] = suggestion.range;
  const isTooLow = value < suggestedMin;
  const isTooHigh = value > suggestedMax;
  const isInRange = value >= suggestedMin && value <= suggestedMax;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    setInputValue(val);
    const numVal = parseInt(val, 10);
    if (!isNaN(numVal) && numVal >= min && numVal <= max) {
      onChange(numVal);
    }
  };

  const handleInputBlur = () => {
    const numVal = parseInt(inputValue, 10);
    if (isNaN(numVal) || numVal < min) {
      onChange(min);
    } else if (numVal > max) {
      onChange(max);
    }
  };

  const quickPrices = [
    { label: '最低价', value: suggestedMin },
    { label: '均价', value: suggestion.avg7d },
    { label: '最高价', value: suggestedMax },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-cyber-primary" />
          <span className="text-sm font-display text-cyber-muted">近7天均价</span>
        </div>
        <span className="font-mono font-bold text-cyber-primary">
          {formatCredits(suggestion.avg7d)}
        </span>
      </div>

      <div className="bg-cyber-bg-light border border-cyber-primary/20 p-3 rounded">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <Info className="w-4 h-4 text-cyber-success" />
            <span className="text-xs text-cyber-muted">建议价格区间</span>
          </div>
          <span className="font-mono text-sm text-cyber-success">
            {formatCredits(suggestedMin)} - {formatCredits(suggestedMax)}
          </span>
        </div>

        <div className="relative h-2 bg-cyber-bg-card rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 0.5 }}
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyber-success/50 via-cyber-primary/50 to-cyber-warning/50"
          />
          <motion.div
            initial={{ left: '50%' }}
            animate={{ left: `${((value - min) / (max - min)) * 100}%` }}
            transition={{ duration: 0.2 }}
            className={cn(
              'absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 shadow-lg z-10',
              isInRange ? 'bg-cyber-primary border-white shadow-neon-cyan' :
              isTooLow ? 'bg-cyber-danger border-white shadow-neon-red' :
              'bg-cyber-warning border-white shadow-neon-yellow'
            )}
          />
        </div>
      </div>

      {(isTooLow || isTooHigh) && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className={cn(
            'flex items-start gap-2 p-3 border',
            isTooLow ? 'bg-cyber-danger/10 border-cyber-danger/30' : 'bg-cyber-warning/10 border-cyber-warning/30'
          )}
        >
          <AlertTriangle className={cn(
            'w-5 h-5 flex-shrink-0 mt-0.5',
            isTooLow ? 'text-cyber-danger' : 'text-cyber-warning'
          )} />
          <div>
            <p className={cn(
              'text-sm font-bold',
              isTooLow ? 'text-cyber-danger' : 'text-cyber-warning'
            )}>
              {isTooLow ? '价格过低警告' : '价格过高警告'}
            </p>
            <p className="text-xs text-cyber-muted mt-1">
              {isTooLow
                ? `此价格低于建议最低价 ${formatCredits(suggestedMin)}，可能导致亏损。建议提高价格。`
                : `此价格高于建议最高价 ${formatCredits(suggestedMax)}，可能难以售出。建议降低价格。`
              }
            </p>
          </div>
        </motion.div>
      )}

      <div>
        <label className="text-xs text-cyber-muted mb-2 block">定价</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyber-muted font-mono">¥</span>
            <input
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              className={cn(
                'cyber-input pl-8 pr-4 py-2 font-mono',
                isTooLow && 'border-cyber-danger focus:shadow-neon-red',
                isTooHigh && 'border-cyber-warning focus:shadow-neon-yellow',
                isInRange && 'border-cyber-success focus:shadow-neon-green'
              )}
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs text-cyber-muted mb-2 block">价格滑块</label>
        <input
          type="range"
          min={min}
          max={max}
          step={100}
          value={value}
          onChange={handleSliderChange}
          className="w-full h-2 bg-cyber-bg-light rounded-lg appearance-none cursor-pointer accent-cyber-primary"
        />
        <div className="flex justify-between text-xs text-cyber-muted mt-1">
          <span>{formatCredits(min)}</span>
          <span>{formatCredits(max)}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {quickPrices.map(({ label, value: price }) => (
          <motion.button
            key={label}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChange(price)}
            className={cn(
              'flex-1 py-2 px-3 text-xs font-mono border transition-all',
              value === price
                ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary'
                : 'bg-cyber-bg-light border-cyber-primary/30 text-cyber-muted hover:border-cyber-primary/50'
            )}
          >
            <div className="text-cyber-muted text-[10px]">{label}</div>
            <div className="font-bold">{formatCredits(price)}</div>
          </motion.button>
        ))}
      </div>

      {isTooLow && (
        <div className="flex items-center gap-2 text-cyber-danger">
          <TrendingDown className="w-4 h-4" />
          <span className="text-xs">预计售出速度: 极快 | 利润率: 低</span>
        </div>
      )}
      {isInRange && (
        <div className="flex items-center gap-2 text-cyber-success">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs">预计售出速度: 正常 | 利润率: 合理</span>
        </div>
      )}
      {isTooHigh && (
        <div className="flex items-center gap-2 text-cyber-warning">
          <TrendingUp className="w-4 h-4" />
          <span className="text-xs">预计售出速度: 缓慢 | 利润率: 高</span>
        </div>
      )}
    </div>
  );
}
