import { Plus, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useLayout } from '../../contexts/LayoutContext';
import ThemeToggle from '../ui/ThemeToggle';

interface Props {
  title: string;
  subtitle?: string;
}

export default function Topbar({ title, subtitle }: Props) {
  const { user, isDemo, logout } = useAuth();
  const { toggleSidebar, openCreateProject } = useLayout();

  return (
    <header className="h-[72px] flex items-center justify-between px-4 md:px-8 border-b border-app-border">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors md:hidden shrink-0"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="min-w-0">
          <h2 className="text-xl font-bold text-app-text truncate">{title}</h2>
          {subtitle && <p className="text-sm text-app-text-muted truncate hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {!isDemo && (
          <button
            onClick={openCreateProject}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-all duration-200 hover:shadow-[0_0_20px_rgba(56,189,248,0.3)]"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">New Project</span>
          </button>
        )}

        <ThemeToggle />

        <div className="flex items-center gap-3 pl-3 border-l border-app-border">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent/30 to-accent-hover/30 flex items-center justify-center text-xs font-bold text-accent">
            {isDemo ? 'G' : user?.name?.charAt(0).toUpperCase() || '?'}
          </div>
          {(user || isDemo) && (
            <button onClick={logout} className="p-2 rounded-xl text-app-text-muted hover:text-danger transition-colors" aria-label="Logout">
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
