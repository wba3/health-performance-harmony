
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  isLoggedIn: boolean;
  user: any | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isLoggedIn: false,
  user: null,
  login: async () => ({ success: false }),
  logout: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for active session on mount
    const checkSession = async () => {
      try {
        console.log("Checking for active session...");
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error checking auth session:', error);
          setUser(null);
        } else if (data && data.session) {
          console.log("Active session found:", data.session.user.email);
          setUser(data.session.user);
        } else {
          console.log("No active session found");
          setUser(null);
        }
      } catch (error) {
        console.error('Unexpected error checking auth session:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state changed:", event);
        if (session) {
          console.log("User is now logged in:", session.user.email);
          setUser(session.user);
        } else {
          console.log("User is now logged out");
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      console.log("Attempting login for:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        toast.error("Login failed: " + error.message);
        return { success: false, error: error.message };
      }

      console.log("Login successful for:", data.user?.email);
      toast.success("Login successful!");
      setUser(data.user);
      return { success: true };
    } catch (error: any) {
      console.error("Unexpected login error:", error.message);
      toast.error("An unexpected error occurred during login");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      console.log("Attempting logout");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Logout error:", error.message);
        toast.error("Error during logout: " + error.message);
      } else {
        setUser(null);
        toast.success("You've been logged out");
        console.log("Logout successful");
      }
    } catch (error: any) {
      console.error("Unexpected logout error:", error.message);
      toast.error("Error during logout");
    } finally {
      setLoading(false);
    }
  };

  const value = {
    isLoggedIn: !!user,
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
