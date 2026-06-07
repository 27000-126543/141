import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  FileText,
  TrendingUp,
  Target,
  Users,
  Zap,
  Download,
  Calendar,
  Award,
  BarChart3,
  Activity,
} from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import { exportToPDF } from '@/utils/pdfExport';
import { cn } from '@/lib/utils';
import { formatCredits } from '@/data/mockData';

export default function WeeklyReport() {
  const { weeklyReport, getWeeklyReport, isLoading, player } = useGameStore();
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    getWeeklyReport();
  }, [getWeeklyReport]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const handleExport = async () => {
    if (!weeklyReport) return;
    setExporting(true);
    try {
      await exportToPDF('report-content', `周报_${weeklyReport.weekStart}_${weeklyReport.weekEnd}.pdf`);
    } catch (error) {
      console.error('导出失败:', error);
    } finally {
      setExporting(false);
    }
  };

  if (!player) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="cyber-card p-8 text-center max-w-md">
          <FileText className="w-16 h-16 text-cyber-danger mx-auto mb-4" />
          <h2 className="font-display text-2xl font-bold text-cyber-danger mb-2">访问被拒绝</h2>
          <p className="text-cyber-muted">请先登录以查看周报</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto p-6 space-y-6"
    >
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold text-cyber-primary neon-text-cyan">
            团队周报
          </h1>
          {weeklyReport && (
            <p className="text-cyber-muted font-mono text-sm mt-1">
              // {weeklyReport.weekStart} 至 {weeklyReport.weekEnd}
            </p>
          )}
        </div>
        <button
          onClick={handleExport}
          disabled={!weeklyReport || isLoading || exporting}
          className="cyber-btn flex items-center gap-2"
        >
          <Download className="w-5 h-5" />
          {exporting ? '导出中...' : '导出 PDF'}
        </button>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-12 h-12 border-4 border-cyber-primary border-t-transparent rounded-full" />
        </div>
      ) : weeklyReport ? (
        <div id="report-content" className="space-y-6">
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="cyber-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-primary/10 rounded-lg">
                  <Target className="w-6 h-6 text-cyber-primary" />
                </div>
                <div>
                  <p className="text-cyber-muted text-xs font-display">总入侵次数</p>
                  <p className="font-mono text-2xl font-bold text-cyber-primary">
                    {weeklyReport.teamStats.totalHacks}
                  </p>
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-success/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-cyber-success" />
                </div>
                <div>
                  <p className="text-cyber-muted text-xs font-display">成功率</p>
                  <p className="font-mono text-2xl font-bold text-cyber-success">
                    {(weeklyReport.teamStats.successRate * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-warning/10 rounded-lg">
                  <Award className="w-6 h-6 text-cyber-warning" />
                </div>
                <div>
                  <p className="text-cyber-muted text-xs font-display">总积分</p>
                  <p className="font-mono text-2xl font-bold text-cyber-warning">
                    {weeklyReport.teamStats.totalPoints.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="cyber-card">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-cyber-secondary/10 rounded-lg">
                  <Zap className="w-6 h-6 text-cyber-secondary" />
                </div>
                <div>
                  <p className="text-cyber-muted text-xs font-display">总收益</p>
                  <p className="font-mono text-2xl font-bold text-cyber-secondary">
                    {formatCredits(weeklyReport.teamStats.totalCreditsEarned)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="cyber-card">
              <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
                <Target className="w-5 h-5" />
                目标热度分布
              </h3>
              <div className="space-y-3">
                {weeklyReport.targetHeatmap.map((target, index) => (
                  <div key={target.targetId} className="p-3 bg-cyber-bg-light rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-cyber-primary">{target.targetName}</span>
                      <span className="text-sm text-cyber-muted">
                        攻击 {target.attackCount} 次 | 成功率 {(target.successRate * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="progress-bar h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${target.successRate * 100}%` }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="progress-bar-fill"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="cyber-card">
              <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                技能分布
              </h3>
              <div className="space-y-4">
                {Object.entries(weeklyReport.skillDistribution).map(([skill, value], index) => {
                  const skillValue = value as number;
                  return (<div key={skill}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-cyber-muted capitalize">
                        {skill === 'cracking' ? '破解' : skill === 'programming' ? '编程' : '隐身'}
                      </span>
                      <span className="font-mono text-cyber-primary">{skillValue}%</span>
                    </div>
                    <div className="progress-bar h-3">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${skillValue}%` }}
                        transition={{ delay: index * 0.15, duration: 0.5 }}
                        className={cn(
                          'progress-bar-fill',
                          skill === 'cracking' && 'bg-cyber-primary',
                          skill === 'programming' && 'bg-cyber-success',
                          skill === 'stealth' && 'bg-cyber-secondary',
                        )}
                        style={{
                          background: skill === 'cracking'
                            ? 'linear-gradient(90deg, #00f5ff, #00ff88)'
                            : skill === 'programming'
                            ? 'linear-gradient(90deg, #00ff88, #ff00ff)'
                            : 'linear-gradient(90deg, #ff00ff, #00f5ff)',
                        }}
                      />
                    </div>
                  </div>);
                })}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="cyber-card">
            <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              成员表现
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-primary/30">
                    <th className="text-left py-3 px-4 text-cyber-muted font-display text-sm">排名</th>
                    <th className="text-left py-3 px-4 text-cyber-muted font-display text-sm">成员</th>
                    <th className="text-left py-3 px-4 text-cyber-muted font-display text-sm">参与入侵</th>
                    <th className="text-left py-3 px-4 text-cyber-muted font-display text-sm">贡献分数</th>
                  </tr>
                </thead>
                <tbody>
                  {weeklyReport.memberPerformance
                    .sort((a, b) => b.contributionScore - a.contributionScore)
                    .map((member, index) => (
                      <motion.tr
                        key={member.playerId}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="border-b border-cyber-primary/10 hover:bg-cyber-primary/5"
                      >
                        <td className="py-3 px-4">
                          <span className={cn(
                            'font-mono font-bold',
                            index === 0 && 'text-cyber-warning',
                            index === 1 && 'text-cyber-muted',
                            index === 2 && 'text-cyber-danger',
                            index > 2 && 'text-cyber-primary',
                          )}>
                            #{index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-cyber-primary">{member.username}</td>
                        <td className="py-3 px-4 font-mono text-cyber-muted">{member.hacksParticipated}</td>
                        <td className="py-3 px-4 font-mono text-cyber-success">{member.contributionScore}</td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="cyber-card">
            <h3 className="font-display text-lg font-bold text-cyber-primary mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5" />
              团队成长曲线
            </h3>
            <div className="h-48 flex items-end justify-around gap-2">
              {weeklyReport.teamGrowth.map((data, index) => (
                <motion.div
                  key={data.date}
                  initial={{ height: 0 }}
                  animate={{ height: `${(data.power / 1000) * 100}%` }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-cyber-primary to-cyber-secondary rounded-t-lg relative group"
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="cyber-card py-1 px-2 text-xs whitespace-nowrap">
                      <p className="font-mono text-cyber-primary">{data.date}</p>
                      <p className="font-mono text-cyber-success">战力: {data.power}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="flex justify-around mt-2 text-xs text-cyber-muted font-mono">
              {weeklyReport.teamGrowth.map((data) => (
                <span key={data.date}>{data.date.slice(5)}</span>
              ))}
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="cyber-card p-8 text-center max-w-md">
            <Calendar className="w-16 h-16 text-cyber-muted mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold text-cyber-muted mb-2">暂无周报数据</h2>
            <p className="text-cyber-muted">请稍后再试</p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
