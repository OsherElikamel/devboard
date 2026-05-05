import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Topbar from '../components/layout/Topbar';

export default function SettingsPage() {
  const { user, isDemo, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <>
      <Topbar title="User Preferences" subtitle="Manage your profile, account security, and dashboard interface settings." />

      <div className="flex-1 p-8 space-y-6 overflow-y-auto">
        {/* Profile */}
        <div className="rounded-2xl p-6 border border-app-border bg-app-surface">
          <h3 className="text-lg font-semibold text-app-text mb-4">Profile Settings</h3>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/30 to-accent-hover/30 flex items-center justify-center text-2xl font-bold text-accent">
              {isDemo ? 'G' : user?.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-app-text font-medium text-lg">{isDemo ? 'Demo Guest' : user?.name || 'Unknown'}</p>
              <p className="text-sm text-app-text-muted">{isDemo ? 'guest@devboard.demo' : user?.email || ''}</p>
              {isDemo && (
                <p className="text-xs text-warning mt-1 font-[family-name:var(--font-tech)]">Demo mode - changes won't be saved</p>
              )}
            </div>
          </div>
        </div>

        {/* Interface */}
        <div className="rounded-2xl p-6 border border-app-border bg-app-surface">
          <h3 className="text-lg font-semibold text-app-text mb-4">Interface</h3>
          <div className="flex gap-4">
            <button
              onClick={() => theme !== 'dark' && toggleTheme()}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                theme === 'dark' ? 'border-accent bg-accent/10' : 'border-app-border hover:border-accent/30'
              }`}
            >
              <p className="text-app-text font-medium">Dark Mode</p>
              <p className="text-xs text-app-text-muted">Easy on the eyes</p>
            </button>
            <button
              onClick={() => theme !== 'light' && toggleTheme()}
              className={`flex-1 p-4 rounded-xl border transition-all ${
                theme === 'light' ? 'border-accent bg-accent/10' : 'border-app-border hover:border-accent/30'
              }`}
            >
              <p className="text-app-text font-medium">Light Mode</p>
              <p className="text-xs text-app-text-muted">Classic and clean</p>
            </button>
          </div>
        </div>

        {/* Account */}
        <div className="rounded-2xl p-6 border border-app-border bg-app-surface">
          <h3 className="text-lg font-semibold text-app-text mb-4">Account & Security</h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-app-text-secondary">Signed in as <span className="text-app-text">{isDemo ? 'Guest' : user?.email}</span></p>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 rounded-xl border border-danger/30 text-danger text-sm font-medium hover:bg-danger/10 transition-colors"
            >
              Logout Session
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
