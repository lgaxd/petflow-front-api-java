import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Gift, PawPrint, Sparkles, Wallet } from 'lucide-react';
import { gamificationService } from '@/services/gamificationService';
import { petService } from '@/services/petService';
import { useAuth } from '@/contexts/AuthContext';
import type { TutorPoints } from '@/types';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export function TutorDashboard() {
  const { user } = useAuth();
  const [points, setPoints] = useState<TutorPoints | null>(null);
  const [petCount, setPetCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let active = true;
    Promise.all([gamificationService.getMyPoints(), petService.findAll({ tutorId: user.id, page: 0, size: 1 })])
      .then(([pointsData, petsData]) => {
        if (!active) return;
        setPoints(pointsData);
        setPetCount(petsData.totalElements);
      })
      .catch(() => active && setPoints(null))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [user]);

  const shortcuts = [
    { to: '/tutor/pets', label: 'Meus pets', icon: PawPrint, value: petCount ?? '—' },
    { to: '/tutor/health-events', label: 'Eventos de saúde', icon: Activity },
    { to: '/tutor/subscriptions', label: 'Assinaturas', icon: Sparkles },
    { to: '/tutor/redeem', label: 'Resgatar cupons', icon: Gift },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Olá, {user?.name?.split(' ')[0]} 👋</h1>
      <p className="mt-1 text-sm text-ink/55">Acompanhe seus pets, eventos de saúde e seus pontos PetFlow.</p>

      <div className="mt-6 rounded-2xl bg-brand-600 p-6 text-white">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-white/15 p-3">
            <Wallet className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm text-white/70">Seu saldo de pontos</p>
            <p className="font-display text-3xl font-semibold">
              {points ? points.totalPoints.toLocaleString('pt-BR') : 0} pts
            </p>
          </div>
        </div>
        <Link
          to="/tutor/redeem"
          className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium hover:bg-white/25"
        >
          Resgatar cupons <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {shortcuts.map(({ to, label, icon: Icon, value }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-5 shadow-sm hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
                <Icon className="h-5 w-5" />
              </div>
              <ArrowRight className="h-4 w-4 text-ink/30 transition-transform group-hover:translate-x-1" />
            </div>
            <div className="mt-4">
              {value !== undefined && <p className="font-display text-2xl font-semibold text-ink">{value}</p>}
              <p className="mt-1 text-sm text-ink/55">{label}</p>
            </div>
          </Link>
        ))}
      </div>

      {points && points.history.length > 0 && (
        <div className="mt-8 rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
          <h2 className="font-display text-lg font-semibold text-ink">Histórico recente de pontos</h2>
          <ul className="mt-3 divide-y divide-ink/10">
            {points.history.slice(0, 6).map((entry) => (
              <li key={entry.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-ink/70">{entry.reason}</span>
                <span className={entry.points >= 0 ? 'font-medium text-brand-600' : 'font-medium text-red-600'}>
                  {entry.points >= 0 ? '+' : ''}
                  {entry.points} pts
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
