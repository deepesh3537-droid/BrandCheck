import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import LandingLayout from './layouts/LandingLayout.jsx';
import LoginPage from '../features/auth/LoginPage';
import RegisterPage from '../features/auth/RegisterPage';
import InvitePage from '../features/auth/InvitePage';
import WorkspaceListPage from '../features/workspace/WorkspaceListPage';
import WorkspaceLayout from './layouts/WorkspaceLayout';
import ReviewWorkspaceView from '../features/review/ReviewWorkspaceView';
import RequireAuth from './guards/RequireAuth';

const LazyLandingPage = lazy(() => import('../features/landing/LandingPage'));

function LandingFallback() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-8 bg-bg text-text">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
      <span className="text-xs text-muted font-mono tracking-wider">LOADING BRANDCHECK...</span>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <LandingLayout>
        <Suspense fallback={<LandingFallback />}>
          <LazyLandingPage />
        </Suspense>
      </LandingLayout>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/invite/:token',
    element: <InvitePage />,
  },
  {
    path: '/app',
    element: (
      <RequireAuth>
        <WorkspaceListPage />
      </RequireAuth>
    ),
  },
  {
    path: '/app/w/:workspaceId',
    element: (
      <RequireAuth>
        <WorkspaceLayout />
      </RequireAuth>
    ),
    children: [
      {
        index: true,
        element: <ReviewWorkspaceView />,
      },
      {
        path: 'reviews/:reviewId',
        element: <ReviewWorkspaceView />,
      },
    ],
  },
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});
