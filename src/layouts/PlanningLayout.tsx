import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/shell/Sidebar';
import { AppHeader } from '../components/shell/AppHeader';
import { usePlanningStore } from '../store/planningStore';

export function PlanningLayout() {
  const error = usePlanningStore((s) => s.error);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col bg-white">
        <AppHeader />
        {error && (
          <div className="mx-8 mt-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-jira-btn">
            {error}
          </div>
        )}
        <div className="flex-1 overflow-auto bg-atlassian-background p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
