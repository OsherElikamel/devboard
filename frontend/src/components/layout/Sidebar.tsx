import { LayoutDashboard, FolderKanban, CheckSquare, Settings, Shield, Code2, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLayout } from '../../contexts/LayoutContext';
import { useAuth } from '../../contexts/AuthContext';

const ADMIN_EMAIL = 'oshercft@gmail.com';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects', icon: FolderKanban, label: 'Projects' },
  { to: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar() {
  const { sidebarOpen, closeSidebar } = useLayout();
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen w-[260px] flex flex-col border-r border-app-border bg-app-surface z-50 transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        <div className="flex items-center justify-between px-6 h-[72px] border-b border-app-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent to-accent-hover flex items-center justify-center">
              <Code2 size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-app-text">DevBoard</h1>
              <p className="text-[11px] font-[family-name:var(--font-tech)] text-app-text-muted">v1.0 MVP</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-app-text-muted hover:text-app-text hover:bg-app-hover transition-colors md:hidden"
            aria-label="Close sidebar"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-app-text-secondary hover:text-app-text hover:bg-app-hover'
                }`
              }
            >
              <Icon size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
              <span className="transition-transform duration-200 group-hover:translate-x-0.5">{label}</span>
            </NavLink>
          ))}
          {isAdmin && (
            <>
              <div className="my-2 border-t border-app-border/50" />
              <NavLink
                to="/admin"
                onClick={closeSidebar}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-accent/10 text-accent'
                      : 'text-app-text-secondary hover:text-app-text hover:bg-app-hover'
                  }`
                }
              >
                <Shield size={18} className="transition-transform duration-200 group-hover:translate-x-0.5" />
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">Admin</span>
              </NavLink>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}
