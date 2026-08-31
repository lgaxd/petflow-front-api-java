import { Navigate, Route, Routes } from 'react-router-dom';
import { LoginPage } from '@/pages/Login';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { TutorLayout } from '@/components/layout/TutorLayout';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { ClinicsPage } from '@/pages/admin/Clinics';
import { PlansPage } from '@/pages/admin/Plans';
import { CouponsPage } from '@/pages/admin/Coupons';
import { TutorDashboard } from '@/pages/tutor/TutorDashboard';
import { PetsPage } from '@/pages/tutor/Pets';
import { HealthEventsPage } from '@/pages/tutor/HealthEvents';
import { SubscriptionsPage } from '@/pages/tutor/Subscriptions';
import { RedeemPage } from '@/pages/tutor/Redeem';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rotas exclusivas do ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="clinics" element={<ClinicsPage />} />
          <Route path="plans" element={<PlansPage />} />
          <Route path="coupons" element={<CouponsPage />} />
        </Route>
      </Route>

      {/* Rotas exclusivas do TUTOR */}
      <Route element={<ProtectedRoute allowedRoles={['TUTOR']} />}>
        <Route path="/tutor" element={<TutorLayout />}>
          <Route index element={<TutorDashboard />} />
          <Route path="pets" element={<PetsPage />} />
          <Route path="health-events" element={<HealthEventsPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route path="redeem" element={<RedeemPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
