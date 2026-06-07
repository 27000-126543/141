import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';

export default function ErrorToast() {
  const { error, setError } = useGameStore();

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, setError]);

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: -50, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed top-20 left-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="cyber-card border-cyber-danger/50 bg-cyber-danger/10 shadow-neon-red">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                >
                  <AlertTriangle className="w-6 h-6 text-cyber-danger" />
                </motion.div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-display text-sm font-bold text-cyber-danger neon-text-red mb-1">
                  系统错误
                </p>
                <p className="text-sm text-gray-300 font-mono break-all">
                  {error}
                </p>
              </div>
              <button
                onClick={() => setError(null)}
                className="flex-shrink-0 p-1 text-cyber-muted hover:text-cyber-danger transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 h-1 bg-cyber-bg-light overflow-hidden">
              <motion.div
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: 5, ease: 'linear' }}
                className="h-full bg-gradient-to-r from-cyber-danger to-cyber-accent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
