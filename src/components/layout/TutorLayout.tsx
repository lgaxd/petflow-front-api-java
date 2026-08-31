import { useEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Activity, Gift, LayoutGrid, LogOut, PawPrint, Sparkles, Wallet } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { gamificationService } from '@/services/gamificationService';

const navItems = [
  { to: '/tutor', label: 'Início', icon: LayoutGrid, end: true },
  { to: '/tutor/pets', label: 'Meus pets', icon: PawPrint },
  { to: '/tutor/health-events', label: 'Eventos de saúde', icon: Activity },
  { to: '/tutor/subscriptions', label: 'Assinaturas', icon: Sparkles },
  { to: '/tutor/redeem', label: 'Resgatar cupons', icon: Gift },
];

export function TutorLayout() {
  const { user, logout } = useAuth();
  const [points, setPoints] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    gamificationService
      .getMyPoints()
      .then((data) => {
        if (active) setPoints(data.totalPoints);
      })
      .catch(() => {
        if (active) setPoints(null);
      });
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-sand">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <PawPrint className="h-6 w-6 text-brand-600" />
            <div>
              <p className="font-display text-lg font-semibold leading-none text-ink">PetFlow</p>
              <p className="text-xs text-ink/45">Olá, {user?.name?.split(' ')[0]}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-1.5 text-brand-700">
              <Wallet className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {points === null ? '—' : points.toLocaleString('pt-BR')} pts
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-ink/60 hover:bg-sand"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </div>

        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-6 pb-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-ink/60 hover:bg-sand'
                }`
              }
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
}
