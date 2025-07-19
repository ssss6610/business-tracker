import { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

interface Metric {
  timestamp: string;
  value: number;
}
interface ServiceStatus {
  timestamp: string;
  status: string;
}

export default function Monitoring() {
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState('');
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [cpuHistory, setCpuHistory] = useState<Metric[]>([]);
  const [ramHistory, setRamHistory] = useState<Metric[]>([]);
  const [cpuRefreshInterval, setCpuRefreshInterval] = useState(10000);
  const [ramRefreshInterval, setRamRefreshInterval] = useState(10000);
  const [serviceHistories, setServiceHistories] = useState<Record<string, ServiceStatus[]>>({});
  const [topProcesses, setTopProcesses] = useState<{ byCpu: any[]; byRam: any[] }>({ byCpu: [], byRam: [] });


  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/monitoring', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStats(data);
      return data;
    } catch {
      setError('Ошибка получения данных');
    }
  };
  const fetchTopProcesses = async () => {
  try {
    const token = localStorage.getItem('token');
    const res = await fetch('http://localhost:3000/monitoring/top-processes', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setTopProcesses(data);
  } catch {
    setError('Ошибка получения процессов');
  }
};

useEffect(() => {
  fetchTopProcesses();
  const interval = setInterval(fetchTopProcesses, 10000);
  return () => clearInterval(interval);
}, []);


  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:3000/monitoring/alerts', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAlerts(data);
    } catch {
      setError('Ошибка получения алертов');
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:3000/monitoring/alerts/mark-read', {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAlerts();
  };

  const deleteAllAlerts = async () => {
    const token = localStorage.getItem('token');
    await fetch('http://localhost:3000/monitoring/alerts/clear', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAlerts();
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);


    const fetchServiceHistory = async (service: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:3000/monitoring/services/${service}/history`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      console.log(`[История ${service}]`, data); // ⬅️ лог
      setServiceHistories((prev) => ({ ...prev, [service]: data }));
    } catch {
      console.error(`Ошибка истории сервиса ${service}`, err); // ⬅️ лог ошибки
      setError(`Ошибка истории сервиса ${service}`);
    }
  };

  const serviceList = ['redis', 'db', 'auth-service', 'user-service'];

  useEffect(() => {
    fetchAlerts();
    serviceList.forEach(fetchServiceHistory);
  }, []);

  useEffect(() => {
  const interval = setInterval(() => {
    serviceList.forEach(fetchServiceHistory);
  }, 30000); // обновление каждые 30 секунд

  return () => clearInterval(interval); // очистка при размонтировании
}, []);

  useEffect(() => {
    const fetchCPU = async () => {
      const data = await fetchStats();
      if (!data) return;
      setCpuHistory((prev) => {
        const updated = [...prev, {
          timestamp: data.timestamp,
          value: parseFloat(data.cpuUsage),
        }];
        return updated.length > 50 ? updated.slice(-50) : updated;
      });
    };
    fetchCPU();
    const interval = setInterval(fetchCPU, cpuRefreshInterval);
    return () => clearInterval(interval);
  }, [cpuRefreshInterval]);

  useEffect(() => {
    const fetchRAM = async () => {
      const data = await fetchStats();
      if (!data) return;
      const match = data.memoryUsage.match(/([\d.]+) GB \/ ([\d.]+) GB/);
      const ramUsed = match ? parseFloat(match[1]) : 0;
      const ramTotal = match ? parseFloat(match[2]) : 1;
      const percent = Number(((ramUsed / ramTotal) * 100).toFixed(2));
      setRamHistory((prev) => {
        const updated = [...prev, { timestamp: data.timestamp, value: percent }];
        return updated.length > 50 ? updated.slice(-50) : updated;
      });
    };
    fetchRAM();
    const interval = setInterval(fetchRAM, ramRefreshInterval);
    return () => clearInterval(interval);
  }, [ramRefreshInterval]);

  const getServiceColor = (status: string): [string, string] => {
    const normalized = status.replace(/^[^a-zA-Zа-яА-ЯёЁ]+/, '').trim().toLowerCase();
    switch (normalized) {
      case 'работает':
        return ['bg-green-500', 'text-green-700'];
      case 'не запущен':
      case 'нет связи':
        return ['bg-red-500', 'text-red-600'];
      case 'перезапуск':
      case 'перезапускается':
        return ['bg-yellow-400', 'text-yellow-700'];
      default:
        return ['bg-gray-400', 'text-gray-600'];
    }
  };

  const formatLabels = (arr: Metric[]) =>
    arr.map((m) => new Date(m.timestamp).toLocaleTimeString().slice(0, 5));

  return (
    <div className="p-6 flex-1">
      <h1 className="text-2xl font-bold mb-6">📊 Мониторинг</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      {stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white shadow rounded p-4 text-center">
              <div className="text-sm text-gray-500">🧠 CPU</div>
              <div className="text-xl font-semibold">{stats.cpuUsage}</div>
            </div>
            <div className="bg-white shadow rounded p-4 text-center">
              <div className="text-sm text-gray-500">💾 RAM</div>
              <div className="text-xl font-semibold">{stats.memoryUsage}</div>
            </div>
            <div className="bg-white shadow rounded p-4 text-center">
              <div className="text-sm text-gray-500">📦 Disk</div>
              <div className="text-xl font-semibold">{stats.diskUsage}</div>
            </div>
            <div className="bg-white shadow rounded p-4 text-center">
              <div className="text-sm text-gray-500">📅 Обновлено</div>
              <div className="text-sm text-gray-600">
                {new Date(stats.timestamp).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Кликабельный блок алертов */}
          <div
            className="mt-8 bg-white shadow rounded p-4 cursor-pointer hover:bg-gray-50 transition"
            onClick={() => setIsModalOpen(true)}
          >
            <h2 className="text-lg font-semibold mb-2">🚨 Последние алерты</h2>
            {alerts.length === 0 ? (
              <p className="text-gray-500">Нет недавних алертов</p>
            ) : (
              <ul className="space-y-2">
                    {alerts.slice(0, 5).map((alert, i) => (
                     <li key={i} className="flex justify-between items-center">
                     <span>{alert.message}</span>
                     <span className="text-sm text-gray-500">
                     {new Date(alert.createdAt).toLocaleTimeString()}
                   </span>
                 </li>
                ))}
              </ul>
            )}
          </div>

          {/* Модалка с алертами */}
          {isModalOpen && (
            <div className="fixed inset-0 z-50  bg-opacity-30 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg w-full max-w-3xl max-h-[80vh] overflow-y-auto p-6 relative">
                <button
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
                  onClick={() => setIsModalOpen(false)}
                >
                  ✖
                </button>
                <h2 className="text-xl font-bold mb-4">📋 Все алерты</h2>

                <div className="flex justify-end gap-2 mb-4">
                  <button
                    className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                    onClick={markAllAsRead}
                  >
                    Отметить все как прочитанные
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                    onClick={deleteAllAlerts}
                  >
                    Удалить все
                  </button>
                </div>

                <ul className="space-y-3">
                  {alerts.map((alert, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center border-b pb-2"
                    >
                      <span>{alert.message}</span>
                       <span className="text-sm text-gray-500">
                        {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString() : '—'}
                        </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="bg-white shadow rounded p-4">
              <h2 className="font-semibold text-lg mb-3">🕸️ Сервисы</h2>
              <ul className="space-y-2">
                {Object.entries(stats.services).map(([service, status]) => {
                  const [bg, text] = getServiceColor(status);
                  return (
                    <li key={service} className="flex items-center justify-between">
                      <span className="capitalize">{service}</span>
                      <span className="flex items-center space-x-1">
                        <span className={`w-3 h-3 rounded-full ${bg}`} />
                        <span className={`font-medium ${text}`}>{status}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="bg-white shadow rounded p-4 min-h-[300px] flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">🧠 Загрузка CPU (%)</h2>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={cpuRefreshInterval}
                  onChange={(e) => setCpuRefreshInterval(Number(e.target.value))}
                >
                  <option value={1000}>1 сек</option>
                  <option value={10000}>10 сек</option>
                  <option value={30000}>30 сек</option>
                  <option value={600000}>1 мин</option>
                  <option value={300000}>5 мин</option>
                  <option value={1000000}>10 мин</option>
                </select>
              </div>
              <div className="flex-1 relative">
                <Line
                  options={{ responsive: true, maintainAspectRatio: false }}
                  data={{
                    labels: formatLabels(cpuHistory),
                    datasets: [
                      {
                        label: 'CPU',
                        data: cpuHistory.map((m) => m.value),
                        borderColor: 'rgb(75,192,192)',
                        tension: 0.3,
                        fill: false,
                      },
                    ],
                  }}
                />
              </div>
            </div>

            <div className="bg-white shadow rounded p-4 min-h-[300px] flex flex-col">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold">💾 Использование RAM (%)</h2>
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={ramRefreshInterval}
                  onChange={(e) => setRamRefreshInterval(Number(e.target.value))}
                >
                  <option value={1000}>1 сек</option>
                  <option value={10000}>10 сек</option>
                  <option value={30000}>30 сек</option>
                  <option value={600000}>1 мин</option>
                  <option value={300000}>5 мин</option>
                  <option value={1000000}>10 мин</option>
                </select>
              </div>
              <div className="flex-1 relative">
                <Line
                  options={{ responsive: true, maintainAspectRatio: false }}
                  data={{
                    labels: formatLabels(ramHistory),
                    datasets: [
                      {
                        label: 'RAM',
                        data: ramHistory.map((m) => m.value),
                        borderColor: 'rgb(255,99,132)',
                        tension: 0.3,
                        fill: false,
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
  <div className="bg-white shadow rounded p-4">
    <h3 className="text-lg font-semibold mb-3">🔥 Топ-5 процессов по CPU</h3>
    <ul className="text-sm space-y-1">
      {topProcesses.byCpu.map((proc, i) => (
        <li key={i} className="flex justify-between">
          <span>{proc.name} (PID: {proc.pid})</span>
          <span>{proc.cpu}%</span>
        </li>
      ))}
    </ul>
  </div>
  <div className="bg-white shadow rounded p-4">
    <h3 className="text-lg font-semibold mb-3">💾 Топ-5 по RAM</h3>
    <ul className="text-sm space-y-1">
      {topProcesses.byRam.map((proc, i) => (
        <li key={i} className="flex justify-between">
          <span>{proc.name} (PID: {proc.pid})</span>
          <span>{proc.ramMB} MB</span>
        </li>
      ))}
    </ul>
  </div>
</div>
          {/* История падений сервисов */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {serviceList.map((service) => (
              <div key={service} className="bg-white shadow rounded p-4">
                <h3 className="font-semibold text-lg mb-2">📉 История: {service}</h3>
                {serviceHistories[service]?.length ? (
                  <ul className="divide-y text-sm">
                    {serviceHistories[service].map((entry, idx) => (
                      <li key={idx} className="py-1 flex justify-between">
                        <span className="capitalize">{entry.status}</span>
                        <span className="text-gray-400">{new Date(entry.timestamp).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">Нет данных</p>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>⏳ Загрузка...</div>
      )}
    </div>
  );
}
