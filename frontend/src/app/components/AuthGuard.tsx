import { Navigate } from 'react-router';import { useAuth } from '../contexts/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
}

export function AuthGuard({ children, requireAdmin, requireModerator }: AuthGuardProps) {
  const { isAuthenticated, isAdmin, isModerator, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (requireModerator && !isModerator && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
