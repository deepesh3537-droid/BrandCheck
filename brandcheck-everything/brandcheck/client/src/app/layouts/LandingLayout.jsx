import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { ShieldCheck, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider.jsx';

export default function LandingLayout({ children }) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bg text-text relative selection:bg-primary/20 selection:text-primary">
      {/* Accessible skip link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 px-4 py-2 bg-primary text-bg font-semibold rounded shadow-glow-primary outline-none"
      >
        Skip to main content
      </a>

      {/* Top Header */}
      <header className="relative z-30 w-full border-b border-border/40 bg-bg/80 backdrop-blur-md sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-primary group-hover:border-primary/50 transition-colors shadow-glow-primary">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-semibold tracking-tight text-lg text-text">BrandCheck</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full border border-border bg-surface text-muted">
              v0.1
            </span>
          </Link>

          <nav className="flex items-center gap-3 sm:gap-4" aria-label="Main Navigation">
            {user ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted hidden sm:inline flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  {user.displayName || user.email}
                </span>
                <Link
                  to="/app"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-primary text-bg px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-primary-hover transition-all shadow-glow-primary active:scale-[0.98]"
                >
                  <span>Go to App</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 sm:gap-4">
                <Link
                  to="/login"
                  className="text-xs sm:text-sm font-medium text-muted hover:text-text transition-colors px-2.5 py-1.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold bg-primary text-bg px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-primary-hover transition-all shadow-glow-primary active:scale-[0.98]"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main body: renders Outlet or direct children */}
      <main id="main-content" className="flex-1 relative focus:outline-none">
        {children || <Outlet />}
      </main>
    </div>
  );
}
