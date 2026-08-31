import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Tags, Ticket, ArrowRight } from 'lucide-react';
import { clinicService } from '@/services/clinicService';
import { planService } from '@/services/planService';
import { couponService } from '@/services/couponService';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Counts {
  clinics: number;
  plans: number;
  coupons: number;
}

const cards = [
  { key: 'clinics' as const, label: 'Clínicas cadastradas', icon: Building2, to: '/admin/clinics' },
  { key: 'plans' as const, label: 'Planos ativos', icon: Tags, to: '/admin/plans' },
  { key: 'coupons' as const, label: 'Cupons no sistema', icon: Ticket, to: '/admin/coupons' },
];

export function AdminDashboard() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      clinicService.findAll({ page: 0, size: 1 }),
      planService.findAll({ page: 0, size: 1 }),
      couponService.findAll({ page: 0, size: 1 }),
    ])
      .then(([clinics, plans, coupons]) => {
        if (!active) return;
        setCounts({
          clinics: clinics.totalElements,
          plans: plans.totalElements,
          coupons: coupons.totalElements,
        });
      })
      .catch(() => active && setCounts({ clinics: 0, plans: 0, coupons: 0 }));
    return () => {
      active = false;
    };
  }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-ink">Visão geral</h1>
      <p className="mt-1 text-sm text-ink/55">
        Gerencie clínicas, planos e cupons disponíveis para os tutores da plataforma.
      </p>

      {counts === null ? (
        <LoadingSpinner />
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map(({ key, label, icon: Icon, to }) => (
            <Link
              key={key}
              to={to}
              className="group flex flex-col justify-between rounded-2xl border border-ink/10 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-brand-50 p-2.5 text-brand-600">
                  <Icon className="h-5 w-5" />
                </div>
                <ArrowRight className="h-4 w-4 text-ink/30 transition-transform group-hover:translate-x-1" />
              </div>
              <div className="mt-6">
                <p className="font-display text-3xl font-semibold text-ink">{counts[key]}</p>
                <p className="mt-1 text-sm text-ink/55">{label}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
