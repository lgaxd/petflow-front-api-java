import { NavLink, Outlet } from 'react-router-dom';
import { Building2, LayoutGrid, LogOut, ShieldCheck, Tags, Ticket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { to: '/admin', label: 'Visão geral', icon: LayoutGrid, end: true },
  { to: '/admin/clinics', label: 'Clínicas', icon: Building2 },
  { to: '/admin/plans', label: 'Planos', icon: Tags },
  { to: '/admin/coupons', label: 'Cupons', icon: Ticket },
];

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-sand">
      <aside className="flex w-64 shrink-0 flex-col border-r border-ink/10 bg-white">
        <div className="flex items-center gap-2 px-6 py-6">
          <ShieldCheck className="h-6 w-6 text-brand-600" />
          <div>
            <p className="font-display text-lg font-semibold leading-none text-ink">PetFlow</p>
            <p className="text-xs text-ink/45">Painel administrativo</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-brand-600 text-white' : 'text-ink/65 hover:bg-sand'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-ink/10 px-4 py-4">
          <p className="truncate text-sm font-medium text-ink">{user?.name}</p>
          <p className="truncate text-xs text-ink/45">{user?.email}</p>
          <button
            onClick={logout}
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
