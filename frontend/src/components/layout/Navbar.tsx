import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Workflow } from 'lucide-react';

import { useAuth } from '../../providers/AuthProvider';
import { Button } from '../ui/Button';

export const Navbar = () => {
    const { isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="bg-white shadow-sm border-b border-gray-100">
            <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <Workflow className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-gray-900">FlowForge</span>
                </Link>
                
                {isAuthenticated && (
                    <div className="flex items-center space-x-4">
                        <Button 
                            onClick={handleLogout} 
                            variant="secondary"
                            className="flex items-center space-x-2 px-3 py-2 text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </Button>
                    </div>
                )}
            </nav>
        </header>
    );
};