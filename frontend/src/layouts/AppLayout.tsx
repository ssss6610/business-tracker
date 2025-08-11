import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import UserMenu from '../components/UserMenu';
import { fetchCompanySettings } from '../utils/companySettings';

type CompanySettings = { name: string; logoUrl?: string | null };

export default function AppLayout() {
  const [company, setCompany] = useState<CompanySettings>({ name: '', logoUrl: null });

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const data = await fetchCompanySettings();
        if (mounted) setCompany(data);
      } catch {
        /* ignore */
      }
    })();

    const onUpdated = (e: Event) => {
      const detail = (e as CustomEvent<CompanySettings>).detail;
      if (detail) setCompany(detail);
      else fetchCompanySettings().then(setCompany).catch(() => {});
    };

    window.addEventListener('company:updated', onUpdated);
    return () => {
      mounted = false;
      window.removeEventListener('company:updated', onUpdated);
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      {/* верхняя панель */}
      <header className="h-14 border-b bg-white flex items-center justify-between px-4">
        <div className="flex items-center gap-3 min-w-0">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt="Логотип компании"
              className="h-8 w-8 rounded-full object-cover"
              draggable={false}
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200" />
          )}
          <span className="text-lg font-semibold truncate">
            {company.name || 'Компания'}
          </span>
        </div>

        {/* твой пользовательский меню/аватар */}
        <UserMenu />
      </header>

      {/* контент */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
