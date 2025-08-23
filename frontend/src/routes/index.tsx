import { createBrowserRouter, RouterProvider } from 'react-router-dom';

import { App } from '../App';
import { ProtectedRoute } from '../components/layout/ProtectedRoute';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { SignupPage } from '../features/auth/pages/SignupPage';
import { DashboardPage } from '../features/workflow/pages/DashboardPage';
import { WorkflowDetailPage } from '../features/workflow/pages/WorkflowDetailPage';

const router = createBrowserRouter([
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/signup',
        element: <SignupPage />,
    },
    {
        path: '/',
        element: <App />,
        children: [
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: '/',
                        element: <DashboardPage />,
                    },
                    {
                        path: '/workflow/:workflowId',
                        element: <WorkflowDetailPage />,
                    },
                ],
            },
        ],
    },
]);

export const AppRouter = () => <RouterProvider router={router} />;