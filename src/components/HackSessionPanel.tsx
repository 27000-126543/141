import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Code, Eye, Wifi, AlertTriangle, Activity, Terminal, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { HackSession, SkillType } from '../../shared/types';
import { getRiskLevel, formatTimeRemaining } from '../data/mockData';
import { cn } from '../lib/utils';

interface HackSessionPanelProps {
  session: HackSession;
  skillCooldowns: Record<SkillType, number>;
  onUseSkill: (skillType: SkillType) => Promise<boolean>;
}

const skillConfig: Record<SkillType, { label: string; icon: typeof Lock; color: string; glow: string; description: string }> = {
  cracking: {
    label: '破解加速',
    icon: Lock,
    color: 'cyber-primary',
    glow: 'shadow-neon-cyan',
    description: '利用漏洞快速提升破解进度',
  },
  programming: {
    label: '流量恢复',
    icon: Code,
    color: 'cyber-secondary',
    glow: 'shadow-neon-magenta',
    description: '优化数据包传输恢复可用流量',
  },
  stealth: {
    label: '匿踪隐藏',
    icon: Eye,
    color: 'cyber-success',
    glow: 'shadow-neon-green',
    description: '清除痕迹降低被检测风险',
  },
};

export default function HackSessionPanel({ session, skillCooldowns, onUseSkill }: HackSessionPanelProps) {
  const riskLevel = getRiskLevel(session.detectionRisk);
  const progressPercent = Math.round(session.progress);
  const trafficPercent = Math.round(session.remainingTraffic);

  const formatCooldown = (ms: number) => {
    if (ms <= 0) return '就绪';
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const handleSkillClick = async (skillType: SkillType) => {
    if (skillCooldowns[skillType] > 0) return;
    await onUseSkill(skillType);
  };

  const renderStatusBadge = () => {
    const statusConfig = {
      hacking: { label: '入侵中', color: 'text-cyber-primary', bg: 'bg-cyber-primary/20', border: 'border-cyber-primary/50', icon: Activity },
      success: { label: '成功', color: 'text-cyber-success', bg: 'bg-cyber-success/20', border: 'border-cyber-success/50', icon: CheckCircle },
      failed: { label: '失败', color: 'text-cyber-danger', bg: 'bg-cyber-danger/20', border: 'border-cyber-danger/50', icon: XCircle },
      detected: { label: '被检测', color: 'text-cyber-warning', bg: 'bg-cyber-warning/20', border: 'border-cyber-warning/50', icon: AlertTriangle },
    };

    const config = statusConfig[session.status];
    const StatusIcon = config.icon;

    return (
      <span className={cn(
        'cyber-badge flex items-center gap-1.5',
        config.bg, config.color, config.border
      )}>
        <StatusIcon className="w-3.5 h-3.5" />
        {config.label}
      </span>
    );
  };

  return (
    <div className="cyber-card h-full flex flex-col">
      <div className="mb-4 pb-4 border-b border-cyber-primary/20">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
            <Terminal className="w-5 h-5 text-cyber-primary" />
            实时入侵终端
          </h2>
          {renderStatusBadge()}
        </div>
        <p className="text-sm text-cyber-primary font-mono">{session.target.name}</p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Activity className="w-4 h-4 text-cyber-primary" />
              <span>破解进度</span>
            </div>
            <span className="font-mono font-bold text-cyber-primary">{progressPercent}%</span>
          </div>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
              className="progress-bar-fill relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-data-flow" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Wifi className="w-4 h-4 text-cyber-secondary" />
              <span>剩余流量</span>
            </div>
            <span className="font-mono font-bold text-cyber-secondary">{trafficPercent}%</span>
          </div>
          <div className="progress-bar">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${trafficPercent}%` }}
              transition={{ duration: 0.3 }}
              className="h-full bg-gradient-to-r from-cyber-secondary to-cyber-primary transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-data-flow" />
            </motion.div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <AlertTriangle className="w-4 h-4 text-cyber-warning" />
              <span>被发现风险</span>
            </div>
            <span className={cn(
              'font-mono font-bold',
              riskLevel === 'low' && 'text-cyber-success',
              riskLevel === 'medium' && 'text-cyber-warning',
              riskLevel === 'high' && 'text-cyber-danger'
            )}>
              {Math.round(session.detectionRisk)}%
            </span>
          </div>
          <div className="risk-indicator h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${session.detectionRisk}%` }}
              transition={{ duration: 0.3 }}
              className={cn(
                'risk-indicator-fill',
                riskLevel === 'low' && 'risk-low',
                riskLevel === 'medium' && 'risk-medium',
                riskLevel === 'high' && 'risk-high'
              )}
            />
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-display font-bold text-gray-300 uppercase tracking-wider">技能</h3>
          <div className="grid grid-cols-3 gap-2">
            {(Object.keys(skillConfig) as SkillType[]).map((skillKey) => {
              const config = skillConfig[skillKey];
              const cooldown = skillCooldowns[skillKey];
              const isOnCooldown = cooldown > 0;
              const SkillIcon = config.icon;

              return (
                <motion.button
                  key={skillKey}
                  whileHover={!isOnCooldown ? { scale: 1.05, y: -2 } : {}}
                  whileTap={!isOnCooldown ? { scale: 0.95 } : {}}
                  onClick={() => handleSkillClick(skillKey)}
                  disabled={isOnCooldown || session.status !== 'hacking'}
                  className={cn(
                    'relative p-3 border transition-all duration-300 flex flex-col items-center gap-1.5',
                    'clip-path polygon(0 0, 100% 0, 100% 75%, 88% 100%, 0 100%)',
                    isOnCooldown || session.status !== 'hacking'
                      ? 'border-gray-700 bg-gray-800/50 cursor-not-allowed opacity-60'
                      : cn(
                          `border-${config.color}/50 bg-${config.color}/10 hover:bg-${config.color}/20`,
                          `hover:${config.glow} cursor-pointer`
                        )
                  )}
                  title={config.description}
                >
                  <SkillIcon className={cn('w-5 h-5', isOnCooldown ? 'text-gray-500' : `text-${config.color}`)} />
                  <span className={cn('text-xs font-display font-bold', isOnCooldown ? 'text-gray-500' : `text-${config.color}`)}>
                    {config.label}
                  </span>
                  <div className="flex items-center gap-1 text-[10px] font-mono">
                    <Clock className="w-3 h-3" />
                    <span className={isOnCooldown ? 'text-cyber-danger' : 'text-cyber-success'}>
                      {formatCooldown(cooldown)}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-sm font-display font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyber-primary" />
            事件日志
          </h3>
          <div className="bg-cyber-bg-light border border-cyber-primary/20 p-3 max-h-48 overflow-y-auto font-mono text-xs space-y-2">
            <AnimatePresence initial={false}>
              {session.events.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-gray-500 italic"
                >
                  {'>'} 等待系统事件...
                </motion.div>
              ) : (
                session.events.slice().reverse().map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'py-1 border-l-2 pl-2',
                      event.isPositive
                        ? 'border-cyber-success text-cyber-success/90'
                        : 'border-cyber-danger text-cyber-danger/90'
                    )}
                  >
                    <span className="text-gray-500 mr-2">
                      [{new Date(event.createdAt).toLocaleTimeString()}]
                    </span>
                    {event.description}
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-cyber-primary/20">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>开始时间: {new Date(session.startTime).toLocaleTimeString()}</span>
          <span>
            预计剩余: {formatTimeRemaining(Math.max(0, session.target.estimatedTime * (1 - session.progress / 100)))}
          </span>
        </div>
      </div>
    </div>
  );
}
