import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, Zap, Trophy, Clock, Play, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { HackTarget } from '../../shared/types';
import { useGameStore } from '../stores/useGameStore';
import { useHackEngine } from '../hooks/useHackEngine';
import HackTargetCard from '../components/HackTargetCard';
import HackSessionPanel from '../components/HackSessionPanel';
import { getRiskLevel, formatCredits, formatTimeRemaining } from '../data/mockData';
import { cn } from '../lib/utils';

export default function HackCenter() {
  const hackTargets = useGameStore(state => state.hackTargets);
  const team = useGameStore(state => state.team);
  const startHack = useGameStore(state => state.startHack);
  const isLoading = useGameStore(state => state.isLoading);
  const error = useGameStore(state => state.error);
  const setError = useGameStore(state => state.setError);

  const { session, skillCooldowns, useSkill } = useHackEngine();

  const [selectedTarget, setSelectedTarget] = useState<HackTarget | null>(null);
  const [filter, setFilter] = useState<'all' | 'corporate' | 'government'>('all');

  const teamPower = team?.power || 0;

  const filteredTargets = hackTargets.filter(target => {
    if (filter === 'all') return true;
    return target.type === filter;
  });

  const handleStartHack = async () => {
    if (!selectedTarget) return;
    if (teamPower < selectedTarget.minPowerRequired) {
      setError('团队能力不足，无法入侵此目标');
      return;
    }
    await startHack(selectedTarget.id);
  };

  const renderTargetDetail = () => {
    if (!selectedTarget) return null;

    const isPowerSufficient = teamPower >= selectedTarget.minPowerRequired;
    const riskLevel = getRiskLevel(selectedTarget.alertProbability * 100);

    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="cyber-card h-full flex flex-col"
      >
        <div className="mb-4 pb-4 border-b border-cyber-primary/20">
          <h2 className="font-display font-bold text-lg text-white mb-2">
            {selectedTarget.name}
          </h2>
          <p className="text-sm text-gray-400">{selectedTarget.description}</p>
        </div>

        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-cyber-bg-light p-3 border border-cyber-primary/20">
              <div className="text-xs text-gray-400 mb-1">防火墙等级</div>
              <div className="text-2xl font-display font-bold text-cyber-primary">
                {selectedTarget.firewallLevel}/10
              </div>
            </div>
            <div className="bg-cyber-bg-light p-3 border border-cyber-secondary/20">
              <div className="text-xs text-gray-400 mb-1">反追踪等级</div>
              <div className="text-2xl font-display font-bold text-cyber-secondary">
                {selectedTarget.antiTracking}/10
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <AlertTriangle className="w-4 h-4 text-cyber-warning" />
                <span>警报概率</span>
              </div>
              <span className={cn(
                'font-mono font-bold',
                riskLevel === 'low' && 'text-cyber-success',
                riskLevel === 'medium' && 'text-cyber-warning',
                riskLevel === 'high' && 'text-cyber-danger'
              )}>
                {(selectedTarget.alertProbability * 100).toFixed(0)}%
              </span>
            </div>
            <div className="risk-indicator h-3">
              <div
                className={cn(
                  'risk-indicator-fill w-full',
                  riskLevel === 'low' && 'risk-low',
                  riskLevel === 'medium' && 'risk-medium',
                  riskLevel === 'high' && 'risk-high'
                )}
                style={{ width: `${selectedTarget.alertProbability * 100}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <Zap className="w-4 h-4 text-cyber-success" />
                <span>所需能力值</span>
              </div>
              <span className={cn(
                'font-mono font-bold',
                isPowerSufficient ? 'text-cyber-success' : 'text-cyber-danger'
              )}>
                {selectedTarget.minPowerRequired}
                <span className="text-gray-500 ml-2">(当前: {teamPower})</span>
              </span>
            </div>
            <div className="progress-bar h-2">
              <div
                className={cn(
                  'progress-bar-fill',
                  !isPowerSufficient && 'from-cyber-danger to-cyber-accent'
                )}
                style={{ width: `${Math.min(100, (teamPower / selectedTarget.minPowerRequired) * 100)}%` }}
              />
            </div>
          </div>

          <div className="bg-cyber-bg-light p-4 border border-cyber-primary/20 space-y-2">
            <div className="flex items-center gap-2 text-cyber-primary mb-2">
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-display font-bold">奖励预览</span>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">信用点范围</span>
                <span className="font-mono text-cyber-success">
                  {formatCredits(selectedTarget.rewards.minCredits)} - {formatCredits(selectedTarget.rewards.maxCredits)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">积分</span>
                <span className="font-mono text-cyber-secondary">
                  +{selectedTarget.rewards.points} pts
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">数据类型</span>
                <span className="font-mono text-cyber-primary">
                  {selectedTarget.rewards.dataTypes.join(', ')}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Clock className="w-4 h-4 text-cyber-primary" />
              <span>预计耗时</span>
            </div>
            <span className="font-mono text-cyber-primary">
              {formatTimeRemaining(selectedTarget.estimatedTime)}
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-cyber-primary/20">
          <button
            onClick={handleStartHack}
            disabled={!isPowerSufficient || isLoading}
            className={cn(
              'cyber-btn w-full flex items-center justify-center gap-2',
              !isPowerSufficient && 'opacity-50 cursor-not-allowed',
              isPowerSufficient && 'cyber-btn-success'
            )}
          >
            <Play className="w-4 h-4" />
            {isLoading ? '启动中...' : isPowerSufficient ? '开始入侵' : '能力不足'}
          </button>
        </div>
      </motion.div>
    );
  };

  const renderSessionResult = () => {
    if (!session || session.status === 'hacking') return null;

    const isSuccess = session.status === 'success';

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="cyber-card text-center py-8"
      >
        <div className={cn(
          'w-20 h-20 mx-auto mb-4 rounded-full flex items-center justify-center',
          isSuccess ? 'bg-cyber-success/20' : 'bg-cyber-danger/20'
        )}>
          {isSuccess ? (
            <CheckCircle className="w-10 h-10 text-cyber-success" />
          ) : (
            <XCircle className="w-10 h-10 text-cyber-danger" />
          )}
        </div>

        <h2 className={cn(
          'font-display font-bold text-2xl mb-2',
          isSuccess ? 'text-cyber-success neon-text-green' : 'text-cyber-danger neon-text-red'
        )}>
          {isSuccess ? '入侵成功！' : '入侵失败'}
        </h2>

        {isSuccess && session.dataStolen.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-display font-bold text-gray-300 mb-4">获取的数据</h3>
            {session.dataStolen.map((data) => (
              <motion.div
                key={data.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-cyber-bg-light p-3 border border-cyber-primary/30 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-white">{data.name}</span>
                  <span className={cn(
                    'text-xs font-display uppercase tracking-wider',
                    data.rarity === 'common' && 'text-gray-400',
                    data.rarity === 'rare' && 'text-cyber-primary',
                    data.rarity === 'epic' && 'text-cyber-secondary',
                    data.rarity === 'legendary' && 'text-cyber-warning'
                  )}>
                    {data.rarity}
                  </span>
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  基础价值: <span className="text-cyber-success font-mono">{formatCredits(data.baseValue)}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <button
          onClick={() => {
            useGameStore.setState({ currentHackSession: null });
          }}
          className="cyber-btn mt-6"
        >
          返回目标列表
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyber-primary/20 border border-cyber-primary/50">
              <Terminal className="w-6 h-6 text-cyber-primary" />
            </div>
            <div>
              <h1 className="font-display font-bold text-2xl text-white">
                入侵中心
              </h1>
              <p className="text-sm text-gray-400">
                选择目标，开始入侵，获取数据
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-cyber-bg-card px-4 py-2 border border-cyber-primary/30">
              <Shield className="w-4 h-4 text-cyber-primary" />
              <span className="text-sm text-gray-400">团队能力:</span>
              <span className="font-mono font-bold text-cyber-primary">{teamPower}</span>
            </div>
          </div>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 bg-cyber-danger/10 border border-cyber-danger/50 text-cyber-danger text-sm flex items-center gap-2"
          >
            <AlertTriangle className="w-4 h-4" />
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-auto hover:text-white"
            >
              ×
            </button>
          </motion.div>
        )}

        <div className="flex gap-2">
          {(['all', 'corporate', 'government'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'px-4 py-2 text-sm font-display uppercase tracking-wider transition-all duration-300 border',
                filter === f
                  ? 'bg-cyber-primary/20 border-cyber-primary text-cyber-primary'
                  : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-600'
              )}
            >
              {f === 'all' ? '全部' : f === 'corporate' ? '企业' : '政府'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-bold text-lg text-gray-300 uppercase tracking-wider">
            可用目标 ({filteredTargets.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTargets.map((target) => (
              <HackTargetCard
                key={target.id}
                target={target}
                teamPower={teamPower}
                isSelected={selectedTarget?.id === target.id}
                onClick={() => setSelectedTarget(target)}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-1">
          <h2 className="font-display font-bold text-lg text-gray-300 uppercase tracking-wider mb-4">
            {session ? '入侵会话' : '目标详情'}
          </h2>
          <AnimatePresence mode="wait">
            {session && session.status !== 'hacking' && renderSessionResult()}
            {session && session.status === 'hacking' && (
              <HackSessionPanel
                key="session"
                session={session}
                skillCooldowns={skillCooldowns}
                onUseSkill={useSkill}
              />
            )}
            {!session && selectedTarget && renderTargetDetail()}
            {!session && !selectedTarget && (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="cyber-card text-center py-12 text-gray-500"
              >
                <Terminal className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="text-sm">选择一个目标查看详情</p>
                <p className="text-xs mt-2">或开始一个新的入侵任务</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
