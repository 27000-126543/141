import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check, Zap, TrendingUp, AlertTriangle } from 'lucide-react';
import type { HackTarget } from '../../shared/types';
import { cn } from '@/lib/utils';
import { formatCredits } from '../data/mockData';

interface CreateStormModalProps {
  targets: HackTarget[];
  selectedTarget: string;
  onSelectTarget: (id: string) => void;
  onClose: () => void;
  onCreate: () => void;
}

export default function CreateStormModal({
  targets,
  selectedTarget,
  onSelectTarget,
  onClose,
  onCreate,
}: CreateStormModalProps) {
  const target = targets.find(t => t.id === selectedTarget);

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
        className="bg-cyber-bg-card border-2 border-cyber-secondary/50 p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 90%, 95% 100%, 0 100%)' }}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-display font-bold text-cyber-secondary neon-text-magenta">
            <Zap className="w-7 h-7 inline mr-2" />
            创建数据风暴
          </h2>
          <button onClick={onClose} className="text-cyber-muted hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm text-cyber-muted mb-2 block">选择入侵目标</label>
            <select
              value={selectedTarget}
              onChange={(e) => {
                onSelectTarget(e.target.value);
              }}
              className="cyber-input"
            >
              <option value="">请选择目标...</option>
              {targets.map((t) => (
                <option key={t.id} value={t.id}>
                {t.name} (需要能力: {t.minPowerRequired})
              </option>
            ))}
            </select>
          </div>

          {target && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-cyber-bg-light p-4 border border-cyber-primary/30"
            >
              <h3 className="font-display font-bold text-cyber-primary mb-2">{target.name}</h3>
              <p className="text-sm text-cyber-muted mb-4">{target.description}</p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-cyber-bg-card p-3 rounded">
                  <div className="text-xs text-cyber-muted mb-1">目标类型</div>
                  <div className="font-mono text-cyber-primary">
                    {target.type === 'corporate' ? '企业' : '政府'}
                  </div>
                </div>
                <div className="bg-cyber-bg-card p-3 rounded">
                  <div className="text-xs text-cyber-muted mb-1">最低能力要求</div>
                  <div className="font-mono text-cyber-warning">{target.minPowerRequired}</div>
                </div>
                <div className="bg-cyber-bg-card p-3 rounded">
                  <div className="text-xs text-cyber-muted mb-1">防火墙等级</div>
                  <div className="font-mono text-cyber-danger">{target.firewallLevel}/10</div>
                </div>
                <div className="bg-cyber-bg-card p-3 rounded">
                  <div className="text-xs text-cyber-muted mb-1">反追踪等级</div>
                  <div className="font-mono text-cyber-danger">{target.antiTracking}/10</div>
                </div>
              </div>

              <div className="bg-cyber-success/10 border border-cyber-success/30 p-3 rounded">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-cyber-success" />
                  <span className="text-sm text-cyber-success font-bold">预计奖励</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-cyber-muted text-sm">信用点</span>
                  <span className="font-mono font-bold text-cyber-success">
                    {formatCredits(target.rewards.minCredits)} - {formatCredits(target.rewards.maxCredits)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-cyber-muted text-sm">积分</span>
                  <span className="font-mono font-bold text-cyber-primary">
                    +{target.rewards.points}
                  </span>
                </div>
              </div>

              {target.minPowerRequired > 500 && (
                <div className="mt-4 flex items-start gap-2 text-cyber-warning bg-cyber-warning/10 p-3 border border-cyber-warning/30">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold">高难度目标警告</p>
                    <p className="text-xs text-cyber-muted mt-1">
                      此目标防御等级较高，建议联合多支团队共同入侵。
                    </p>
                  </div>
                  </div>
              )}
            </motion.div>
          )}

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
              onClick={onCreate}
              disabled={!selectedTarget}
              className={cn(
                'flex-1 py-3 cyber-btn cyber-btn-success font-display font-bold uppercase tracking-wider',
                !selectedTarget && 'opacity-50 cursor-not-allowed'
              )}
            >
              <Check className="w-5 h-5 inline mr-2" />
              创建风暴
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
