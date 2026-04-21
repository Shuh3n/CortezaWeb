import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, user } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  if (isLoading) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-neutral-soft px-6">
          <div className="rounded-3xl border border-primary/10 bg-white px-8 py-10 text-center shadow-lg shadow-primary/10">
            <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
            <p className="font-semibold text-text-main">{t('auth.validando')}</p>
          </div>
        </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}