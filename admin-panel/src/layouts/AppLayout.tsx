import { Outlet } from 'react-router-dom';
import UserMenu from '../components/UserMenu';

export default function AppLayout() {
  return (
    <div className="flex flex-col h-screen">
      <header className="flex items-center justify-between bg-white shadow px-6 py-3">
        {/* Логотип */}
        <div className="flex items-center gap-2">
          <img src="/vite.svg" alt="logo" className="h-8" />
          <span className="text-xl font-bold text-gray-800">Business Tracker</span>
        </div>

        {/* Меню пользователя */}
        <UserMenu />
      </header>

      <main className="flex-1 overflow-auto bg-gray-50 p-6">
        <Outlet />
      </main>
    </div>
  );
}
