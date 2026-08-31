import { AlertTriangle, RotateCcw } from 'lucide-react';

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-200 bg-red-50 px-6 py-12 text-center">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <p className="max-w-sm text-sm text-red-700">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-red-300 px-4 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Tentar novamente
        </button>
      )}
    </div>
  );
}
