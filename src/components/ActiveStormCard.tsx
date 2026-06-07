import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Zap, Trophy, Shield, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { DataStorm } from '../../shared/types';
import { cn } from '@/lib/utils';
import { formatCredits } from '../data/mockData';

interface ActiveStormCardProps {
  storm: DataStorm;
}

export default function ActiveStormCard({ storm }: ActiveStormCardProps) {
  const chartData = useMemo(() => {
    return storm.participantTeams
      .sort((a, b) => b.contribution - a.contribution)
      .map((p, index) => ({
        name: p.teamName,
        contribution: p.contribution,
        rank: index + 1,
      }));
  }, [storm.participantTeams]);

  const totalContribution = storm.participantTeams.reduce((sum, p) => sum + p.contribution, 0);
  const maxContribution = Math.max(...storm.participantTeams.map(p => p.contribution), 1);

  const barColors = ['#00f5ff', '#ff00ff', '#00ff88', '#ffcc00', '#ff3366'];

  const estimatedReward = Math.floor(
    (storm.target.rewards.minCredits + storm.target.rewards.maxCredits) / 2
  );

  return (
    <div className="cyber-card relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/5 to-cyber-secondary/5" />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-5 h-5 text-cyber-primary animate-pulse" />
              <span className="cyber-badge border border-cyber-primary text-cyber-primary text-xs uppercase">
                进行中
              </span>
            </div>
            <h3 className="font-display font-bold text-lg text-white">
              {storm.target.name}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-xs text-cyber-muted mb-1">总伤害</div>
            <div className="font-mono font-bold text-cyber-primary text-xl">
              {storm.totalDamage.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="bg-cyber-bg-light p-3 rounded mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-cyber-muted">实时贡献排行</span>
            <Trophy className="w-4 h-4 text-cyber-warning" />
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <XAxis type="number" hide />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  width={100}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#12121a',
                    border: '1px solid #00f5ff',
                    borderRadius: 0,
                  }}
                  labelStyle={{ color: '#00f5ff' }}
                />
                <Bar dataKey="contribution" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={index} fill={barColors[index % barColors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {storm.participantTeams
            .sort((a, b) => b.contribution - a.contribution)
            .map((participant, index) => (
              <div key={participant.teamId} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'w-6 h-6 flex items-center justify-center text-xs font-bold rounded',
                      index === 0 ? 'bg-cyber-warning text-black' :
                      index === 1 ? 'bg-gray-400 text-black' :
                      index === 2 ? 'bg-amber-700 text-white' :
                      'bg-cyber-bg-light text-cyber-muted'
                    )}>
                      {index + 1}
                    </span>
                    <span className="font-mono text-white">{participant.teamName}</span>
                  </div>
                  <span className="font-mono text-cyber-primary">
                    {participant.contribution.toLocaleString()}
                  </span>
                </div>
                <div className="progress-bar h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(participant.contribution / maxContribution) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="progress-bar-fill"
                    style={{
                      background: `linear-gradient(90deg, ${barColors[index % barColors.length]}, ${barColors[index % barColors.length]}80)`,
                    }}
                  />
                </div>
              </div>
            ))}
        </div>

        <div className="border-t border-cyber-primary/20 pt-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyber-warning" />
              <span className="text-sm text-cyber-muted">目标防御</span>
            </div>
            <span className="font-mono text-cyber-warning">
              {Math.max(0, 100 - (totalContribution / storm.target.firewallLevel / 100)).toFixed(1)}%
            </span>
          </div>
          <div className="progress-bar h-3">
            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: `${Math.max(0, 100 - (totalContribution / storm.target.firewallLevel / 100))}%` }}
              className="h-full bg-gradient-to-r from-cyber-danger to-cyber-warning transition-all duration-500"
            />
          </div>
        </div>

        <div className="mt-4 bg-cyber-success/10 border border-cyber-success/30 p-3 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyber-success" />
              <span className="text-sm text-cyber-success">预计奖励</span>
            </div>
            <span className="font-mono font-bold text-cyber-success">
              {formatCredits(estimatedReward)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
