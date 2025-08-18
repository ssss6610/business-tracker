import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { getApiBase } from '../utils/getApiBase';
import { DEFAULT_BRAND } from '../utils/defaultBranding';

type Branding = { name: string; logoUrl: string | null };

function toAbsolute(url: string | null, apiBase: string): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (url.startsWith('/uploads')) return `${apiBase}${url}`;
  return url; // public (/logo.png)
}

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [brand, setBrand] = useState<Branding>({
    name: DEFAULT_BRAND.name,
    logoUrl: DEFAULT_BRAND.logoUrl,
  });
  const [cacheBust, setCacheBust] = useState<number>(Date.now());
  const [apiBase, setApiBase] = useState<string>(window.location.origin);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      const base = await getApiBase();
      setApiBase(base);
      try {
        const res = await fetch(`${base}/public/company`);
        if (res.ok) {
          const data = await res.json();
          setBrand({
            name: data?.name || DEFAULT_BRAND.name,
            logoUrl: data?.logoUrl ?? DEFAULT_BRAND.logoUrl,
          });
        } else {
          setBrand({ name: DEFAULT_BRAND.name, logoUrl: DEFAULT_BRAND.logoUrl });
        }
      } catch {
        setBrand({ name: DEFAULT_BRAND.name, logoUrl: DEFAULT_BRAND.logoUrl });
      }
    })();
  }, []);

  useEffect(() => {
    const onUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ name?: string; logoUrl?: string | null }>;
      setBrand({
        name: ce.detail?.name || DEFAULT_BRAND.name,
        logoUrl: ce.detail?.logoUrl ?? DEFAULT_BRAND.logoUrl,
      });
      setCacheBust(Date.now());
    };
    window.addEventListener('company:updated', onUpdated as any);
    return () => window.removeEventListener('company:updated', onUpdated as any);
  }, []);

  useEffect(() => {
    document.title = brand.name || DEFAULT_BRAND.name;
  }, [brand.name]);

  // делаем абсолютный src + cache-buster
  const logoSrc = useMemo(() => {
    const abs = toAbsolute(brand.logoUrl || DEFAULT_BRAND.logoUrl, apiBase);
    return abs ? `${abs}${abs.includes('?') ? '&' : '?'}v=${cacheBust}` : null;
  }, [brand.logoUrl, apiBase, cacheBust]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const base = await getApiBase();
      const res = await axios.post(`${base}/auth/login`, { login, password });
      const token = res.data.access_token;
      if (!token) throw new Error('Токен не получен');

      localStorage.setItem('token', token);
      const decoded: any = jwtDecode(token);

      if (decoded.setup && decoded.role === 'admin') navigate('/setup');
      else if (decoded.setup) navigate('/change-password');
      else if (decoded.role === 'admin') navigate('/admin');
      else navigate('/workspace');
    } catch (err) {
      console.error('❌ Ошибка логина:', err);
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/637905880c602930fce335f9a55b3b2f.jpg')" }}
    >
      <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-sm text-center">
        {logoSrc && (
          <img
            src={logoSrc}
            alt="Логотип"
            className="h-16 w-16 rounded object-contain mx-auto mb-4"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = DEFAULT_BRAND.logoUrl;
            }}
          />
        )}

        <h2 className="text-2xl font-semibold text-center mb-6">
          Войти в {brand.name || DEFAULT_BRAND.name}
        </h2>

        {error && <div className="text-red-500 text-center mb-2">{error}</div>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-green-500 text-white py-2 rounded-md font-semibold hover:bg-green-600 transition"
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
