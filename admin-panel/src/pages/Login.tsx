import { useState } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3000/auth/login', {
        login,
        password,
      });
      const token = res.data.access_token;
      localStorage.setItem('token', token);
      const decoded: any = jwtDecode(token);
      if (decoded.setup) {
        navigate('/setup');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      alert('Неверный логин или пароль');
    }
  };

  return (
    <div
  className="min-h-screen flex items-center justify-center bg-cover bg-center"
  style={{backgroundImage: "url('/637905880c602930fce335f9a55b3b2f.jpg')",}}>
  <div className="bg-white/90 p-10 rounded-2xl shadow-2xl w-full max-w-sm">
  <div className="flex justify-center mb-10"><img className="w-45" src="/photo_2022-03-11_18-46-40.png"/></div>
    <h2 className="text-2xl font-semibold text-center mb-6">Войти в PBWorkspace</h2>
    <form onSubmit={handleLogin} className="flex flex-col gap-4">
      <input
        type="login"
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
