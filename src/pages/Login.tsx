import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, User, Shield } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { authApi } from '@/api';
import Button from '@/components/Button';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ username, password });
      login(res.accessToken, res.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || '登录失败，请检查用户名和密码');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-tunnel-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-tunnel-info/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-tunnel-accent/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-tunnel-border/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-tunnel-border/20 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] border border-tunnel-border/10 rounded-full" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="bg-tunnel-surface/80 backdrop-blur-xl border border-tunnel-border rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tunnel-info/20 mb-4">
              <Shield className="w-8 h-8 text-tunnel-info" />
            </div>
            <h1 className="text-2xl font-bold text-tunnel-text mb-2">隧道事件检测系统</h1>
            <p className="text-tunnel-text-dim text-sm">智慧隧道 · 安全监控 · 应急指挥</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-tunnel-danger/10 border border-tunnel-danger/30 rounded-lg text-tunnel-danger text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tunnel-text-dim">用户名</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tunnel-text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                  required
                  className="w-full pl-10 pr-3 py-2.5 bg-tunnel-bg border border-tunnel-border rounded-lg text-tunnel-text placeholder-tunnel-text-muted text-sm focus:outline-none focus:border-tunnel-info focus:ring-1 focus:ring-tunnel-info/50"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-tunnel-text-dim">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-tunnel-text-muted" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-tunnel-bg border border-tunnel-border rounded-lg text-tunnel-text placeholder-tunnel-text-muted text-sm focus:outline-none focus:border-tunnel-info focus:ring-1 focus:ring-tunnel-info/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-tunnel-text-muted hover:text-tunnel-text-dim transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full py-3" loading={loading} size="lg">
              登 录
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-tunnel-border">
            <p className="text-center text-xs text-tunnel-text-muted">
              © 2024 隧道事件检测与处置系统 v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
