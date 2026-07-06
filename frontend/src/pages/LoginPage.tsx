import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Code2, Mail, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import * as authService from '../services/auth';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function LoginPage() {
  useDocumentTitle('Log in · DevBoard');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, enterDemo } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const sessionExpired = searchParams.get('expired') === '1';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const token = await authService.login(email, password);
      await login(token);
      const returnTo = sessionStorage.getItem('devboard_return_to');
      sessionStorage.removeItem('devboard_return_to');
      navigate(returnTo || '/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-app-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-hover/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent-hover/8 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center mx-auto mb-4">
            <Code2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-app-text">DevBoard</h1>
          <p className="text-sm text-app-text-muted mt-1 font-[family-name:var(--font-tech)] tracking-wide uppercase">Personal project tracker</p>
        </div>

        <div className="rounded-2xl p-8 border border-app-border bg-app-surface/80 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
          <h2 className="text-xl font-semibold text-app-text mb-1">Welcome back to DevBoard</h2>
          <p className="text-sm text-app-text-muted mb-6">Log in to pick up where you left off</p>

          {sessionExpired && !error && (
            <div className="mb-4 p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm">
              Your session expired — please log in again.
            </div>
          )}
          {error && <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] tracking-wide uppercase">
                Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors"
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
              className="w-full py-2.5 rounded-xl border border-app-border text-app-text-secondary font-medium text-sm hover:bg-app-hover hover:text-accent transition-all duration-200"
            >
              Explore Demo Board
            </button>
          </div>

          <p className="text-center text-sm text-app-text-muted mt-6">
            Need an account?{' '}
            <Link to="/register" className="text-accent hover:underline font-medium">Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
