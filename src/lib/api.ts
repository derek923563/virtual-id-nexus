const API_BASE = '/.netlify/functions';

function getToken() {
  return localStorage.getItem('token');
}

async function request(method: string, endpoint: string, data?: any) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'API error');
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request('POST', '/auth-login', data),
  register: (data: any) => request('POST', '/auth-register', data),
  verifyOtp: (data: any) => request('POST', '/verify-otp', data),
  
  // Members
  getMembers: () => request('GET', '/get-members'),
  getMember: (id: string) => request('GET', `/get-member/${id}`),
  updateMember: (id: string, data: any) => request('PUT', `/update-member/${id}`, data),
  deleteMember: (id: string) => request('DELETE', `/delete-member/${id}`),
  
  // Public VID
  getPublicVid: (publicId: string) => request('GET', `/public-vid/${publicId}`),
  
  // Theme
  updateTheme: (data: any) => request('PUT', '/theme-preference', data),
  
  // Password
  changePassword: (data: any) => request('PUT', '/change-password', data),
  
  // Feedback
  submitFeedback: (data: any) => request('POST', '/feedback', data),
}; 