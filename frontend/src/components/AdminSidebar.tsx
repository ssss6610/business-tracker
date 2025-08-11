import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { MdLogout, MdArrowBack, MdArrowForward, MdOutlineMonitorHeart, MdSettings } from 'react-icons/md';
import { FaUsers, FaUserCog } from 'react-icons/fa';
import { CirclePlus } from 'lucide-react';

export default function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const item = (
    to: string,
    icon: JSX.Element,
    label: string,
    opts?: { end?: boolean }
  ) => (
    <NavLink
      to={to}
      end={opts?.end}
      className={({ isActive }) =>
        `relative flex items-center gap-3 px-3 py-2 rounded transition hover:bg-blue-100
         ${isActive
            ? 'bg-blue-200 font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-600 before:rounded-r'
            : ''}`
      }
      title={label}
    >
      {icon}
      {!collapsed && label}
    </NavLink>
  );

  return (
    <div className={`${collapsed ? 'w-16 items-center' : 'w-64 items-start'}
      min-h-full bg-gray-100 shadow-md px-4 py-4 flex flex-col transition-all duration-300`}>
      <button
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Развернуть' : 'Свернуть'}
        className={`mb-6 text-gray-700 hover:text-black flex items-center gap-2 ${collapsed ? 'justify-center w-full' : 'px-2'}`}>
        {collapsed ? <MdArrowForward size={18}/> : <><MdArrowBack size={18}/><span className="text-sm">Свернуть</span></>}
      </button>

      {!collapsed && <h2 className="text-xl font-bold px-2 mb-5 w-full">Админ-панель</h2>}

      <nav className="flex-1 space-y-2">
        {item('/admin', <FaUsers size={20}/>, 'Пользователи', { end: true })}
        {item('/admin/monitoring', <MdOutlineMonitorHeart size={20}/>, 'Мониторинг')}
        {item('/admin/roles', <FaUserCog size={20}/>, 'Роли')}
        {item('/admin/thresholds', <CirclePlus size={20}/>, 'Пороги')}
        {item('/admin/settings', <MdSettings size={20}/>, 'Персонализация')}
      </nav>

      <div className="border-t border-gray-300 pt-4 w-full">
        <button
          onClick={handleLogout}
          title="Выход"
          className={`w-full ${collapsed ? 'p-2 justify-center' : 'py-2 px-4 justify-start'}
            bg-green-600 hover:bg-blue-700 text-white rounded flex items-center gap-2`}>
          <MdLogout size={20}/>
          {!collapsed && <span className="text-sm">Выйти</span>}
        </button>
      </div>
    </div>
  );
}
