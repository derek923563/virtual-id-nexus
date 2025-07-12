
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import Registration from './pages/Registration';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

const queryClient = new QueryClient();

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [showRegistration, setShowRegistration] = useState(false);

  if (!isAuthenticated) {
    if (showRegistration) {
      return <Registration onBackToLogin={() => setShowRegistration(false)} />;
    }
    return <LoginForm onRegisterClick={() => setShowRegistration(true)} />;
  }

  if (user?.role === 'admin') {
    return <AdminDashboard />;
  }

  if (user?.role === 'user') {
    return <UserDashboard />;
  }

  return <LoginForm onRegisterClick={() => setShowRegistration(true)} />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
          <Toaster />
          <Sonner />
          <AppContent />
        </div>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
