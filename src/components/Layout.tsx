import { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import AnnouncementTicker from './AnnouncementTicker';
import ErrorToast from './ErrorToast';
import LoadingSpinner from './LoadingSpinner';
import { useGameStore } from '@/stores/useGameStore';

interface LayoutProps {
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

const pathToPageMap: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/team': 'team',
  '/hack': 'hack',
  '/market': 'darknet',
  '/storm': 'datastorm',
  '/weekly': 'weekly',
  '/ranking': 'ranking',
  '/profile': 'dashboard',
};

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading } = useGameStore();

  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    const page = pathToPageMap[location.pathname] || 'dashboard';
    setActivePage(page);
  }, [location.pathname]);

  const handlePageChange = (page: string) => {
    const pageToPathMap: Record<string, string> = {
      'dashboard': '/dashboard',
      'team': '/team',
      'hack': '/hack',
      'darknet': '/market',
      'datastorm': '/storm',
      'weekly': '/weekly',
      'ranking': '/ranking',
    };
    const path = pageToPathMap[page] || '/dashboard';
    navigate(path);
  };

  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyber-primary/5 via-transparent to-transparent" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyber-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyber-secondary/5 rounded-full blur-3xl" />
      </div>

      <ErrorToast />

      {isLoading && (
        <LoadingSpinner fullScreen label="系统处理中..." />
      )}

      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        <Sidebar activePage={activePage} onPageChange={handlePageChange} />

        <main className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              variants={pageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="flex-1 overflow-y-auto"
            >
              {children}
            </motion.div>
          </AnimatePresence>

          <AnnouncementTicker />
        </main>
      </div>
    </div>
  );
}
