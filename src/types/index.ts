
export interface User {
  id?: string;
  email?: string;
  username?: string;
  role: 'admin' | 'user';
  memberId?: string;
  user?: {
    id: string;
    username: string;
    email: string;
    themePreference?: 'light' | 'dark' | 'system';
    [key: string]: any;
  };
}

export interface Member {
  id: string;
  uniqueId: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  experience: string;
  dateOfBirth: string;
  address: string;
  joinDate: string;
  status: 'active' | 'inactive';
  password: string;
  confirmPassword: string;
  themePreference?: 'light' | 'dark' | 'system';
  eventParticipation: {
    registeredEvents: string[];
    missedEvents: number;
    lastActivity: string;
  };
  points: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (registrationData: any) => Promise<{ success: boolean; error?: string }>;
  updateThemePreference: (themePreference: 'light' | 'dark' | 'system') => Promise<boolean>;
}
