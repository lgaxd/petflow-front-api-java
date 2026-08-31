import { useEffect, useState, type FormEvent } from 'react';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { healthEventService } from '@/services/healthEventService';
import { petService } from '@/services/petService';
import { clinicService } from '@/services/clinicService';
import { getErrorMessage } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import type { ClinicResponse, HealthEventRequest, HealthEventResponse, HealthEventStatus, PetResponse } from '@/types';
import { LoadingSpinner, InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormModal, Field, inputClass } from '@/components/common/FormModal';
import { EmptyState, Pagination, StatusBadge } from '@/components/common/ListHelpers';

const eventTypeLabels: Record<number, string> = {
  1: 'Vacinação',
  2: 'Consulta de rotina',
  3: 'Vermifugação',
  4: 'Cirurgia',
};
const statusOptions: HealthEventStatus[] = ['AGENDADO', 'REALIZADO', 'CANCELADO'];

function emptyForm(petId: number): HealthEventRequest {
  return {
    description: '',
    eventDate: new Date().toISOString().slice(0, 10),
    status: 'AGENDADO',
    petId,
    eventTypeId: 1,
    clinicId: undefined,
  };
}

export function HealthEventsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [pets, setPets] = useState<PetResponse[]>([]);
  const [clinics, setClinics] = useState<ClinicResponse[]>([]);
  const [items, setItems] = useState<HealthEventResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<HealthEventRequest>(emptyForm(0));
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<HealthEventResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user) return;
    petService.findAll({ tutorId: user.id, size: 100 }).then((data) => setPets(data.content)).catch(() => setPets([]));
    clinicService.findAll({ size: 100 }).then((data) => setClinics(data.content)).catch(() => setClinics([]));
  }, [user]);

  function load() {
    if (pets.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    // A API filtra por um único petId; combinamos os eventos de todos os pets do tutor.
    Promise.all(pets.map((pet) => healthEventService.findAll({ petId: pet.id, page: 0, size: 50 })))
      .then((results) => {
        const all = results.flatMap((r) => r.content).sort((a, b) => (a.eventDate < b.eventDate ? 1 : -1));
        setTotalPages(1);
        setItems(all.slice(page * 8, page * 8 + 8));
        setTotalPages(Math.max(1, Math.ceil(all.length / 8)));
      })
      .catch((err) => setError(getErrorMessage(err, 'Não foi possível carregar os eventos de saúde.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [pets, page]);

  function openCreate() {
    setForm(emptyForm(pets[0]?.id ?? 0));
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await healthEventService.create({ ...form, clinicId: form.clinicId || undefined });
      showSuccess('Evento de saúde registrado com sucesso.');
      setModalOpen(false);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível registrar o evento.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await healthEventService.delete(deleteTarget.id);
      showSuccess('Evento removido com sucesso.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível remover o evento.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Eventos de saúde</h1>
          <p className="mt-1 text-sm text-ink/55">
            Vacinas, consultas e outros cuidados. Marcar como REALIZADO gera pontos automaticamente.
          </p>
        </div>
        <button
          onClick={openCreate}
          disabled={pets.length === 0}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          Novo evento
        </button>
      </div>
      {pets.length === 0 && !loading && (
        <p className="mt-3 text-xs text-amber-700">Cadastre um pet antes de registrar eventos de saúde.</p>
      )}

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhum evento de saúde registrado." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-sand/60 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-4 py-3">Evento</th>
                <th className="px-4 py-3">Pet</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Clínica</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {items.map((event) => (
                <tr key={event.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-brand-500" />
                      <div>
                        <p className="font-medium text-ink">
                          {eventTypeLabels[event.eventTypeId] ?? `Tipo #${event.eventTypeId}`}
                        </p>
                        <p className="text-xs text-ink/45">{event.description || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{event.petName}</td>
                  <td className="px-4 py-3 text-ink/70">{event.eventDate}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={event.status} />
                  </td>
                  <td className="px-4 py-3 text-ink/70">{event.clinicName || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteTarget(event)}
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

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo evento de saúde">
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
          <Field label="Tipo de evento">
            <select
              className={inputClass}
              value={form.eventTypeId}
              onChange={(e) => setForm({ ...form, eventTypeId: Number(e.target.value) })}
            >
              {Object.entries(eventTypeLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Descrição">
            <input
              maxLength={200}
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data do evento" hint="Não pode ser uma data futura.">
              <input
                type="date"
                required
                max={new Date().toISOString().slice(0, 10)}
                className={inputClass}
                value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
              />
            </Field>
            <Field label="Status">
              <select
                className={inputClass}
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as HealthEventStatus })}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Clínica" hint="Opcional.">
            <select
              className={inputClass}
              value={form.clinicId ?? ''}
              onChange={(e) => setForm({ ...form, clinicId: e.target.value ? Number(e.target.value) : undefined })}
            >
              <option value="">Nenhuma</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>

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
        title="Remover evento"
        description="Tem certeza que deseja remover este evento de saúde? Esta ação não pode ser desfeita."
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
