import WorkspaceNav from '../components/WorkspaceNav';
import { Outlet } from 'react-router-dom';

export default function WorkspaceLayout() {
  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-indigo-200 via-purple-200 to-pink-100">
      <WorkspaceNav />
      <main className="flex-1 bg-white/80 backdrop-blur-md overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}
