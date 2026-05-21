import api from "./api";

export async function authenticate (name: string, password: string): Promise<any> {
    return await api.post('/login', { email: name, password: password });
}