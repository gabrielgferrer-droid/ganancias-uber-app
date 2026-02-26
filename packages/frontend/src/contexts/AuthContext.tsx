import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import apiService from '../services/apiService';
import { supabase } from '../lib/supabaseClient';
import { User } from '../types'; // Use central types

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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const sessionUser = session?.user;
      if (sessionUser) {
        localStorage.setItem('drivers-ledger-token', session.access_token);
        setIsAuthenticated(true);
        setUser({ id: sessionUser.id, email: sessionUser.email || '' });
      } else {
        localStorage.removeItem('drivers-ledger-token');
        setIsAuthenticated(false);
        setUser(null);
      }
      setIsLoading(false); // Stop loading after state change
    });

    // Check initial session
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        localStorage.setItem('drivers-ledger-token', session.access_token);
        setIsAuthenticated(true);
        setUser({ id: session.user.id, email: session.user.email || '' });
      }
      setIsLoading(false); // Stop loading after initial check
    };

    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // The onAuthStateChange listener will handle setting the user and auth state
      await apiService.login(email, password);
    } catch (error) {
      console.error(error);
      setIsLoading(false); // Ensure loading stops on error
      throw error;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await apiService.signInWithGoogle();
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      throw error;
    }
  };

  const logout = () => {
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
