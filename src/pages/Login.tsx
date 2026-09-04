import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, PawPrint } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { inputClass } from '@/components/common/FormModal';
import { InlineSpinner } from '@/components/common/LoadingSpinner';

export function LoginPage() {
  const { login, isAuthenticated, user } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && user) {
    const redirectTo = user.role === 'ADMIN' ? '/admin' : '/tutor';
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const loggedUser = await login(email, password);
      showSuccess(`Bem-vindo(a), ${loggedUser.name.split(' ')[0]}!`);
      navigate(loggedUser.role === 'ADMIN' ? '/admin' : '/tutor', { replace: true });
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Não foi possível entrar.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-brand-600 p-3">
            <PawPrint className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">PetFlow</h1>
          <p className="mt-1 text-sm text-ink/55">Entre com sua conta de tutor ou administrador</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink/80">E-mail</span>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink/80">Senha</span>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-60"
          >
            {submitting ? <InlineSpinner /> : <LogIn className="h-4 w-4" />}
            Entrar
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-ink/40">
          Admin: admin@petflow.com - Admin@123
        </p>
        <p className="text-center text-xs text-ink/40">
          Tutor: maria@petflow.com - Tutor@123
        </p>
      </div>
    </div>
  );
}
