import { ChevronLeft, ChevronRight } from 'lucide-react';

const badgeColors: Record<string, string> = {
  DISPONIVEL: 'bg-brand-100 text-brand-700',
  ATIVO: 'bg-brand-100 text-brand-700',
  REALIZADO: 'bg-brand-100 text-brand-700',
  RESGATADO: 'bg-amber-100 text-amber-700',
  AGENDADO: 'bg-amber-100 text-amber-700',
  UTILIZADO: 'bg-ink/10 text-ink/60',
  ENCERRADO: 'bg-ink/10 text-ink/60',
  CANCELADO: 'bg-red-100 text-red-700',
  EXPIRADO: 'bg-red-100 text-red-700',
};

export function StatusBadge({ status }: { status: string }) {
  const colors = badgeColors[status] ?? 'bg-ink/10 text-ink/60';
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${colors}`}>
      {status}
    </span>
  );
}

export function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-ink/10 px-1 py-3">
      <span className="text-xs text-ink/50">
        Página {page + 1} de {totalPages}
      </span>
      <div className="flex gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 0}
          className="rounded-full p-1.5 text-ink/60 hover:bg-sand disabled:opacity-30"
          aria-label="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="rounded-full p-1.5 text-ink/60 hover:bg-sand disabled:opacity-30"
          aria-label="Próxima página"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-1 py-10 text-center text-sm text-ink/45">{message}</p>;
}
