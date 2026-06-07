import { createBrowserRouter, RouterProvider, Navigate, Outlet } from 'react-router-dom';
import { useGameStore } from '@/stores/useGameStore';
import { useWebSocket } from '@/hooks/useWebSocket';
import Layout from '@/components/Layout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Team from '@/pages/Team';
import HackCenter from '@/pages/HackCenter';
import Market from '@/pages/Market';
import DataStorm from '@/pages/DataStorm';
import WeeklyReport from '@/pages/WeeklyReport';
import Ranking from '@/pages/Ranking';
import Profile from '@/pages/Profile';

function ProtectedRoute() {
  const isAuthenticated = useGameStore(state => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

function PublicRoute() {
  const isAuthenticated = useGameStore(state => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

function RootRedirect() {
  const isAuthenticated = useGameStore(state => state.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function AppWrapper() {
  useWebSocket();
  return <Outlet />;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppWrapper />,
    children: [
      {
        index: true,
        element: <RootRedirect />,
      },
      {
        element: <PublicRoute />,
        children: [
          {
            path: 'login',
            element: <Login />,
          },
        ],
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: 'dashboard',
            element: <Dashboard />,
          },
          {
            path: 'team',
            element: <Team />,
          },
          {
            path: 'hack',
            element: <HackCenter />,
          },
          {
            path: 'market',
            element: <Market />,
          },
          {
            path: 'storm',
            element: <DataStorm />,
          },
          {
            path: 'weekly',
            element: <WeeklyReport />,
          },
          {
            path: 'ranking',
            element: <Ranking />,
          },
          {
            path: 'profile',
            element: <Profile />,
          },
        ],
      },
      {
        path: '*',
        element: <RootRedirect />,
      },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
