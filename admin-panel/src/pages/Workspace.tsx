import { Link } from 'react-router-dom';
import { Mail, MessageCircle, CheckCircle, Calendar, Users, BarChart2 } from 'lucide-react';

const services = [
  { label: 'Почта', to: '/workspace/mail', icon: Mail },
  { label: 'Чат', to: '/workspace/chat', icon: MessageCircle },
  { label: 'Трекер', to: '/workspace/tracker', icon: CheckCircle },
  { label: 'Календарь', to: '/workspace/calendar', icon: Calendar },
  { label: 'Аналитика', to: '/workspace/analytics', icon: BarChart2 },
  { label: 'Сотрудники', to: '/workspace/employees', icon: Users },
];

export default function Workspace() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Рабочее пространство</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {services.map(({ label, to, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col items-center justify-center p-6 bg-white rounded-2xl shadow hover:bg-gray-100 transition"
          >
            <Icon className="w-12 h-12 mb-2" />
            <span className="text-lg font-medium">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
