import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { PawPrint, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { inputClass } from '@/components/common/FormModal';
import { InlineSpinner } from '@/components/common/LoadingSpinner';
import { getErrorMessage } from '@/services/api';
import { tutorService } from '@/services/tutorService';

// Mesma regra do backend (TutorRequestDTO): mínimo de 8 caracteres, com letra e número.
const PASSWORD_PATTERN = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

export function RegisterPage() {
  const { login, isAuthenticated, user } = useAuth();
  const { showError, showSuccess } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated && user) {
    return <Navigate to={user.role === 'ADMIN' ? '/admin' : '/tutor'} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!PASSWORD_PATTERN.test(password)) {
      showError('A senha deve ter no mínimo 8 caracteres, contendo pelo menos uma letra e um número.');
      return;
    }
    if (password !== confirmPassword) {
      showError('As senhas não conferem.');
      return;
    }

    setSubmitting(true);
    try {
      await tutorService.create({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
    } catch (error) {
      showError(getErrorMessage(error, 'Não foi possível criar a conta.'));
      setSubmitting(false);
      return;
    }

    // Conta criada: entra direto, sem obrigar o tutor a digitar os dados de novo.
    try {
      const loggedUser = await login(email.trim(), password);
      showSuccess(`Conta criada! Bem-vindo(a), ${loggedUser.name.split(' ')[0]}!`);
      navigate('/tutor', { replace: true });
    } catch {
      showSuccess('Conta criada! Entre com seu e-mail e senha.');
      navigate('/login', { replace: true });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-brand-600 p-3">
            <PawPrint className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-2xl font-semibold text-ink">Criar conta</h1>
          <p className="mt-1 text-sm text-ink/55">Cadastre-se como tutor para cuidar dos seus pets</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
          <div className="space-y-4">
            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink/80">Nome completo</span>
              <input
                type="text"
                required
                maxLength={100}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Maria Silva"
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink/80">E-mail</span>
              <input
                type="email"
                required
                maxLength={100}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@email.com"
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink/80">
                Telefone <span className="font-normal text-ink/40">(opcional)</span>
              </span>
              <input
                type="tel"
                maxLength={20}
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(11) 99999-9999"
                className={inputClass}
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink/80">Senha</span>
              <input
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
              <span className="mt-1 block text-xs text-ink/45">
                Mínimo de 8 caracteres, com pelo menos uma letra e um número.
              </span>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium text-ink/80">Confirmar senha</span>
              <input
                type="password"
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
            {submitting ? <InlineSpinner /> : <UserPlus className="h-4 w-4" />}
            Criar conta
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-ink/60">
          Já tem uma conta?{' '}
          <Link to="/login" className="font-semibold text-brand-700 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
