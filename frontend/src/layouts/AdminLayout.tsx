import Sidebar from '../components/AdminSidebar';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Шапка — единственная */}
      <header className="h-16 border-b bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-2 font-bold text-lg">
          <img
            src={localStorage.getItem('companyLogo') || '/vite.svg'}
            alt="logo"
            className="w-8 h-8"
          />
          {localStorage.getItem('companyName') || 'Business Tracker'}
        </div>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">ИП</div>
          <span className="font-medium">Иван Петров</span>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="shrink-0">
          <Sidebar />
        </aside>

        {/* Главная рабочая область со скроллом */}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          {/* Не ограничивай страницы фиксированными h-screen внутри! */}
          <Outlet />
          {/* небольшой нижний отступ для комфортного скролла */}
          <div className="h-8" />
        </main>
      </div>
    </div>
  );
}
