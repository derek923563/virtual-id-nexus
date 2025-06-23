
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from '../types';

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

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    console.log('Login attempt with:', emailOrUsername);
    
    // Admin credentials
    if (emailOrUsername === 'admin@virtualid.com' && password === 'admin123') {
      const adminUser: User = {
        id: 'admin-1',
        email: 'admin@virtualid.com',
        role: 'admin'
      };
      setUser(adminUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(adminUser));
      return true;
    }

    // Check for member login by email or username
    const members = JSON.parse(localStorage.getItem('members') || '[]');
    console.log('Available members:', members);
    
    const member = members.find((m: any) => {
      const emailMatch = m.email && m.email.toLowerCase() === emailOrUsername.toLowerCase();
      const usernameMatch = m.username && m.username.toLowerCase() === emailOrUsername.toLowerCase();
      console.log(`Checking member ${m.email}/${m.username}: email match: ${emailMatch}, username match: ${usernameMatch}`);
      return emailMatch || usernameMatch;
    });
    
    console.log('Found member:', member);
    
    if (member && password === 'user123') {
      const memberUser: User = {
        id: member.id,
        email: member.email,
        role: 'user',
        memberId: member.id
      };
      setUser(memberUser);
      setIsAuthenticated(true);
      localStorage.setItem('currentUser', JSON.stringify(memberUser));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};
