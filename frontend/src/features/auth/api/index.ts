import { api } from '../../../lib/api';
import type { AuthResponse, LoginCredentials, SignupCredentials } from '../../../types';

export const loginUser = (credentials: LoginCredentials): Promise<AuthResponse> => {
    const formData = new URLSearchParams();
    formData.append('username', credentials.email);
    formData.append('password', credentials.password);
    
    return api<AuthResponse>('/auth/token', {
        method: 'POST',
        body: formData,
        needsAuth: false,
    });
};

export const signupUser = (credentials: SignupCredentials): Promise<any> => {
    return api('/auth/signup', {
        method: 'POST',
        body: credentials,
        needsAuth: false,
    });
};