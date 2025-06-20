export interface Member {
  id: string;
  uniqueId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  experience: string;
  dateOfBirth: string;
  address: string;
  profileImage?: string;
  joinDate: string;
  status: 'active' | 'inactive';
}

export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  memberId?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}
