
import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider, useTheme } from './hooks/useTheme';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginForm';
import Registration from './pages/Registration';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';

const queryClient = new QueryClient();

// Component that applies dark mode only when authenticated
const AuthenticatedThemeWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { setTheme } = useTheme();

  // Apply user's theme preference when authenticated, force light mode when not
  React.useEffect(() => {
    if (!isAuthenticated) {
      setTheme('light');
    } else if (user?.user?.themePreference) {
      setTheme(user.user.themePreference);
    }
  }, [isAuthenticated, user?.user?.themePreference, setTheme]);

  return <>{children}</>;
};

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
    <ThemeProvider defaultTheme="light" storageKey="vui-theme">
      <TooltipProvider>
        <AuthProvider>
          <AuthenticatedThemeWrapper>
            <div className="min-h-screen bg-background text-foreground">
              <Toaster />
              <Sonner />
              <AppContent />
            </div>
          </AuthenticatedThemeWrapper>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
