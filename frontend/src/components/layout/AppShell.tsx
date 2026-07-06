import { Outlet } from 'react-router-dom';
import { Eye } from 'lucide-react';
import Sidebar from './Sidebar';
import CreateProjectModal from '../projects/CreateProjectModal';
import { LayoutProvider } from '../../contexts/LayoutContext';
import { ToastProvider } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

export default function AppShell() {
  const { isDemo } = useAuth();

  return (
    <LayoutProvider>
      <ToastProvider>
        <div className="flex min-h-screen bg-app-bg">
          <Sidebar />
          <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
            {isDemo && (
              <div className="flex items-center justify-center gap-2 px-4 py-1.5 bg-warning/10 border-b border-warning/20 text-warning text-xs font-medium">
                <Eye size={13} />
                Demo mode — explore and edit freely, nothing is saved.
              </div>
            )}
            <Outlet />
          </main>
        </div>
        <CreateProjectModal />
      </ToastProvider>
    </LayoutProvider>
  );
}
