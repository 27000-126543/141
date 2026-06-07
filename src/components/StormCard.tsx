import { motion } from 'framer-motion';
import { Target, Clock, Crown, Users, TrendingUp, Check } from 'lucide-react';
import type { DataStorm } from '../../shared/types';
import { cn } from '@/lib/utils';
import { formatCredits, formatTimeRemaining } from '../data/mockData';

interface StormCardProps {
  storm: DataStorm;
  countdown: number;
  statusLabel: string;
  statusColor: string;
  onJoin: () => void;
  canJoin: boolean;
}

export default function StormCard({
  storm,
  countdown,
  statusLabel,
  statusColor,
  onJoin,
  canJoin,
}: StormCardProps) {
  const estimatedReward = Math.floor(
    (storm.target.rewards.minCredits + storm.target.rewards.maxCredits) / 2
  );

  return (
    <div className="cyber-card relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyber-secondary/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyber-primary" />
            <span className={cn('cyber-badge border text-xs uppercase', statusColor)}>
              {statusLabel}
            </span>
          </div>
          <div className="flex items-center gap-1 text-cyber-warning">
            <Clock className="w-4 h-4" />
            <span className="font-mono font-bold">
              {storm.status === 'countdown' ? formatTimeRemaining(countdown) : '招募中'}
            </span>
          </div>
        </div>

        <h3 className="font-display font-bold text-lg text-white mb-2">
          {storm.target.name}
        </h3>

        <p className="text-sm text-cyber-muted mb-4 line-clamp-2">
          {storm.target.description}
        </p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-cyber-bg-light p-2 rounded">
            <div className="flex items-center gap-1 text-xs text-cyber-muted mb-1">
              <Crown className="w-3 h-3" />
              发起团队
            </div>
            <div className="font-mono text-sm text-cyber-primary">
              {storm.initiatorTeamName}
            </div>
          </div>
          <div className="bg-cyber-bg-light p-2 rounded">
            <div className="flex items-center gap-1 text-xs text-cyber-muted mb-1">
              <Users className="w-3 h-3" />
              参与团队
            </div>
            <div className="font-mono text-sm text-cyber-success">
              {storm.participantTeams.length} 支
            </div>
          </div>
        </div>

        <div className="bg-cyber-bg-light p-3 rounded mb-4">
          <div className="flex items-center gap-1 text-xs text-cyber-muted mb-2">
            <TrendingUp className="w-3 h-3" />
            预计奖励
          </div>
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-cyber-success text-lg">
              {formatCredits(estimatedReward)}
            </span>
            <span className="text-xs text-cyber-muted">
              积分 +{storm.target.rewards.points}
            </span>
          </div>
        </div>

        {canJoin && storm.status === 'recruiting' && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onJoin}
            className="w-full cyber-btn cyber-btn-primary text-sm py-2"
          >
            <Users className="w-4 h-4 inline mr-2" />
            加入风暴
          </motion.button>
        )}

        {!canJoin && (
          <div className="flex items-center justify-center gap-2 py-2 text-cyber-success bg-cyber-success/10 border border-cyber-success/30">
            <Check className="w-4 h-4" />
            <span className="text-sm">已加入</span>
          </div>
        )}
      </div>
    </div>
  );
}
