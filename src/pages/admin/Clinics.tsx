import { useEffect, useState, type FormEvent } from 'react';
import { Building2, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { clinicService } from '@/services/clinicService';
import { getErrorMessage } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { ClinicRequest, ClinicResponse } from '@/types';
import { LoadingSpinner, InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormModal, Field, inputClass } from '@/components/common/FormModal';
import { Pagination, EmptyState } from '@/components/common/ListHelpers';

const emptyForm: ClinicRequest = { name: '', address: '', phone: '', cnpj: '' };

export function ClinicsPage() {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<ClinicResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [nameFilter, setNameFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClinicResponse | null>(null);
  const [form, setForm] = useState<ClinicRequest>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ClinicResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    clinicService
      .findAll({ name: nameFilter || undefined, page, size: 8 })
      .then((data) => {
        setItems(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(getErrorMessage(err, 'Não foi possível carregar as clínicas.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, nameFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEdit(clinic: ClinicResponse) {
    setEditing(clinic);
    setForm({
      name: clinic.name,
      address: clinic.address ?? '',
      phone: clinic.phone ?? '',
      cnpj: clinic.cnpj,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await clinicService.update(editing.id, form);
        showSuccess('Clínica atualizada com sucesso.');
      } else {
        await clinicService.create(form);
        showSuccess('Clínica cadastrada com sucesso.');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível salvar a clínica.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await clinicService.delete(deleteTarget.id);
      showSuccess('Clínica removida com sucesso.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível remover a clínica.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Clínicas</h1>
          <p className="mt-1 text-sm text-ink/55">Clínicas veterinárias parceiras da plataforma.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Nova clínica
        </button>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-full border border-ink/10 bg-white px-4 py-2">
        <Search className="h-4 w-4 text-ink/40" />
        <input
          value={nameFilter}
          onChange={(e) => {
            setPage(0);
            setNameFilter(e.target.value);
          }}
          placeholder="Buscar por nome..."
          className="w-full border-none text-sm outline-none placeholder:text-ink/35"
        />
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhuma clínica encontrada." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-sand/60 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-4 py-3">Clínica</th>
                <th className="px-4 py-3">CNPJ</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {items.map((clinic) => (
                <tr key={clinic.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-brand-500" />
                      <div>
                        <p className="font-medium text-ink">{clinic.name}</p>
                        <p className="text-xs text-ink/45">{clinic.address || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{clinic.cnpj}</td>
                  <td className="px-4 py-3 text-ink/70">{clinic.phone || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        onClick={() => openEdit(clinic)}
                        className="rounded-full p-2 text-ink/50 hover:bg-sand hover:text-brand-600"
                        aria-label="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(clinic)}
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

      <FormModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar clínica' : 'Nova clínica'}
      >
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
          <Field label="CNPJ" hint="Formato: 00.000.000/0000-00">
            <input
              required
              maxLength={18}
              placeholder="00.000.000/0000-00"
              className={inputClass}
              value={form.cnpj}
              onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
            />
          </Field>
          <Field label="Endereço">
            <input
              maxLength={200}
              className={inputClass}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          <Field label="Telefone">
            <input
              maxLength={20}
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
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
        title="Remover clínica"
        description={`Tem certeza que deseja remover "${deleteTarget?.name}"? Esta ação não pode ser desfeita.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
