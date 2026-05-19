import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { WhiteLabelProvider } from "@/contexts/WhiteLabelContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading, effectiveUserId } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Forçar remontagem de toda a árvore quando effectiveUserId muda (impersonificação)
  // WhiteLabelProvider APENAS para rotas autenticadas - páginas públicas usam PublicWhiteLabelProvider
  return (
    <WhiteLabelProvider>
      <div key={effectiveUserId}>{children}</div>
    </WhiteLabelProvider>
  );
}
