
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';
import { api } from '../lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const res = await api.post('/auth/login', { username, password });
      const userData = { username, role: res.role, user: res.user };
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      localStorage.setItem('token', res.token);
      return true;
    } catch (err) {
      return false;
    }
  };

  const register = async (registrationData: any): Promise<{ success: boolean; error?: string }> => {
    try {
      console.log('Attempting to register user:', { username: registrationData.username, email: registrationData.email });
      const response = await api.post('/auth/register', registrationData);
      console.log('Registration response:', response);
      return { success: true };
    } catch (err: any) {
      console.error('Registration error:', err);
      console.error('Error message:', err.message);
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, register }}>
      {children}
    </AuthContext.Provider>
  );
};
