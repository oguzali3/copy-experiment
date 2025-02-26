// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, isAuthenticated, getAuthToken } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

// Define user type
interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
}

// JWT payload type
interface JwtPayload {
  userId: string;
  email: string;
  exp?: number;
}

// Define context type
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, avatarUrl?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Props for provider
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Extract basic user info from token
  const getUserFromToken = (token: string): User | null => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      // Check if token is expired
      if (decoded.exp && decoded.exp * 1000 < Date.now()) {
        return null;
      }
      
      return {
        id: decoded.userId,
        email: decoded.email,
      };
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const token = getAuthToken();
        
        if (token) {
          const basicUser = getUserFromToken(token);
          
          if (basicUser) {
            // In a real app, you might want to fetch additional user details here
            // For example: const fullUserDetails = await AuthService.getCurrentUser();
            setUser(basicUser);
          } else {
            // Token is invalid or expired
            AuthService.signOut();
            setUser(null);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const data = await AuthService.signInWithEmail(email, password);
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          displayName: data.user.displayName || data.user.email?.split('@')[0] || '',
          avatarUrl: data.user.avatarUrl,
          isVerified: data.user.isVerified,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email
  const signUpWithEmail = async (email: string, password: string, displayName: string, avatarUrl?: string) => {
    try {
      setIsLoading(true);
      const data = await AuthService.signUpWithEmail(email, password, displayName, avatarUrl);
      if (data?.user) {
        setUser({
          id: data.user.id,
          email: data.user.email || '',
          displayName: displayName || data.user.email?.split('@')[0] || '',
          avatarUrl,
          isVerified: data.user.isVerified,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      await AuthService.signInWithGoogle();
      // Redirect will happen automatically
    } catch (error) {
      console.error('Google sign in error:', error);
      throw error;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await AuthService.signOut();
      setUser(null);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Auth context value
  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};