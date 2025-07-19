// src/pages/Setup.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Setup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  const token = localStorage.getItem('token');
  if (!token) {
    setError('Нет токена авторизации');
    return;
  }

  try {
    const response = await fetch('http://localhost:3000/setup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log('🟢 Ответ от /setup:', data);

    if (!response.ok) {
      throw new Error(data.message || 'Ошибка настройки');
    }

    navigate('/admin');
  } catch (err: any) {
    setError(err.message);
  }
};

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white shadow-md rounded-xl">
      <h1 className="text-2xl font-bold mb-4">Начальная настройка</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Новый email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Новый пароль"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          Сохранить
        </button>
      </form>
    </div>
  );
}
