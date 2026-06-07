import { motion } from 'framer-motion';
import { Lock, Code, Eye } from 'lucide-react';
import type { PlayerSkills } from '../../shared/types';
import { cn } from '@/lib/utils';

interface SkillBarProps {
  skills: PlayerSkills;
  showLabels?: boolean;
}

const skillConfig = {
  cracking: {
    label: '破解',
    icon: Lock,
    color: 'cyber-primary',
    colorValue: '#00f5ff',
    glow: 'shadow-neon-cyan',
  },
  programming: {
    label: '编程',
    icon: Code,
    color: 'cyber-secondary',
    colorValue: '#ff00ff',
    glow: 'shadow-neon-magenta',
  },
  stealth: {
    label: '匿踪',
    icon: Eye,
    color: 'cyber-success',
    colorValue: '#00ff88',
    glow: 'shadow-neon-green',
  },
} as const;

export default function SkillBar({ skills, showLabels = true }: SkillBarProps) {
  return (
    <div className="space-y-3">
      {(Object.keys(skillConfig) as Array<keyof PlayerSkills>).map((skillKey, index) => {
        const skillKeyStr = skillKey as string;
        const config = skillConfig[skillKey];
        const value = skills[skillKey];
        const Icon = config.icon;
        const displayValue = Math.min(100, Math.max(0, value));

        return (
          <motion.div
            key={skillKeyStr}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="space-y-1"
          >
            {showLabels && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={cn('w-4 h-4', `text-${config.color}`)} />
                  <span className="text-xs font-display tracking-wider text-gray-400">
                    {config.label}
                  </span>
                </div>
                <span
                  className={cn(
                    'text-sm font-mono font-bold',
                    `text-${config.color}`
                  )}
                >
                  {displayValue}
                </span>
              </div>
            )}
            <div className="skill-bar">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${displayValue}%` }}
                transition={{ duration: 0.8, delay: 0.2 + index * 0.1, ease: 'easeOut' }}
                className={cn(
                  'skill-bar-fill relative',
                  displayValue > 70 && config.glow
                )}
                style={{
                  background: `linear-gradient(90deg, ${config.colorValue}, ${config.colorValue}99)`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-data-flow" />
              </motion.div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
