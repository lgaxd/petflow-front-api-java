import { useEffect, useState } from 'react';
import { Gift, Wallet } from 'lucide-react';
import { gamificationService } from '@/services/gamificationService';
import { getErrorMessage } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { CouponCatalogEntry, TutorPoints } from '@/types';
import { LoadingSpinner, InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { EmptyState, Pagination } from '@/components/common/ListHelpers';

const discountLabel = (coupon: CouponCatalogEntry) =>
  coupon.discountType?.toUpperCase().includes('PERCENT')
    ? `${coupon.discountValue}% de desconto`
    : `R$ ${coupon.discountValue.toFixed(2)} de desconto`;

export function RedeemPage() {
  const { showSuccess, showError } = useToast();

  const [points, setPoints] = useState<TutorPoints | null>(null);
  const [coupons, setCoupons] = useState<CouponCatalogEntry[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [redeemTarget, setRedeemTarget] = useState<CouponCatalogEntry | null>(null);
  const [redeeming, setRedeeming] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    Promise.all([gamificationService.getMyPoints(), gamificationService.getAvailableCoupons(page, 6)])
      .then(([pointsData, couponsData]) => {
        setPoints(pointsData);
        setCoupons(couponsData.content);
        setTotalPages(couponsData.totalPages);
      })
      .catch((err) => setError(getErrorMessage(err, 'Não foi possível carregar os cupons disponíveis.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  async function handleRedeem() {
    if (!redeemTarget) return;
    setRedeeming(true);
    try {
      await gamificationService.redeemCoupon(redeemTarget.id);
      showSuccess(`Cupom "${redeemTarget.title}" resgatado com sucesso!`);
      setRedeemTarget(null);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível resgatar este cupom.'));
    } finally {
      setRedeeming(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Resgatar cupons</h1>
          <p className="mt-1 text-sm text-ink/55">Troque seus pontos por descontos com nossos parceiros.</p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-brand-700">
          <Wallet className="h-4 w-4" />
          <span className="text-sm font-semibold">
            {points ? points.totalPoints.toLocaleString('pt-BR') : 0} pts disponíveis
          </span>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : coupons.length === 0 ? (
          <EmptyState message="Nenhum cupom disponível no momento." />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {coupons.map((coupon) => {
                const affordable = points ? points.totalPoints >= coupon.pointsRequired : false;
                return (
                  <div key={coupon.id} className="flex flex-col rounded-2xl border border-ink/10 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-brand-600">
                      <Gift className="h-5 w-5" />
                      <span className="text-xs font-semibold uppercase tracking-wide">{coupon.code}</span>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold text-ink">{coupon.title}</h3>
                    <p className="mt-1 text-sm text-ink/60">{discountLabel(coupon)}</p>
                    {coupon.expirationDate && (
                      <p className="mt-1 text-xs text-ink/40">Válido até {coupon.expirationDate}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm font-semibold text-ink">{coupon.pointsRequired} pts</span>
                      <button
                        onClick={() => setRedeemTarget(coupon)}
                        disabled={!coupon.available || !affordable}
                        className="rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40"
                      >
                        {!coupon.available ? 'Indisponível' : affordable ? 'Resgatar' : 'Pontos insuficientes'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 rounded-2xl border border-ink/10 bg-white">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(redeemTarget)}
        title="Confirmar resgate"
        description={`Deseja resgatar "${redeemTarget?.title}" por ${redeemTarget?.pointsRequired} pontos?`}
        confirmLabel="Confirmar resgate"
        isLoading={redeeming}
        onConfirm={handleRedeem}
        onCancel={() => setRedeemTarget(null)}
      />
    </div>
  );
}
