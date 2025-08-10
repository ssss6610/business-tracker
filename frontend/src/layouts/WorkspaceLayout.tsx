import { Outlet } from 'react-router-dom';
import WorkspaceNav from '../components/WorkspaceNav';

export default function WorkspaceLayout() {
  return (
    <div className="flex h-full">
      {/* Сайдбар + разделитель */}
      <div className="flex border-r border-gray-200">
        <WorkspaceNav />
      </div>

      {/* Основной контент */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
