import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

/**
 * Bloqueia o acesso a rotas que exigem login e, opcionalmente,
 * um cargo (role) específico. Um Tutor tentando acessar rotas do Admin
 * (e vice-versa) é redirecionado ao seu próprio painel.
 */
export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const home = user.role === 'ADMIN' ? '/admin' : '/tutor';
    return <Navigate to={home} replace />;
  }

  return <Outlet />;
}
