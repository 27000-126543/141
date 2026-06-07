import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUp, ArrowDown, Minus, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeeklyStatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  change: number;
  iconColor: string;
  glowClass?: string;
}

export default function WeeklyStatsCard({
  icon: Icon,
  label,
  value,
  suffix = '',
  change,
  iconColor,
  glowClass,
}: WeeklyStatsCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const startValue = 0;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startValue + (endValue - startValue) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const isPositive = change > 0;
  const isNegative = change < 0;
  const isNeutral = change === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="cyber-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-cyber-muted text-xs font-display tracking-wider mb-1">
            {label}
          </p>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={displayValue}
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 0.2 }}
              className={cn(
                'font-display text-3xl font-bold',
                glowClass
              )}
              style={{ color: iconColor }}
            >
              {displayValue.toLocaleString()}
            </motion.span>
            {suffix && (
              <span className="text-cyber-muted text-sm font-mono">
                {suffix}
              </span>
            )}
          </div>
        </div>
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className={cn(
            'p-3 rounded-lg border',
            glowClass
          )}
          style={{
            backgroundColor: `${iconColor}15`,
            borderColor: `${iconColor}40`,
          }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </motion.div>
      </div>

      <div className="mt-3 pt-3 border-t border-cyber-primary/20">
        <div className="flex items-center gap-2">
          {isPositive && (
            <ArrowUp className="w-4 h-4 text-cyber-success" />
          )}
          {isNegative && (
            <ArrowDown className="w-4 h-4 text-cyber-danger" />
          )}
          {isNeutral && (
            <Minus className="w-4 h-4 text-cyber-muted" />
          )}
          <span
            className={cn(
              'text-sm font-mono font-bold',
              isPositive && 'text-cyber-success',
              isNegative && 'text-cyber-danger',
              isNeutral && 'text-cyber-muted'
            )}
          >
            {isPositive ? '+' : ''}{change}%
          </span>
          <span className="text-xs text-cyber-muted">较上周</span>
        </div>
      </div>

      <div
        className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `inset 0 0 30px ${iconColor}15`,
        }}
      />
    </motion.div>
  );
}
