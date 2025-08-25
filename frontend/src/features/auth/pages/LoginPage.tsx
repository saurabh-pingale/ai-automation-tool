import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Workflow } from 'lucide-react';

import { loginUser } from '../api';
import { useAuth } from '../../../providers/AuthProvider';
import { useError } from '../../../providers/ErrorProvider';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Card } from '../../../components/ui/Card';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();
    const { login } = useAuth();
    const { showError } = useError();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const data = await loginUser({ email, password });
            login(data.access_token);
            navigate('/');
        } catch (err) {
            showError('Failed to login. Please check your credentials.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
            <Card className="w-full max-w-md shadow-xl">
                <div className="text-center mb-6">
                    <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <Workflow className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
                    <p className="text-gray-600 mt-2">Sign in to your account</p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        id="email"
                        label="Email" 
                        type="email" 
                        placeholder="Enter your email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)} 
                        required 
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password" 
                        placeholder="Enter your password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        required 
                    />
                    <Button 
                        type="submit" 
                        className="w-full py-3" 
                        isLoading={isLoading}
                    >
                        Sign In
                    </Button>
                </form>
                
                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-indigo-600 hover:text-indigo-700 font-medium">
                            Sign up
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};