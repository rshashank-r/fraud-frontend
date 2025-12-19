import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { setAuthToken } from '../services/api';

interface AuthContextType {
    isAuthenticated: boolean;
    token: string | null;
    role: string | null;
    login: (token: string, role: string) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
    const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
    const [isLoading, setIsLoading] = useState(true);

    // Sync state with localStorage on mount
    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');

        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
            setAuthToken(storedToken); // Sync API memory
        }
        setIsLoading(false);
    }, []);

    const login = (newToken: string, newRole: string) => {
        console.log('🔐 AuthContext.login() called with:', { token: newToken.substring(0, 20) + '...', role: newRole });

        // CRITICAL: Clear ALL old auth data first to prevent stale data
        localStorage.removeItem('token');
        localStorage.removeItem('role');

        // Set new authentication data
        setAuthToken(newToken); // Handle token (memory + localStorage)
        localStorage.setItem('role', newRole);

        // Update React state
        setToken(newToken);
        setRole(newRole);

        // Verify it was saved correctly
        console.log('✅ Saved to localStorage:', {
            token: localStorage.getItem('token')?.substring(0, 20) + '...',
            role: localStorage.getItem('role')
        });
    };

    const logout = () => {
        setAuthToken(null); // Clear token
        localStorage.removeItem('role');
        setToken(null);
        setRole(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ isAuthenticated, token, role, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
