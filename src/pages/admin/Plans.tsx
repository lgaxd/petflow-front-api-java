import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, Plus, Tags, Trash2 } from 'lucide-react';
import { planService } from '@/services/planService';
import { clinicService } from '@/services/clinicService';
import { getErrorMessage } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { ClinicResponse, PlanRequest, PlanResponse } from '@/types';
import { LoadingSpinner, InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormModal, Field, inputClass } from '@/components/common/FormModal';
import { Pagination, EmptyState } from '@/components/common/ListHelpers';

const emptyForm: PlanRequest = {
  name: '',
  description: '',
  price: 0,
  durationDays: 365,
  pointsPerEvent: 1,
  clinicId: 0,
};

const currency = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function PlansPage() {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<PlanResponse[]>([]);
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PlanResponse | null>(null);
  const [form, setForm] = useState<PlanRequest>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PlanResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    clinicService.findAll({ size: 100 }).then((data) => setClinics(data.content)).catch(() => setClinics([]));
  }, []);

  function load() {
    setLoading(true);
    setError(null);
    planService
      .findAll({ page, size: 8 })
      .then((data) => {
        setItems(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(getErrorMessage(err, 'Não foi possível carregar os planos.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page]);

  function openCreate() {
    setEditing(null);
    setForm({ ...emptyForm, clinicId: clinics[0]?.id ?? 0 });
    setModalOpen(true);
  }

  function openEdit(plan: PlanResponse) {
    setEditing(plan);
    setForm({
      name: plan.name,
      description: plan.description ?? '',
      price: plan.price,
      durationDays: plan.durationDays,
      pointsPerEvent: plan.pointsPerEvent,
      clinicId: plan.clinicId,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await planService.update(editing.id, form);
        showSuccess('Plano atualizado com sucesso.');
      } else {
        await planService.create(form);
        showSuccess('Plano criado com sucesso.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível salvar o plano.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await planService.delete(deleteTarget.id);
      showSuccess('Plano removido com sucesso.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível remover o plano.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Planos</h1>
          <p className="mt-1 text-sm text-ink/55">Planos de saúde oferecidos pelas clínicas parceiras.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={clinics.length === 0}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo plano
        </button>
      </div>
      {clinics.length === 0 && !loading && (
        <p className="mt-3 text-xs text-amber-700">Cadastre ao menos uma clínica antes de criar planos.</p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhum plano cadastrado." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-sand/60 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-4 py-3">Plano</th>
                <th className="px-4 py-3">Clínica</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Duração</th>
                <th className="px-4 py-3">Pontos/evento</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {items.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tags className="h-4 w-4 text-brand-500" />
                      <div>
                        <p className="font-medium text-ink">{plan.name}</p>
                        <p className="text-xs text-ink/45">{plan.description || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{plan.clinicName}</td>
                  <td className="px-4 py-3 text-ink/70">{currency.format(plan.price)}</td>
                  <td className="px-4 py-3 text-ink/70">{plan.durationDays} dias</td>
                  <td className="px-4 py-3 text-ink/70">{plan.pointsPerEvent}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(plan)}
                        className="rounded-full p-2 text-ink/50 hover:bg-sand hover:text-brand-600"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(plan)}
                        className="rounded-full p-2 text-ink/50 hover:bg-red-50 hover:text-red-600"
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && !error && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar plano' : 'Novo plano'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nome">
            <input
              required
              maxLength={100}
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Descrição">
            <input
              maxLength={200}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Clínica">
            <select
              required
              className={inputClass}
              value={form.clinicId}
              onChange={(e) => setForm({ ...form, clinicId: Number(e.target.value) })}
            >
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Preço (R$)">
              <input
                type="number"
                required
                min={0.01}
                step={0.01}
                className={inputClass}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </Field>
            <Field label="Duração (dias)">
              <input
                type="number"
                required
                min={1}
                className={inputClass}
                value={form.durationDays}
                onChange={(e) => setForm({ ...form, durationDays: Number(e.target.value) })}
              />
            </Field>
            <Field label="Pontos/evento">
              <input
                type="number"
                required
                min={0}
                className={inputClass}
                value={form.pointsPerEvent}
                onChange={(e) => setForm({ ...form, pointsPerEvent: Number(e.target.value) })}
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
              Salvar
            </button>
          </div>
        </form>
      </FormModal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remover plano"
        description={`Tem certeza que deseja remover "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
