import { BookOpen, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Layout } from '../components/Layout';
import { useAuthStore } from '../store/auth.store';

const stats = [
  { label: 'Matières', value: '6', icon: BookOpen, color: 'bg-blue-500', light: 'bg-blue-50 text-blue-600' },
  { label: 'Cours révisés', value: '24', icon: CheckCircle2, color: 'bg-green-500', light: 'bg-green-50 text-green-600' },
  { label: 'Heures cette semaine', value: '12h', icon: Clock, color: 'bg-orange-500', light: 'bg-orange-50 text-orange-600' },
  { label: 'Progression globale', value: '68%', icon: TrendingUp, color: 'bg-purple-500', light: 'bg-purple-50 text-purple-600' },
];

const recentActivity = [
  { subject: 'Mathématiques', action: 'Cours révisé', detail: 'Dérivées et intégrales', time: 'Il y a 2h', color: '#3b82f6' },
  { subject: 'Physique-Chimie', action: 'Nouveau cours', detail: 'Mécanique quantique', time: 'Hier', color: '#22c55e' },
  { subject: 'Histoire-Géo', action: 'Cours révisé', detail: 'La Guerre Froide', time: 'Hier', color: '#f97316' },
  { subject: 'Anglais', action: 'Cours révisé', detail: 'Passive voice', time: 'Il y a 2 jours', color: '#ec4899' },
];

export const Dashboard = () => {
  const { user } = useAuthStore();

  return (
    <Layout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 font-display">
            Bonjour {user?.name} 👋
          </h2>
          <p className="text-gray-500 mt-1">Voici un résumé de ta progression</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, light }) => (
            <div key={label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{label}</span>
                <span className={`p-2 rounded-lg ${light}`}>
                  <Icon className="w-4 h-4" />
                </span>
              </div>
              <p className="text-3xl font-bold text-gray-900 font-display">{value}</p>
            </div>
          ))}
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Activité récente</h3>
          <div className="space-y-4">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    <span style={{ color: item.color }}>{item.subject}</span>
                    {' — '}
                    {item.detail}
                  </p>
                  <p className="text-xs text-gray-400">{item.action}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};
