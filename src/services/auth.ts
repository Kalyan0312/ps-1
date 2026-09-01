export type UserRole = 'worker' | 'customer' | 'admin' | 'cooperative_leader';

export interface UserProfile {
  id: string;
  phone_number: string;
  email?: string;
  full_name: string;
  role: UserRole;
  status: string;
  is_verified: boolean;
  preferred_language: string;
  created_at: string;
  profile_details?: Record<string, any>;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user: UserProfile;
}

const TOKEN_KEY = 'coop_gig_token';
const USER_KEY = 'coop_gig_user';

export const authStorage = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getUser: (): UserProfile | null => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },
  setAuth: (token: string, user: UserProfile) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
};

const API_BASE = 'https://ps-1-rtys.vercel.app';

export async function loginUser(phone_or_email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone_or_email, password })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Authentication failed' }));
    throw new Error(err.detail || 'Login failed');
  }
  const data: AuthResponse = await res.json();
  authStorage.setAuth(data.access_token, data.user);
  return data;
}

export async function registerUser(
  full_name: string,
  phone_number: string,
  password: string,
  role: UserRole,
  preferred_language = 'en'
): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ full_name, phone_number, password, role, preferred_language })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Registration failed' }));
    throw new Error(err.detail || 'Registration failed');
  }
  const data: AuthResponse = await res.json();
  authStorage.setAuth(data.access_token, data.user);
  return data;
}

export async function fetchCurrentUser(): Promise<UserProfile> {
  const token = authStorage.getToken();
  if (!token) throw new Error('No authentication token available');
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!res.ok) {
    authStorage.clearAuth();
    throw new Error('Failed to fetch user profile');
  }
  const user: UserProfile = await res.json();
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  return user;
}

export async function logoutUser(): Promise<void> {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
  } catch (e) {
    // Ignore network error during logout
  }
  authStorage.clearAuth();
}
