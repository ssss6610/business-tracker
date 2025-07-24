import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChangePassword = async () => {
    setError('');
    setSuccess('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:4000/api-info');
      const { port } = await res.json();
      const apiBase = `http://localhost:${port}`;

      const response = await fetch(`${apiBase}/auth/change-password`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Ошибка смены пароля');
      }

      const data = await response.json();
      localStorage.setItem('token', data.access_token);
      setSuccess('Пароль успешно изменён!');
      setTimeout(() => navigate('/workspace'), 1000);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-16 bg-white p-6 rounded shadow">
      <h1 className="text-xl font-bold mb-4">🔐 Смена пароля</h1>
      {error && <div className="text-red-500 mb-3">{error}</div>}
      {success && <div className="text-green-600 mb-3">{success}</div>}
      <div className="mb-3">
        <label className="block text-sm">Старый пароль</label>
        <input
          type="password"
          className="w-full border p-2 rounded"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm">Новый пароль</label>
        <input
          type="password"
          className="w-full border p-2 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
      </div>
      <button
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        onClick={handleChangePassword}
      >
        Изменить пароль
      </button>
    </div>
  );
}
