import api from "./api";

interface LoginResponse {
    token: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    role: string;
}

export async function authenticate(name: string, password: string): Promise<string> {
    const response = await api.post<LoginResponse>('/login', { email: name, password: password });
    return response.token;
}

export async function register(name: string, email: string, password: string): Promise<void> {
    await api.post('/users', { name, email, password, role: "student" });
}

export async function getAuthenticatedUser(): Promise<AuthUser> {
    const response = await api.get<{ success: boolean; data: AuthUser }>('/get-authenticated');
    return response.data;
}

