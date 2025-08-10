import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdLogout } from "react-icons/md";
import { FaUserCog } from "react-icons/fa";
import { MdOutlineMonitorHeart } from "react-icons/md";
import { FaUsers } from "react-icons/fa6";
import { MdArrowBack } from "react-icons/md";
import { MdArrowForward } from "react-icons/md";
import { useState } from 'react';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const linkClass = (path: string) =>
  `relative flex items-center gap-2 px-3 py-2 rounded hover:bg-blue-100 transition ${
    location.pathname === path
      ? 'bg-blue-200 font-semibold before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-blue-600 before:rounded-r'
      : ''
  }`;

  return (
    <div
      className={`${
        collapsed ? 'w-16 items-center' : 'w-64 items-start'
      } h-screen bg-gray-100 shadow-md px-4 py-4 flex flex-col transition-all duration-300`}
    >
      {/* Кнопка сворачивания */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Развернуть' : 'Свернуть'}
        className={`mb-6 text-gray-700 hover:text-black flex items-center px-10 gap-2 ${collapsed ? 'justify-center' : ''}`}>
        {collapsed ? (<MdArrowForward />) : (<span className="flex items-center gap-2"> <MdArrowBack className={`transform transition-transform duration-300 ${
    collapsed ? '-rotate-180' : ''
  }`} />Свернуть</span> )}
      </button>

      {!collapsed && <h2 className="text-xl font-bold px-4 mb-5 w-full">Админ-панель</h2>}

      <nav className="flex-1 space-y-2">
        <div title='Пользователи'>
          <Link to="/admin" className={linkClass('/admin')}> <span className="flex items-center gap-2"><FaUsers /> {!collapsed && 'Пользователи'}</span></Link>
        </div>
        <div title='Мониторинг'>
           <Link to="/monitoring" className={linkClass('/monitoring')}><span className="flex items-center gap-2"><MdOutlineMonitorHeart />{!collapsed && 'Мониторинг'}</span></Link>
        </div>
        <div title='Роли'>
          <Link to="/roles" className={linkClass('/roles')}><span className="flex items-center gap-2"><FaUserCog />{!collapsed && 'Роли'}</span></Link>
        </div>
        <div title='Пороги'>
          <Link to="/thresholds" className={linkClass('/thresholds')}><span className="flex items-center gap-2"><FaUserCog />{!collapsed && 'Пороги'}</span></Link>
        </div>
      </nav>

      <div className="border-t border-gray-400 pt-4">
<button
  onClick={handleLogout}
  title={collapsed ? 'Выход' : 'Выход'}
  className={`w-full ${
    collapsed ? 'p-2 justify-center' : 'py-2 px-15 justify-start'
  } bg-green-600 hover:bg-blue-700 text-white rounded flex items-center gap-2`}>
  <MdLogout />
  {!collapsed && <span className="text-sm">Выйти</span>}
</button>



      </div>
    </div>
  );
}
