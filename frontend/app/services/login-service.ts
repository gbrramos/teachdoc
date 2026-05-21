import api from "./api";

export async function authenticate (name: string, password: string) {
    const response = await api.post('/login', { email: name, password: password });

    if (response)
        return response;
}