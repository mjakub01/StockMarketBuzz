
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import { loginUser, logoutUser, registerUser } from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (e: string, p: string) => Promise<void>;
  register: (n: string, e: string, p: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  // Default loading to true, but we resolve it immediately in effect
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // BYPASS LOGIN: Automatically set a guest user
    setUser({
      id: 'guest_user',
      name: 'Guest Trader',
      email: 'guest@stockbuzz.com',
      role: 'user',
      createdAt: new Date().toISOString()
    });
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // No-op for now
  };

  const register = async (name: string, email: string, pass: string) => {
    // No-op for now
  };

  const logout = () => {
    // No-op for now
  };

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: true, // Always true
      isAdmin: false, // Default to false
      login, 
      register, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
