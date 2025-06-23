
export interface User {
  id: string;
  email: string;
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
  phone: string;
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
  adminPoints: number;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => void;
}
