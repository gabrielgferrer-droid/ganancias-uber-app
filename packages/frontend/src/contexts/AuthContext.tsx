import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import apiService from '../services/apiService';
import { supabase } from '../lib/supabaseClient'; // Import the client-side supabase client

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>; // New function for Google login
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(apiService.isAuthenticated());
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Listen for auth state changes from Supabase
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        // Store the access token for our API service
        localStorage.setItem('drivers-ledger-token', session.access_token);
        setIsAuthenticated(true);
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        localStorage.removeItem('drivers-ledger-token');
        setIsAuthenticated(false);
        setUser(null);
      }
    });

    // Check initial session
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('drivers-ledger-token', session.access_token);
        setIsAuthenticated(true);
        setUser({ id: session.user.id, email: session.user.email || '' });
      } else {
        localStorage.removeItem('drivers-ledger-token');
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser } = await apiService.login(email, password);
      // Supabase auth state change listener will handle setting isAuthenticated and user
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await apiService.signInWithGoogle();
      // Supabase handles the redirect, so state will be updated by onAuthStateChange
    } catch (error) {
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    // Supabase auth state change listener will handle setting isAuthenticated and user
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