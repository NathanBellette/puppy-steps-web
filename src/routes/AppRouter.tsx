import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { AuthPage } from '@/pages/AuthPage';

// Lazy load pages for better performance
import { lazy, Suspense } from 'react';
import { PageLoader } from '@/components/ui/PageLoader';

const Dashboard = lazy(() => import('@/pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Goals = lazy(() => import('@/pages/Goals').then(m => ({ default: m.Goals })));
const Sessions = lazy(() => import('@/pages/Sessions').then(m => ({ default: m.Sessions })));
const Calendar = lazy(() => import('@/pages/Calendar').then(m => ({ default: m.Calendar })));
const Resources = lazy(() => import('@/pages/Resources').then(m => ({ default: m.Resources })));
const Settings = lazy(() => import('@/pages/Settings').then(m => ({ default: m.Settings })));

export const router = createBrowserRouter([
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Dashboard />
          </Suspense>
        ),
      },
      {
        path: 'goals',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Goals />
          </Suspense>
        ),
      },
      {
        path: 'sessions',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Sessions />
          </Suspense>
        ),
      },
      {
        path: 'calendar',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Calendar />
          </Suspense>
        ),
      },
      {
        path: 'resources',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Resources />
          </Suspense>
        ),
      },
      {
        path: 'settings',
        element: (
          <Suspense fallback={<PageLoader />}>
            <Settings />
          </Suspense>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
