import { useState, useRef, useEffect } from 'react';

export default function UserMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = {
    name: 'Иван Петров',
    avatarUrl: '/photo_2022-03-11_18-46-40.png',
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <img
          src={user.avatarUrl}
          alt="avatar"
          className="w-9 h-9 rounded-full object-cover border border-gray-300"
        />
        <span className="font-medium text-gray-700 hidden md:inline">{user.name}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-md z-50">
          <button
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
          >
            Выйти
          </button>
        </div>
      )}
    </div>
  );
}
