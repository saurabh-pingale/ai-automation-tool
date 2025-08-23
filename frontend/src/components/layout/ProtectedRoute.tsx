import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../providers/AuthProvider';
import { Spinner } from '../ui/Spinner';

export const ProtectedRoute = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><Spinner /></div>;
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};