import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Sparkles } from 'lucide-react';
import { subscriptionService } from '@/services/subscriptionService';
import { petService } from '@/services/petService';
import { planService } from '@/services/planService';
import { getErrorMessage } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import type { PetResponse, PlanResponse, SubscriptionRequest, SubscriptionResponse, SubscriptionStatus } from '@/types';
import { LoadingSpinner, InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { FormModal, Field, inputClass } from '@/components/common/FormModal';
import { EmptyState, StatusBadge } from '@/components/common/ListHelpers';

function emptyForm(petId: number, planId: number): SubscriptionRequest {
  return { startDate: new Date().toISOString().slice(0, 10), status: 'ATIVO', petId, planId };
}

export function SubscriptionsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [pets, setPets] = useState<PetResponse[]>([]);
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [items, setItems] = useState<SubscriptionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<SubscriptionRequest>(emptyForm(0, 0));
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    petService.findAll({ tutorId: user.id, size: 100 }).then((data) => setPets(data.content)).catch(() => setPets([]));
    planService.findAll({ size: 100 }).then((data) => setPlans(data.content)).catch(() => setPlans([]));
  }, [user]);

  function load() {
    if (pets.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    Promise.all(pets.map((pet) => subscriptionService.findAll({ petId: pet.id, size: 50 })))
      .then((results) => {
        const all = results.flatMap((r) => r.content).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
        setItems(all);
      })
      .catch((err) => setError(getErrorMessage(err, 'Não foi possível carregar suas assinaturas.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [pets]);

  function openCreate() {
    setForm(emptyForm(pets[0]?.id ?? 0, plans[0]?.id ?? 0));
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await subscriptionService.create({ ...form, endDate: form.endDate || undefined });
      showSuccess('Assinatura criada com sucesso.');
      setModalOpen(false);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível criar a assinatura.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(subscription: SubscriptionResponse, status: SubscriptionStatus) {
    if (status === subscription.status) return;
    setStatusUpdatingId(subscription.id);
    try {
      await subscriptionService.updateStatus(subscription.id, status);
      showSuccess('Status da assinatura atualizado.');
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível atualizar o status.'));
    } finally {
      setStatusUpdatingId(null);
    }
  }

  const statusOptions: SubscriptionStatus[] = ['ATIVO', 'ENCERRADO', 'CANCELADO', 'EXPIRADO'];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Assinaturas</h1>
          <p className="mt-1 text-sm text-ink/55">Planos de saúde ativos para os seus pets.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={pets.length === 0 || plans.length === 0}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Nova assinatura
        </button>
      </div>
      {pets.length === 0 && !loading && (
        <p className="mt-3 text-xs text-amber-700">Cadastre um pet antes de assinar um plano.</p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma assinatura encontrada." />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2">
            {items.map((sub) => (
              <div key={sub.id} className="rounded-xl border border-ink/10 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-brand-50 p-2 text-brand-600">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{sub.planName}</p>
                      <p className="text-xs text-ink/45">Pet: {sub.petName}</p>
                    </div>
                  </div>
                  <StatusBadge status={sub.status} />
                </div>
                <dl className="mt-3 space-y-1 text-xs text-ink/55">
                  <div className="flex justify-between">
                    <dt>Início</dt>
                    <dd>{sub.startDate}</dd>
                  </div>
                  {sub.endDate && (
                    <div className="flex justify-between">
                      <dt>Término</dt>
                      <dd>{sub.endDate}</dd>
                    </div>
                  )}
                </dl>
                <select
                  value={sub.status}
                  disabled={statusUpdatingId === sub.id}
                  onChange={(e) => handleStatusChange(sub, e.target.value as SubscriptionStatus)}
                  className="mt-3 w-full rounded-lg border border-ink/10 bg-white px-2 py-1.5 text-xs text-ink/60"
                >
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}
      </div>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Nova assinatura">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Pet">
            <select
              required
              className={inputClass}
              value={form.petId}
              onChange={(e) => setForm({ ...form, petId: Number(e.target.value) })}
            >
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Plano">
            <select
              required
              className={inputClass}
              value={form.planId}
              onChange={(e) => setForm({ ...form, planId: Number(e.target.value) })}
            >
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} — {plan.clinicName}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data de início">
              <input
                type="date"
                required
                className={inputClass}
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
            </Field>
            <Field label="Data de término" hint="Opcional.">
              <input
                type="date"
                className={inputClass}
                value={form.endDate ?? ''}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-full px-4 py-2 text-sm font-medium text-ink/60 hover:bg-sand"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {saving && <InlineSpinner />}
              Assinar
            </button>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
