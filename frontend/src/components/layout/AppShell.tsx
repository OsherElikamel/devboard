import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import CreateProjectModal from '../projects/CreateProjectModal';
import { LayoutProvider } from '../../contexts/LayoutContext';

export default function AppShell() {
  return (
    <LayoutProvider>
      <div className="flex min-h-screen bg-app-bg">
        <Sidebar />
        <main className="flex-1 md:ml-[260px] flex flex-col min-h-screen">
          <Outlet />
        </main>
      </div>
      <CreateProjectModal />
    </LayoutProvider>
  );
}
