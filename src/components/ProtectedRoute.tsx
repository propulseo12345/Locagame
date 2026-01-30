import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'client' | 'technician';
  /** Si true, affiche la page accès refusé au lieu de rediriger */
  showAccessDenied?: boolean;
}

export function ProtectedRoute({ children, requiredRole, showAccessDenied = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Afficher un loader pendant la vérification
  if (loading) {
    return (
      <div className="min-h-screen bg-[#000033] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#33ffcc] border-t-transparent mb-4"></div>
          <p className="text-white text-lg">Chargement...</p>
        </div>
      </div>
    );
  }

  // Si non connecté, rediriger vers login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Si un rôle spécifique est requis, vérifier
  // Le rôle est déterminé côté serveur (via RPC get_current_user_role)
  // donc cette vérification est sûre - elle reflète la réalité DB
  if (requiredRole && user.role !== requiredRole) {
    // Option: afficher la page accès refusé
    if (showAccessDenied) {
      return <Navigate to="/access-denied" state={{ from: location, requiredRole }} replace />;
    }

    // Par défaut: rediriger vers le dashboard approprié au rôle réel
    if (user.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else if (user.role === 'technician') {
      return <Navigate to="/technician/dashboard" replace />;
    } else {
      return <Navigate to="/client/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
