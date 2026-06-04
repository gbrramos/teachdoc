import { useState, useEffect } from "react";
import { getAuthenticatedUser, type AuthUser } from "~/services/login-service";

export type { AuthUser };

export function useAuth(): { user: AuthUser | null; token: string | null; isAuthenticated: boolean; loading: boolean } {
    const token = sessionStorage.getItem('token');
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState<boolean>(!!token);

    useEffect(() => {
        if (!token) {
            setUser(null);
            setLoading(false);
            return;
        }

        setLoading(true);
        getAuthenticatedUser()
            .then(setUser)
            .catch(() => setUser(null))
            .finally(() => setLoading(false));
    }, [token]);

    return {
        user,
        token,
        isAuthenticated: user !== null,
        loading,
    };
}
