import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface LayoutState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  createProjectOpen: boolean;
  openCreateProject: () => void;
  closeCreateProject: () => void;
}

const LayoutContext = createContext<LayoutState | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen(v => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);
  const openCreateProject = useCallback(() => setCreateProjectOpen(true), []);
  const closeCreateProject = useCallback(() => setCreateProjectOpen(false), []);

  return (
    <LayoutContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar, createProjectOpen, openCreateProject, closeCreateProject }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout must be used within LayoutProvider');
  return ctx;
}
