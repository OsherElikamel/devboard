import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, enterDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      await login(res.data.access_token);
      navigate('/dashboard');
    } catch {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = () => {
    enterDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-hover/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-hover/8 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center mx-auto mb-4">
            <Code2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">DevBoard</h1>
          <p className="text-sm text-slate-500 mt-1 font-[family-name:var(--font-tech)] tracking-wide uppercase">Secure Developer Access</p>
        </div>

        <div className="rounded-2xl p-8 border border-white/[0.08] bg-dark-surface/80 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
          <h2 className="text-xl font-semibold text-white mb-1">Welcome back to DevBoard</h2>
          <p className="text-sm text-slate-500 mb-6">Enter your credentials to access your dashboard</p>

          {error && <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 font-[family-name:var(--font-tech)] tracking-wide uppercase">
                Work Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5 font-[family-name:var(--font-tech)] tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/[0.08] text-white placeholder-slate-600 text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white font-medium text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div className="mt-4">
            <button
              onClick={handleDemo}
              className="w-full py-2.5 rounded-xl border border-white/[0.08] text-slate-400 font-medium text-sm hover:bg-white/5 hover:text-accent transition-all duration-200"
            >
              Explore Demo Board
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-6">
            Need an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
