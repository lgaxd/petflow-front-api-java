import { PawPrint } from 'lucide-react';

export function LoadingSpinner({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-brand-600">
      <PawPrint className="h-8 w-8 animate-bounce" />
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  );
}

export function InlineSpinner() {
  return (
    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
  );
}
