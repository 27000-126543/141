import { motion } from 'framer-motion';
import { User, Coins, Trophy, LogOut } from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import { formatCredits } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function Navbar() {
  const { player, logout } = useGameStore();

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="h-16 bg-cyber-bg-card/95 border-b border-cyber-primary/30 backdrop-blur-sm flex items-center justify-between px-6 relative z-50"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyber-primary/50 to-transparent" />
      </div>

      <div className="flex items-center gap-6">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-3"
        >
          <div className="relative">
            {player?.avatar ? (
              <img
                src={player.avatar}
                alt={player.username}
                className="w-10 h-10 rounded border-2 border-cyber-primary/50"
              />
            ) : (
              <div className="w-10 h-10 rounded bg-cyber-bg-light border-2 border-cyber-primary/50 flex items-center justify-center">
                <User className="w-5 h-5 text-cyber-primary" />
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-cyber-success rounded-full border-2 border-cyber-bg-card" />
          </div>
          <div>
            <p className="font-display font-bold text-cyber-primary neon-text-cyan text-sm">
              {player?.username || 'Anonymous'}
            </p>
            {player?.teamRole && (
              <span className={cn(
                'cyber-badge text-xs',
                player.teamRole === 'leader' && 'badge-leader',
                player.teamRole === 'officer' && 'badge-officer',
                player.teamRole === 'operator' && 'badge-operator'
              )}>
                {player.teamRole.toUpperCase()}
              </span>
            )}
          </div>
        </motion.div>
      </div>

      <div className="flex items-center gap-8">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cyber-card py-2 px-4"
        >
          <Coins className="w-5 h-5 text-cyber-success" />
          <div>
            <p className="text-xs text-cyber-muted uppercase tracking-wider">加密货币</p>
            <p className="font-display font-bold text-cyber-success neon-text-green">
              {formatCredits(player?.credits || 0)}
            </p>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 cyber-card py-2 px-4"
        >
          <Trophy className="w-5 h-5 text-cyber-warning" />
          <div>
            <p className="text-xs text-cyber-muted uppercase tracking-wider">声望</p>
            <p className="font-display font-bold text-cyber-warning">
              {player?.reputation?.toLocaleString() || 0}
            </p>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={logout}
          className="cyber-btn cyber-btn-danger flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          <span>登出</span>
        </motion.button>
      </div>
    </motion.header>
  );
}
