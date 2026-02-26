import { supabase } from '../lib/supabaseClient';

interface Entry {
  id?: number;
  date: string;
  type: 'income' | 'expense';
  amount: number;
  category?: string;
}

interface User {
    id: string;
    email: string;
}

interface AuthResponse {
    session: {
        access_token: string;
    };
    user: User;
}

const API_BASE_URL = 'http://localhost:3000/api';
const AUTH_TOKEN_KEY = 'drivers-ledger-token';

const getAuthToken = (): string | null => {
  return localStorage.getItem(AUTH_TOKEN_KEY);
};

const apiService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to login');
    }
    if (data.session?.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, data.session.access_token);
    }
    return data;
  },

  async signup(email: string, password: string): Promise<{ user: User }> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to sign up');
    }
    return data;
  },

  async signInWithGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) {
      throw new Error(error.message);
    }
    // Supabase handles the redirect, so no direct return value here
  },

  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    supabase.auth.signOut(); // Also sign out from Supabase client
  },

  isAuthenticated(): boolean {
    return getAuthToken() !== null;
  },

  async getEntries(): Promise<Entry[]> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/entries`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch entries');
    }
    return data;
  },

  async addEntry(entry: Omit<Entry, 'id'>): Promise<Entry> {
    const token = getAuthToken();
    if (!token) throw new Error('Not authenticated');

    const response = await fetch(`${API_BASE_URL}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(entry),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to add entry');
    }
    return data;
  },
};

export default apiService;