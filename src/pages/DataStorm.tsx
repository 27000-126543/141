import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Users,
  Plus,
} from 'lucide-react';
import type { StormStatus } from '../../shared/types';
import { useGameStore } from '../stores/useGameStore';
import Empty from '../components/Empty';
import StormCard from '../components/StormCard';
import ActiveStormCard from '../components/ActiveStormCard';
import CreateStormModal from '../components/CreateStormModal';

export default function DataStorm() {
  const { player, team, activeDataStorms, hackTargets, createDataStorm, joinDataStorm } = useGameStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [countdowns, setCountdowns] = useState<Record<string, number>>({});

  const isLeader = player && team && team.leaderId === player.id;

  const recruitingStorms = useMemo(
    () => activeDataStorms.filter(s => s.status === 'recruiting' || s.status === 'countdown'),
    [activeDataStorms]
  );

  const activeStorms = useMemo(
    () => activeDataStorms.filter(s => s.status === 'active'),
    [activeDataStorms]
  );

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, number> = {};
      activeDataStorms.forEach(storm => {
        if (storm.countdownEndTime) {
          const remaining = Math.max(0, Math.floor((new Date(storm.countdownEndTime).getTime() - Date.now()) / 1000));
          newCountdowns[storm.id] = remaining;
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDataStorms]);

  const handleCreateStorm = async () => {
    if (!selectedTarget) return;
    const success = await createDataStorm(selectedTarget);
    if (success) {
      setShowCreateModal(false);
      setSelectedTarget('');
    }
  };

  const handleJoinStorm = async (stormId: string) => {
    await joinDataStorm(stormId);
  };

  const getStatusLabel = (status: StormStatus) => {
    switch (status) {
      case 'recruiting': return '招募中';
      case 'countdown': return '准备中';
      case 'active': return '进行中';
      case 'completed': return '已完成';
      case 'failed': return '已失败';
    }
  };

  const getStatusColor = (status: StormStatus) => {
    switch (status) {
      case 'recruiting': return 'text-cyber-success border-cyber-success';
      case 'countdown': return 'text-cyber-warning border-cyber-warning';
      case 'active': return 'text-cyber-primary border-cyber-primary';
      case 'completed': return 'text-cyber-success border-cyber-success';
      case 'failed': return 'text-cyber-danger border-cyber-danger';
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-6"
        >
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 neon-text-magenta">
              <Zap className="w-8 h-8 inline mr-2 text-cyber-secondary" />
              数据风暴
            </h1>
            <p className="text-cyber-muted">联合多支团队，发动大规模入侵行动</p>
          </div>

          {isLeader && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="cyber-btn cyber-btn-success flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              创建风暴
            </motion.button>
          )}
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-display font-bold mb-4 flex items-center gap-2"
            >
              <Users className="w-5 h-5 text-cyber-success" />
              招募中风暴
            </motion.h2>

            {recruitingStorms.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-4">
                {recruitingStorms.map((storm, index) => (
                  <motion.div
                    key={storm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <StormCard
                      storm={storm}
                      countdown={countdowns[storm.id] || 0}
                      statusLabel={getStatusLabel(storm.status)}
                      statusColor={getStatusColor(storm.status)}
                      onJoin={() => handleJoinStorm(storm.id)}
                      canJoin={!!team && !storm.participantTeams.some(p => p.teamId === team?.id)}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div>
            <motion.h2
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-display font-bold mb-4 flex items-center gap-2"
            >
              <Zap className="w-5 h-5 text-cyber-primary" />
              进行中风暴
            </motion.h2>

            {activeStorms.length === 0 ? (
              <Empty />
            ) : (
              <div className="space-y-6">
                {activeStorms.map((storm, index) => (
                  <motion.div
                    key={storm.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <ActiveStormCard storm={storm} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showCreateModal && (
          <CreateStormModal
            targets={hackTargets}
            selectedTarget={selectedTarget}
            onSelectTarget={setSelectedTarget}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreateStorm}
          />
        )}
      </AnimatePresence>
    </div>
  );
}


