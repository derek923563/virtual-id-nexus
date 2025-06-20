
import React from 'react';
import { useAuth } from '../context/AuthContext';
import LoginForm from '../components/LoginForm';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';

const Index = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'user') {
    return <UserDashboard />;
  }

  return <LoginForm />;
};

export default Index;
