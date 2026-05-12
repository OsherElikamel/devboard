import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Code2, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { name, email, password });
      const loginRes = await api.post('/auth/login', { email, password });
      await login(loginRes.data.access_token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent-hover/5" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[120px]" />

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center mx-auto mb-4">
            <Code2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-app-text">DevBoard</h1>
        </div>

        <div className="rounded-2xl p-8 border border-app-border bg-app-surface/80 backdrop-blur-xl shadow-[0_16px_40px_rgba(0,0,0,0.25)]">
          <h2 className="text-xl font-semibold text-app-text mb-1">Create your DevBoard account</h2>
          <p className="text-sm text-app-text-muted mb-6">Start tracking your developer journey.</p>

          {error && <div className="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] tracking-wide uppercase">Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required minLength={2}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] tracking-wide uppercase">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@company.com" required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] tracking-wide uppercase">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-app-text-secondary mb-1.5 font-[family-name:var(--font-tech)] tracking-wide uppercase">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-text-muted" />
                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-app-input border border-app-border text-app-text placeholder:text-app-text-muted text-sm focus:outline-none focus:border-accent transition-colors" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-accent to-accent-hover text-white font-medium text-sm transition-all duration-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] active:scale-[0.98] disabled:opacity-50">
              {loading ? 'Creating account...' : 'Register'}
            </button>
          </form>

          <p className="text-center text-sm text-app-text-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-accent hover:underline font-medium">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
