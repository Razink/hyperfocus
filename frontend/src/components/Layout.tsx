import type { ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CalendarDays, BookOpen, LogOut, Zap } from 'lucide-react';
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
      <aside className="hidden w-64 bg-primary-900 md:flex flex-col fixed top-0 left-0 h-full z-20">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-primary-800">
          <h1 className="text-white text-xl font-display font-bold tracking-wide">
            Hyperfocus
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

      <header className="fixed top-0 left-0 right-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-600 text-white">
            <Zap className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-bold leading-tight text-gray-900">Hyperfocus</p>
            <p className="truncate text-xs text-gray-500">{user?.name}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-900"
          aria-label="Déconnexion"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </header>

      {/* Main content */}
      <main className="min-h-screen flex-1 pt-16 md:ml-64 md:pt-0">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-3 border-t border-gray-200 bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2 shadow-[0_-8px_24px_rgba(15,23,42,0.08)] md:hidden">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex min-w-0 flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="max-w-full truncate">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
