import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider.jsx';
import { ShieldCheck } from 'lucide-react';

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen w-screen flex flex-col items-center justify-center bg-bg text-text">
        <div className="w-10 h-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center text-primary shadow-glow-primary animate-pulse mb-3">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <p className="text-xs font-mono text-muted">Checking authentication session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
