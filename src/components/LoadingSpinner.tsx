import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  fullScreen?: boolean;
}

const sizeClasses = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-16 h-16',
};

export default function LoadingSpinner({ size = 'md', label, fullScreen = false }: LoadingSpinnerProps) {
  const containerClass = fullScreen
    ? 'fixed inset-0 bg-cyber-bg/90 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex flex-col items-center justify-center p-8';

  return (
    <div className={containerClass}>
      <div className="relative">
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute inset-0"
        >
          <div className="w-full h-full rounded-full border-2 border-transparent border-t-cyber-primary border-r-cyber-secondary animate-spin" />
        </motion.div>

        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <Loader2 className={`${sizeClasses[size]} text-cyber-primary animate-spin`} />
        </motion.div>

        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute -inset-2"
        >
          <div className="w-full h-full rounded-full border border-dashed border-cyber-primary/30" />
        </motion.div>

        <div className="absolute inset-0 rounded-full shadow-neon-cyan animate-pulse opacity-50" />
      </div>

      {label && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 font-display text-sm text-cyber-primary tracking-wider neon-text-cyan"
        >
          {label}
        </motion.p>
      )}

      <div className="mt-4 flex gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -5, 0],
              opacity: [0.3, 1, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2,
              ease: 'easeInOut',
            }}
            className="w-2 h-2 rounded-full bg-cyber-primary shadow-neon-cyan"
          />
        ))}
      </div>
    </div>
  );
}
