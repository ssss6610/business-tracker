import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import {
  MessageSquare,
  Calendar,
  Users,
  Mail,
  LayoutGrid,
  BarChart2,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menu = [
  { label: 'Лента', icon: LayoutGrid, to: '/workspace', exact: true },
  { label: 'Чат', icon: MessageSquare, to: '/workspace/chat' },
  { label: 'Календарь', icon: Calendar, to: '/workspace/calendar' },
  { label: 'Трекер', icon: ClipboardList, to: '/workspace/tracker' },
  { label: 'Сотрудники', icon: Users, to: '/workspace/employees' },
  { label: 'Почта', icon: Mail, to: '/workspace/mail' },
  { label: 'Аналитика', icon: BarChart2, to: '/workspace/analytics' },
];

export default function WorkspaceNav() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`${
        collapsed ? 'w-16' : 'w-64'
      } bg-gradient-to-b from-indigo-700 to-purple-600 text-white transition-all duration-300 p-4 flex flex-col`}
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="self-end mb-6 text-white hover:text-gray-300 transition"
      >
        {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
      </button>

      {!collapsed && <h2 className="text-2xl font-bold mb-6">Workspace</h2>}

      <nav className="flex flex-col gap-3">
        {menu.map(({ label, icon: Icon, to, exact }) => (
  <NavLink
    key={to}
    to={to}
    end={exact}
    className={({ isActive }) =>
      `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} 
      px-3 py-3 rounded hover:bg-white/10 transition 
      ${isActive ? 'bg-white/20 font-semibold' : ''}`
    }
  >
    <div className={`flex items-center justify-center 
      ${collapsed ? 'w-10 h-10' : 'w-6 h-6'}`}>
      <Icon
        size={collapsed ? 28 : 20} // 💡 Надёжнее, чем w/h
        strokeWidth={2}
        className="text-white"
      />
    </div>
    {!collapsed && <span className="whitespace-nowrap">{label}</span>}
  </NavLink>
        ))}
      </nav>
    </aside>
  );
}
