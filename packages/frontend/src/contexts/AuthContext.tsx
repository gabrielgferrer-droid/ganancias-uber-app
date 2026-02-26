import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import apiService from '../services/apiService';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(apiService.isAuthenticated());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('AuthContext: Setting up auth state listener');
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthContext: onAuthStateChange event:', _event);
      console.log('AuthContext: onAuthStateChange session:', session);

      const sessionUser = session?.user;
      if (sessionUser) {
        localStorage.setItem('drivers-ledger-token', session.access_token);
        setIsAuthenticated(true);
        setUser({ id: sessionUser.id, email: sessionUser.email || '' });
        console.log('AuthContext: User authenticated:', sessionUser.email);
      } else {
        localStorage.removeItem('drivers-ledger-token');
        setIsAuthenticated(false);
        setUser(null);
        console.log('AuthContext: User not authenticated.');
      }
      setIsLoading(false);
    });

    const checkSession = async () => {
      console.log('AuthContext: Checking initial session');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('AuthContext: Initial session check result:', session);
      if (session) {
        localStorage.setItem('drivers-ledger-token', session.access_token);
        setIsAuthenticated(true);
        setUser({ id: session.user.id, email: session.user.email || '' });
        console.log('AuthContext: Initial session found for user:', session.user.email);
      }
      setIsLoading(false);
    };

    checkSession();

    return () => {
      console.log('AuthContext: Cleaning up auth state listener');
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await apiService.login(email, password);
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await apiService.signInWithGoogle();
    } catch (error) {
      console.error('AuthContext: Google login failed:', error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
    console.log('AuthContext: Logging out');
    apiService.logout();
  };

  const authContextValue = {
    isAuthenticated,
    user,
    login,
    loginWithGoogle,
    logout,
    isLoading,
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};