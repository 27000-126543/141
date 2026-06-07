import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  Globe,
  Zap,
  FileText,
  Trophy,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItem {
  id: string;
  label: string;
  icon: typeof LayoutDashboard;
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: '主控台', icon: LayoutDashboard },
  { id: 'team', label: '团队', icon: Users },
  { id: 'hack', label: '入侵中心', icon: ShieldAlert },
  { id: 'market', label: '暗网', icon: Globe },
  { id: 'storm', label: '数据风暴', icon: Zap },
  { id: 'weekly', label: '周报', icon: FileText },
  { id: 'ranking', label: '排行榜', icon: Trophy },
  { id: 'profile', label: '个人中心', icon: User },
];

interface SidebarProps {
  activePage?: string;
  onPageChange?: (page: string) => void;
}

export default function Sidebar({ activePage = 'dashboard', onPageChange }: SidebarProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  const handleItemClick = (id: string) => {
    onPageChange?.(id);
  };

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: 0.2 }}
      className="w-64 bg-cyber-bg-card/95 border-r border-cyber-primary/30 backdrop-blur-sm flex flex-col relative"
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 h-full w-px bg-gradient-to-b from-transparent via-cyber-primary/30 to-transparent" />
      </div>

      <div className="p-6 border-b border-cyber-primary/20">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded bg-gradient-to-br from-cyber-primary to-cyber-secondary flex items-center justify-center">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-cyber-primary neon-text-cyan">
              CYBERNET
            </h1>
            <p className="text-xs text-cyber-muted">v2.0.77</p>
          </div>
        </motion.div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          const isHovered = hoveredItem === item.id;

          return (
            <motion.button
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + index * 0.05 }}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleItemClick(item.id)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-all duration-300 relative overflow-hidden group',
                isActive
                  ? 'bg-cyber-primary/20 border-l-2 border-cyber-primary text-cyber-primary neon-text-cyan'
                  : 'text-gray-400 hover:text-cyber-primary border-l-2 border-transparent hover:border-cyber-primary/50'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute inset-0 bg-gradient-to-r from-cyber-primary/20 to-transparent"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <div className="relative z-10">
                <Icon
                  className={cn(
                    'w-5 h-5 transition-all duration-300',
                    isActive && 'neon-text-cyan',
                    isHovered && !isActive && 'text-cyber-primary drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]'
                  )}
                />
              </div>

              <span
                className={cn(
                  'relative z-10 font-display text-sm tracking-wider transition-all duration-300',
                  isActive && 'neon-text-cyan',
                  isHovered && !isActive && 'text-cyber-primary drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]'
                )}
              >
                {item.label}
              </span>

              {isHovered && !isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute right-4 w-2 h-2 bg-cyber-primary rounded-full shadow-neon-cyan"
                />
              )}
            </motion.button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-cyber-primary/20">
        <div className="cyber-card p-3">
          <p className="text-xs text-cyber-muted mb-2">系统状态</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyber-success rounded-full animate-pulse" />
            <span className="text-sm text-cyber-success font-mono">ONLINE</span>
          </div>
          <p className="text-xs text-cyber-muted mt-2 font-mono">
            LATENCY: 12ms
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
