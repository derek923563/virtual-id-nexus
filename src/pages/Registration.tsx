
import React from 'react';
import { MemberRegistrationForm } from '../components/MemberRegistrationForm';
import { Button } from '@/components/ui/button';
import { ArrowLeft, UserPlus } from 'lucide-react';

interface RegistrationProps {
  onBackToLogin: () => void;
}

const Registration: React.FC<RegistrationProps> = ({ onBackToLogin }) => {
  const handleRegistrationSuccess = () => {
    // After successful registration, go back to login
    onBackToLogin();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBackToLogin}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Login</span>
          </Button>
        </div>
        
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-full">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Member Registration</h1>
          <p className="text-gray-600 dark:text-gray-300">Create your virtual ID card account</p>
        </div>

        <MemberRegistrationForm
          onSuccess={handleRegistrationSuccess}
          onCancel={onBackToLogin}
        />
      </div>
    </div>
  );
};

export default Registration;
