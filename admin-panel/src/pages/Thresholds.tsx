import { useEffect, useState } from 'react';
import { getApiBase } from '../utils/getApiBase';

interface Threshold {
  id: number;
  type: string;
  value: number;
}

export default function Thresholds() {
  const [thresholds, setThresholds] = useState<Threshold[]>([]);
  const [editedThresholds, setEditedThresholds] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [newThreshold, setNewThreshold] = useState<{ type: string; value: number }>({ type: '', value: 0 });

  const fetchThresholds = async () => {
    try {
      const token = localStorage.getItem('token');
      const base = await getApiBase();
      const res = await fetch(`${base}/monitoring/thresholds`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setThresholds(data);
      setEditedThresholds(Object.fromEntries(data.map((t: Threshold) => [t.type, t.value])));
    } catch {
      setError('Ошибка получения порогов');
    }
  };

  const updateThreshold = async (type: string, value: number) => {
    try {
      const token = localStorage.getItem('token');
      const base = await getApiBase();
      await fetch(`${base}/monitoring/thresholds/${type}`,{
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ value }),
      });
      fetchThresholds();
    } catch {
      setError('Ошибка обновления порога');
    }
  };

  const createThreshold = async () => {
    try {
      const token = localStorage.getItem('token');
      const base = await getApiBase();
      await fetch(`${base}/monitoring/thresholds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newThreshold),
      });
      setNewThreshold({ type: '', value: 0 });
      fetchThresholds();
    } catch {
      setError('Ошибка создания порога');
    }
  };

  const deleteThreshold = async (type: string) => {
    try {
      const token = localStorage.getItem('token');
      const base = await getApiBase();
      await fetch(`${base}/monitoring/thresholds/${type}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchThresholds();
    } catch {
      setError('Ошибка удаления порога');
    }
  };

  useEffect(() => {
    fetchThresholds();
  }, []);

  const usedTypes = thresholds.map((t) => t.type);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">⚙️ Пороговые значения</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <table className="min-w-full bg-white shadow rounded mb-6">
        <thead>
          <tr>
            <th className="text-left p-2">Тип</th>
            <th className="text-left p-2">Значение (%)</th>
            <th className="text-left p-2">Действие</th>
          </tr>
        </thead>
        <tbody>
          {thresholds
            .slice()
            .sort((a, b) => a.type.localeCompare(b.type)) // стабилизация порядка
            .map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-2 capitalize">{t.type}</td>
                <td className="p-2">
                  <input
                    type="number"
                    value={editedThresholds[t.type] ?? t.value}
                    onChange={(e) =>
                      setEditedThresholds({ ...editedThresholds, [t.type]: Number(e.target.value) })
                    }
                    onBlur={() => {
                      if (editedThresholds[t.type] !== t.value) {
                        updateThreshold(t.type, editedThresholds[t.type]);
                      }
                    }}
                    className="border rounded px-2 py-1 w-20"
                  />
                </td>
                <td className="p-2 text-sm text-gray-500">
                  <span>Изменения применяются сразу</span>
                  <button
                    onClick={() => deleteThreshold(t.type)}
                    className="ml-4 text-red-500 hover:underline"
                  >
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">➕ Добавить порог</h2>
        <div className="flex gap-2 items-center">
          <select
            value={newThreshold.type}
            onChange={(e) => setNewThreshold({ ...newThreshold, type: e.target.value })}
            className="border rounded px-2 py-1"
          >
            <option value="">Выбрать тип</option>
            <option value="cpu" disabled={usedTypes.includes('cpu')}>CPU</option>
            <option value="ram" disabled={usedTypes.includes('ram')}>RAM</option>
          </select>
          <input
            type="number"
            value={newThreshold.value}
            onChange={(e) => setNewThreshold({ ...newThreshold, value: Number(e.target.value) })}
            placeholder="Значение"
            className="border rounded px-2 py-1"
          />
          <button
            onClick={createThreshold}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            disabled={!newThreshold.type || usedTypes.includes(newThreshold.type)}
          >
            Добавить
          </button>
        </div>
        {usedTypes.includes(newThreshold.type) && newThreshold.type && (
          <div className="text-sm text-red-500 mt-2">
            Порог для {newThreshold.type.toUpperCase()} уже существует
          </div>
        )}
      </div>
    </div>
  );
}
