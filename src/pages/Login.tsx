import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Eye, EyeOff, Terminal, Zap } from 'lucide-react';
import { useGameStore } from '@/stores/useGameStore';
import { cn } from '@/lib/utils';

export default function Login() {
  const navigate = useNavigate();
  const { login, register, isLoading, error, setError, isAuthenticated } = useGameStore();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    if (!isLogin && password !== confirmPassword) {
      setError('两次密码输入不一致');
      return;
    }

    const success = isLogin
      ? await login(username, password)
      : await register(username, password);

    if (success) {
      setGlitchActive(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setConfirmPassword('');
    setGlitchActive(true);
    setTimeout(() => setGlitchActive(false), 300);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 grid-bg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-cyber-primary/5 via-transparent to-cyber-secondary/5" />
      
      <div className="absolute top-20 left-20 w-64 h-64 bg-cyber-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyber-secondary/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className={cn(
          'relative w-full max-w-md z-10',
          glitchActive && 'animate-glitch'
        )}
      >
        <div className="cyber-card p-8 scan-line">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyber-primary via-cyber-secondary to-cyber-primary" />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <Terminal className="w-10 h-10 text-cyber-primary" />
              <motion.div
                animate={{
                  textShadow: [
                    '0 0 5px #00f5ff, 0 0 10px #00f5ff',
                    '0 0 10px #ff00ff, 0 0 20px #ff00ff',
                    '0 0 5px #00f5ff, 0 0 10px #00f5ff',
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-display text-3xl font-bold text-cyber-primary"
              >
                CYBER NET
              </motion.div>
            </div>
            <p className="text-cyber-muted text-sm font-mono">
              {isLogin ? '// 接入网络需要身份验证' : '// 在网络中创建你的身份'}
            </p>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.form
              key={isLogin ? 'login' : 'register'}
              initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                  <User className="w-4 h-4" />
                  用户名
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="ENTER_USERNAME"
                    className="cyber-input pl-4 pr-10"
                    autoComplete="username"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-cyber-primary animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                  <Lock className="w-4 h-4" />
                  密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="ENTER_PASSWORD"
                    className="cyber-input pl-4 pr-10"
                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-cyber-muted hover:text-cyber-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <label className="flex items-center gap-2 text-xs font-display tracking-wider text-cyber-muted">
                      <Lock className="w-4 h-4" />
                      确认密码
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="CONFIRM_PASSWORD"
                        className="cyber-input pl-4 pr-10"
                        autoComplete="new-password"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-cyber-danger/10 border border-cyber-danger/30 text-cyber-danger text-sm font-mono"
                  >
                    <span className="text-cyber-danger">ERROR:</span> {error}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className={cn(
                  'cyber-btn w-full py-3 flex items-center justify-center gap-2',
                  isLoading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {isLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    >
                      <Zap className="w-5 h-5" />
                    </motion.div>
                    <span>处理中...</span>
                  </>
                ) : (
                  <>
                    <Terminal className="w-5 h-5" />
                    <span>{isLogin ? '登录系统' : '创建账户'}</span>
                  </>
                )}
              </motion.button>
            </motion.form>
          </AnimatePresence>

          <div className="mt-8 text-center">
            <p className="text-cyber-muted text-sm">
              {isLogin ? '还没有账户？' : '已有账户？'}
              <button
                onClick={toggleMode}
                className="ml-2 text-cyber-primary hover:neon-text-cyan transition-all font-bold"
              >
                {isLogin ? '立即注册' : '返回登录'}
              </button>
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-cyber-primary/20">
            <div className="flex items-center justify-between text-xs text-cyber-muted font-mono">
              <span>v2.0.77</span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyber-success animate-pulse" />
                网络在线
              </span>
              <span>NODE://{Math.random().toString(16).slice(2, 10).toUpperCase()}</span>
            </div>
          </div>
        </div>

        <div className="absolute -inset-px bg-gradient-to-r from-cyber-primary/50 via-cyber-secondary/50 to-cyber-primary/50 blur-xl opacity-30 -z-10" />
      </motion.div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center">
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="font-mono text-xs text-cyber-muted"
        >
          {'>'} 未经授权的访问将被追踪和起诉 {'<'}
        </motion.div>
        <div className="mt-2 font-display text-lg tracking-widest text-cyber-primary/50">
          THE NET IS WATCHING
        </div>
      </div>
    </div>
  );
}
