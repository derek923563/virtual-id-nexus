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
  email: string;
  phone: string;
  experience: string;
  dateOfBirth: string;
  address: string;
  joinDate: string;
  status: 'active' | 'inactive';
  password: string;
}
