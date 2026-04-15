import { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BookOpen, LogOut } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';

interface LayoutProps {
  children: ReactNode;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/schedule', label: 'Emploi du temps', icon: CalendarDays },
  { to: '/subjects', label: 'Matières', icon: BookOpen },
];

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-primary-900 flex flex-col fixed top-0 left-0 h-full z-20">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-primary-800">
          <h1 className="text-white text-xl font-display font-bold tracking-wide">
            ⚡ Hyperfocus
          </h1>
          <p className="text-primary-300 text-xs mt-1 truncate">
            {user?.name}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-primary-600 text-white'
                    : 'text-primary-300 hover:bg-primary-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User / Logout */}
        <div className="px-3 py-4 border-t border-primary-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-primary-300 hover:bg-primary-800 hover:text-white transition-all duration-150"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
};
