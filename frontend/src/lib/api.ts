const API_BASE_URL = import.meta.env.VITE_API_URL;

type ApiOptions = {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    headers?: Record<string, string>;
    body?: any;
    needsAuth?: boolean;
};

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
    const { method = 'GET', body, needsAuth = true } = options;

    const headers: Record<string, string> = {
        ...options.headers,
    };

    if (needsAuth) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    const config: RequestInit = {
        method,
        headers,
    };

    if (body) {
         if (body instanceof URLSearchParams || body instanceof FormData) {
            config.body = body;
        } else {
            config.body = JSON.stringify(body);
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json';
            }
        }
    }

    config.headers = headers;
    
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'An error occurred');
        }

        if (response.status === 204) {
            return null as T;
        }

        return await response.json() as T;
    } catch (error) {
        console.error('API call failed:', error);
        throw error;
    }
}