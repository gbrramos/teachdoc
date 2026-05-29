import api from "./api";

interface LoginResponse {
    token: string;
}

export async function authenticate(name: string, password: string): Promise<string> {
    const response = await api.post<LoginResponse>('/login', { email: name, password: password });
    return response.token;
}