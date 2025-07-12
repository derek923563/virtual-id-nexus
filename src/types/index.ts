
export interface User {
  id?: string;
  email?: string;
  username?: string;
  role: 'admin' | 'user';
  memberId?: string;
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
}
