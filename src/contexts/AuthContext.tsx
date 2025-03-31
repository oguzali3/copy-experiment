// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService, isAuthenticated, getAuthToken } from '@/services/auth.service';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { gql, useQuery } from '@apollo/client';

export const GET_SSO_USER_PROFILE = gql`
  query GetSsoUserProfile {
    getSsoUserProfile {
      id
      displayName
      avatarUrl
      email
      isVerified
      followersCount
      followingCount
      bio
      avatarVariants {
        original
        thumbnail
        medium
        optimized
      }
    }
  }
`;
// Define user type
interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  isVerified?: boolean;
  followersCount?: number;
  followingCount?: number;
  bio?: string;
  avatarVariants?: {
    original?: string;
    thumbnail?: string;
    medium?: string;
    optimized?: string;
  };
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
  refreshUserProfile: () => Promise<void>; // New method to refresh user profile
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
  const [token, setToken] = useState<string | null>(getAuthToken());
  const [basicUserInfo, setBasicUserInfo] = useState<User | null>(null);
  
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

  // Set basic user info from token
  useEffect(() => {
    if (token) {
      const basicUser = getUserFromToken(token);
      setBasicUserInfo(basicUser);
    } else {
      setBasicUserInfo(null);
    }
  }, [token]);


  const { data: ssoProfileData, loading: ssoProfileLoading, error: ssoProfileError, refetch: refetchSsoProfile } =
    useQuery(GET_SSO_USER_PROFILE, {
      skip: !basicUserInfo?.id,
      fetchPolicy: 'network-only',
      onCompleted: (data) => {
        if (data?.getSsoUserProfile) {
          const fullUser = {
            ...basicUserInfo,
            ...data.getSsoUserProfile
          };
          console.log("SSO user profile fetched successfully:", fullUser);
          setUser(fullUser);
          setIsLoading(false);
        }
      }
    });

  // Handle profile fetch errors by falling back to basic user info
  useEffect(() => {
    if (!ssoProfileLoading && ssoProfileError && basicUserInfo) {
      console.error("Failed to fetch user profile:", ssoProfileError);
      setUser(basicUserInfo);
      setIsLoading(false);
    }
  }, [ssoProfileLoading, ssoProfileError, basicUserInfo]);

  // Method to refresh user profile
  const refreshUserProfile = async () => {
    if (basicUserInfo?.id) {
      try {
        setIsLoading(true);
        await refetchSsoProfile();
      } catch (error) {
        console.error('Error refreshing user profile:', error);
        // Fall back to basic info
        setUser(basicUserInfo);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        const currentToken = getAuthToken();
        
        if (currentToken) {
          const basicUser = getUserFromToken(currentToken);
          
          if (basicUser) {
            setToken(currentToken);
            setBasicUserInfo(basicUser);
            // Full profile will be loaded by the GraphQL queries
          } else {
            // Token is invalid or expired
            await AuthService.signOut();
            setUser(null);
            setToken(null);
            setBasicUserInfo(null);
            setIsLoading(false);
          }
        } else {
          setUser(null);
          setToken(null);
          setBasicUserInfo(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
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
        // Store full user data immediately if available from sign-in response
        setUser(data.user);
        setToken(data.token);
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
        // Store full user data immediately if available from sign-up response
        setUser(data.user);
        setToken(data.token);
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
      setToken(null);
      setBasicUserInfo(null);
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
    refreshUserProfile,
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