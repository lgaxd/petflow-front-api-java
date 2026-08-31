import { useEffect, useState, type FormEvent } from 'react';
import { Pencil, PawPrint, Plus, Trash2 } from 'lucide-react';
import { petService } from '@/services/petService';
import { getErrorMessage } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import { useAuth } from '@/contexts/AuthContext';
import type { PetRequest, PetResponse } from '@/types';
import { LoadingSpinner, InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormModal, Field, inputClass } from '@/components/common/FormModal';
import { EmptyState, Pagination } from '@/components/common/ListHelpers';

const speciesLabels: Record<number, string> = { 1: 'Cachorro', 2: 'Gato', 3: 'Ave', 4: 'Roedor' };

function emptyForm(tutorId: number): PetRequest {
  return { name: '', breed: '', birthDate: '', weight: undefined, tutorId, speciesId: 1 };
}

export function PetsPage() {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<PetResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<PetResponse | null>(null);
  const [form, setForm] = useState<PetRequest>(emptyForm(user?.id ?? 0));
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<PetResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    if (!user) return;
    setLoading(true);
    setError(null);
    petService
      .findAll({ tutorId: user.id, page, size: 8 })
      .then((data) => {
        setItems(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(getErrorMessage(err, 'Não foi possível carregar seus pets.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, user]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm(user?.id ?? 0));
    setModalOpen(true);
  }

  function openEdit(pet: PetResponse) {
    setEditing(pet);
    setForm({
      name: pet.name,
      breed: pet.breed ?? '',
      birthDate: pet.birthDate ?? '',
      weight: pet.weight,
      tutorId: pet.tutorId,
      speciesId: pet.speciesId,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      const payload: PetRequest = { ...form, birthDate: form.birthDate || undefined };
      if (editing) {
        await petService.update(editing.id, payload);
        showSuccess('Pet atualizado com sucesso.');
      } else {
        await petService.create(payload);
        showSuccess('Pet cadastrado com sucesso.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível salvar o pet.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await petService.delete(deleteTarget.id);
      showSuccess('Pet removido com sucesso.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível remover o pet.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Meus pets</h1>
          <p className="mt-1 text-sm text-ink/55">Cadastre e acompanhe os pets vinculados à sua conta.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Novo pet
        </button>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState message="Você ainda não cadastrou nenhum pet." />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((pet) => (
              <div key={pet.id} className="rounded-xl border border-ink/10 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-brand-50 p-2 text-brand-600">
                      <PawPrint className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-ink">{pet.name}</p>
                      <p className="text-xs text-ink/45">
                        {speciesLabels[pet.speciesId] ?? `Espécie #${pet.speciesId}`} · {pet.breed || 'SRD'}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(pet)}
                      className="rounded-full p-1.5 text-ink/50 hover:bg-sand hover:text-brand-600"
                      aria-label="Editar"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(pet)}
                      className="rounded-full p-1.5 text-ink/50 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remover"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <dl className="mt-3 space-y-1 text-xs text-ink/55">
                  {pet.birthDate && (
                    <div className="flex justify-between">
                      <dt>Nascimento</dt>
                      <dd>{pet.birthDate}</dd>
                    </div>
                  )}
                  {pet.weight != null && (
                    <div className="flex justify-between">
                      <dt>Peso</dt>
                      <dd>{pet.weight} kg</dd>
                    </div>
                  )}
                </dl>
              </div>
            ))}
          </div>
        )}
        {!loading && !error && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}
      </div>

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Editar pet' : 'Novo pet'}>
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
          <Field label="Espécie">
            <select
              className={inputClass}
              value={form.speciesId}
              onChange={(e) => setForm({ ...form, speciesId: Number(e.target.value) })}
            >
              {Object.entries(speciesLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Raça">
            <input
              maxLength={50}
              className={inputClass}
              value={form.breed}
              onChange={(e) => setForm({ ...form, breed: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data de nascimento">
              <input
                type="date"
                className={inputClass}
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
              />
            </Field>
            <Field label="Peso (kg)">
              <input
                type="number"
                step={0.01}
                min={0.01}
                className={inputClass}
                value={form.weight ?? ''}
                onChange={(e) => setForm({ ...form, weight: e.target.value ? Number(e.target.value) : undefined })}
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
        title="Remover pet"
        description={`Tem certeza que deseja remover "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
