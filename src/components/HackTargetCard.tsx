import { motion } from 'framer-motion';
import { Shield, Eye, AlertTriangle, Zap, Star, Building2, Landmark } from 'lucide-react';
import type { HackTarget } from '../../shared/types';
import { getRiskLevel, formatCredits } from '../data/mockData';
import { cn } from '../lib/utils';

interface HackTargetCardProps {
  target: HackTarget;
  teamPower: number;
  isSelected: boolean;
  onClick: () => void;
}

export default function HackTargetCard({ target, teamPower, isSelected, onClick }: HackTargetCardProps) {
  const isPowerSufficient = teamPower >= target.minPowerRequired;
  const riskLevel = getRiskLevel(target.alertProbability * 100);

  const renderStars = (level: number, maxLevel: number = 10) => {
    const fullStars = Math.floor(level);
    const hasHalfStar = level % 1 >= 0.5;
    const emptyStars = maxLevel - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: fullStars }).map((_, i) => (
          <Star key={`full-${i}`} className="w-3.5 h-3.5 fill-cyber-warning text-cyber-warning" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-3.5 h-3.5 text-gray-600" />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star className="w-3.5 h-3.5 fill-cyber-warning text-cyber-warning" />
            </div>
          </div>
        )}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-3.5 h-3.5 text-gray-600" />
        ))}
        <span className="ml-2 text-xs font-mono text-gray-400">{level}</span>
      </div>
    );
  };

  const typeConfig = {
    corporate: { icon: Building2, label: '企业', color: 'text-cyber-primary' },
    government: { icon: Landmark, label: '政府', color: 'text-cyber-accent' },
  };

  const TypeIcon = typeConfig[target.type].icon;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        'cyber-card cursor-pointer group relative overflow-hidden',
        isSelected && 'border-cyber-primary shadow-neon-cyan',
        !isPowerSufficient && 'border-cyber-danger/50'
      )}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/10 via-transparent to-cyber-secondary/10" />
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-primary to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-secondary to-transparent" />
      </div>

      <div className="relative z-10 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <TypeIcon className={cn('w-4 h-4', typeConfig[target.type].color)} />
              <span className={cn('text-xs font-display uppercase tracking-wider', typeConfig[target.type].color)}>
                {typeConfig[target.type].label}
              </span>
              {!isPowerSufficient && (
                <span className="cyber-badge bg-cyber-danger/20 text-cyber-danger border border-cyber-danger/50 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  能力不足
                </span>
              )}
            </div>
            <h3 className={cn(
              'font-display font-bold text-sm leading-tight',
              isPowerSufficient ? 'text-white group-hover:text-cyber-primary transition-colors' : 'text-cyber-danger'
            )}>
              {target.name}
            </h3>
          </div>
        </div>

        <p className="text-xs text-gray-400 line-clamp-2 min-h-[2rem]">
          {target.description}
        </p>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Shield className="w-3.5 h-3.5 text-cyber-primary" />
              <span>防火墙</span>
            </div>
            {renderStars(target.firewallLevel)}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Eye className="w-3.5 h-3.5 text-cyber-secondary" />
              <span>反追踪</span>
            </div>
            {renderStars(target.antiTracking)}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-400">
              <AlertTriangle className="w-3.5 h-3.5 text-cyber-warning" />
              <span>警报概率</span>
            </div>
            <span className={cn(
              'font-mono font-bold',
              riskLevel === 'low' && 'text-cyber-success',
              riskLevel === 'medium' && 'text-cyber-warning',
              riskLevel === 'high' && 'text-cyber-danger'
            )}>
              {(target.alertProbability * 100).toFixed(0)}%
            </span>
          </div>
          <div className="risk-indicator">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${target.alertProbability * 100}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                'risk-indicator-fill',
                riskLevel === 'low' && 'risk-low',
                riskLevel === 'medium' && 'risk-medium',
                riskLevel === 'high' && 'risk-high'
              )}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Zap className="w-3.5 h-3.5 text-cyber-success" />
              <span>所需能力</span>
            </div>
            <span className={cn(
              'font-mono font-bold',
              isPowerSufficient ? 'text-cyber-success' : 'text-cyber-danger'
            )}>
              {target.minPowerRequired}
            </span>
          </div>
          <div className="progress-bar h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (teamPower / target.minPowerRequired) * 100)}%` }}
              transition={{ duration: 0.5 }}
              className={cn(
                'progress-bar-fill',
                !isPowerSufficient && 'from-cyber-danger to-cyber-accent'
              )}
            />
          </div>
        </div>

        <div className="pt-2 border-t border-cyber-primary/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">奖励范围</span>
            <span className="font-mono font-bold text-cyber-success">
              {formatCredits(target.rewards.minCredits)} - {formatCredits(target.rewards.maxCredits)}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-gray-400">积分奖励</span>
            <span className="font-mono font-bold text-cyber-secondary">
              +{target.rewards.points} pts
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
