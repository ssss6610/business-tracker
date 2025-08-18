import { useEffect, useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { getApiBase } from '../utils/getApiBase';
import { loadBranding, DEFAULT_BRANDING } from '../utils/branding';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [brand, setBrand] = useState(DEFAULT_BRANDING);
  const navigate = useNavigate();

  // грузим бренд для логина + подписка на обновление из персонализации
  useEffect(() => {
    loadBranding().then(setBrand);

    const onUpdated = (e: Event) => {
      const ce = e as CustomEvent<{ name?: string; logoUrl?: string | null }>;
      setBrand({
        name: ce.detail?.name || DEFAULT_BRANDING.name,
        logoUrl: ce.detail?.logoUrl || null,
      });
    };
    window.addEventListener('company:updated', onUpdated as any);
    return () => window.removeEventListener('company:updated', onUpdated as any);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const baseUrl = await getApiBase();
      const res = await axios.post(`${baseUrl}/auth/login`, { login, password });

      const token = res.data.access_token;
      if (!token) throw new Error('Токен не получен');

      localStorage.setItem('token', token);

      const decoded: any = jwtDecode(token);
      console.log('🔐 Декодированный токен:', decoded);

      if (decoded.setup && decoded.role === 'admin') {
        navigate('/setup'); // мастер настройки
      } else if (decoded.setup) {
        navigate('/change-password'); // смена пароля
      } else if (decoded.role === 'admin') {
        navigate('/admin'); // админ-панель
      } else {
        navigate('/workspace'); // рабочее пространство
      }
    } catch (err: any) {
      console.error('❌ Ошибка логина:', err);
      setError('Неверный логин или пароль');
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/637905880c602930fce335f9a55b3b2f.jpg')" }}
    >
      <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Брендинг логина */}
        <div className="flex items-center gap-3 mb-6 justify-center">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt="Логотип"
              className="h-10 w-10 rounded"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
            />
          ) : (
            <div className="h-10 w-10 rounded bg-gray-200 flex items-center justify-center text-gray-500">
              <span className="text-sm">∞</span>
            </div>
          )}
          <h1 className="text-lg font-semibold">{brand.name}</h1>
        </div>

        <h2 className="text-2xl font-semibold text-center mb-6">Войти в PBWorkspace</h2>
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
