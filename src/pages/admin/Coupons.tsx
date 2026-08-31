import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Ticket, Trash2 } from 'lucide-react';
import { couponService } from '@/services/couponService';
import { getErrorMessage } from '@/services/api';
import { useToast } from '@/contexts/ToastContext';
import type { CouponRequest, CouponResponse, CouponStatus } from '@/types';
import { LoadingSpinner, InlineSpinner } from '@/components/common/LoadingSpinner';
import { ErrorState } from '@/components/common/ErrorState';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { FormModal, Field, inputClass } from '@/components/common/FormModal';
import { Pagination, EmptyState, StatusBadge } from '@/components/common/ListHelpers';

const emptyForm: CouponRequest = { code: '', status: 'DISPONIVEL', expirationDate: '', templateId: 1 };
const statusOptions: CouponStatus[] = ['DISPONIVEL', 'RESGATADO', 'UTILIZADO'];

export function CouponsPage() {
  const { showSuccess, showError } = useToast();

  const [items, setItems] = useState<CouponResponse[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [statusFilter, setStatusFilter] = useState<CouponStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CouponRequest>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<number | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<CouponResponse | null>(null);
  const [deleting, setDeleting] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    couponService
      .findAll({ status: statusFilter || undefined, page, size: 8 })
      .then((data) => {
        setItems(data.content);
        setTotalPages(data.totalPages);
      })
      .catch((err) => setError(getErrorMessage(err, 'Não foi possível carregar os cupons.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, [page, statusFilter]);

  function openCreate() {
    setForm(emptyForm);
    setModalOpen(true);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    try {
      await couponService.create({
        ...form,
        expirationDate: form.expirationDate || undefined,
      });
      showSuccess('Cupom criado com sucesso.');
      setModalOpen(false);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível criar o cupom.'));
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(coupon: CouponResponse, status: CouponStatus) {
    if (status === coupon.status) return;
    setStatusUpdatingId(coupon.id);
    try {
      await couponService.updateStatus(coupon.id, status);
      showSuccess(`Status do cupom ${coupon.code} atualizado.`);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível atualizar o status.'));
    } finally {
      setStatusUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await couponService.delete(deleteTarget.id);
      showSuccess('Cupom removido com sucesso.');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showError(getErrorMessage(err, 'Não foi possível remover o cupom.'));
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Cupons</h1>
          <p className="mt-1 text-sm text-ink/55">Cupons de desconto disponíveis para resgate por pontos.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Novo cupom
        </button>
      </div>

      <div className="mt-6 flex gap-2">
        <button
          onClick={() => {
            setPage(0);
            setStatusFilter('');
          }}
          className={`rounded-full px-4 py-1.5 text-sm font-medium ${
            statusFilter === '' ? 'bg-ink text-white' : 'bg-white text-ink/60 border border-ink/10'
          }`}
        >
          Todos
        </button>
        {statusOptions.map((s) => (
          <button
            key={s}
            onClick={() => {
              setPage(0);
              setStatusFilter(s);
            }}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              statusFilter === s ? 'bg-ink text-white' : 'bg-white text-ink/60 border border-ink/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-ink/10 bg-white shadow-sm">
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <ErrorState message={error} onRetry={load} />
        ) : items.length === 0 ? (
          <EmptyState message="Nenhum cupom encontrado." />
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-ink/10 bg-sand/60 text-xs uppercase tracking-wide text-ink/45">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Expiração</th>
                <th className="px-4 py-3">Template</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {items.map((coupon) => (
                <tr key={coupon.id}>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-brand-500" />
                      <span className="font-medium text-ink">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={coupon.status} />
                      <select
                        value={coupon.status}
                        disabled={statusUpdatingId === coupon.id}
                        onChange={(e) => handleStatusChange(coupon, e.target.value as CouponStatus)}
                        className="rounded-lg border border-ink/10 bg-white px-2 py-1 text-xs text-ink/60"
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink/70">{coupon.expirationDate || '—'}</td>
                  <td className="px-4 py-3 text-ink/70">#{coupon.templateId}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setDeleteTarget(coupon)}
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

      <FormModal open={modalOpen} onClose={() => setModalOpen(false)} title="Novo cupom">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Código do cupom">
            <input
              required
              maxLength={50}
              placeholder="DESCONTO20"
              className={inputClass}
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
            />
          </Field>
          <Field
            label="ID do template de cupom"
            hint="A API não expõe um endpoint de listagem de templates; informe o ID existente no banco (ex.: 1 a 4 nos dados de exemplo)."
          >
            <input
              type="number"
              required
              min={1}
              className={inputClass}
              value={form.templateId}
              onChange={(e) => setForm({ ...form, templateId: Number(e.target.value) })}
            />
          </Field>
          <Field label="Status inicial">
            <select
              className={inputClass}
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as CouponStatus })}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data de expiração" hint="Opcional — deve ser uma data futura.">
            <input
              type="date"
              className={inputClass}
              value={form.expirationDate}
              onChange={(e) => setForm({ ...form, expirationDate: e.target.value })}
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
        title="Remover cupom"
        description={`Tem certeza que deseja remover o cupom "${deleteTarget?.code}"? Esta ação não pode ser desfeita.`}
        isLoading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
