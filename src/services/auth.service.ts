// src/services/auth.service.ts
import { apolloClient } from "@/lib/graphql/client";
import { gql } from "@apollo/client";
import { jwtDecode } from "jwt-decode";

// GraphQL Mutations
const SIGN_IN_MUTATION = gql`
  mutation SignIn($input: SignInInputType!) {
    signIn(input: $input) {
      token
      user {
        id
        email
        displayName
        avatarUrl
        isVerified
      }
    }
  }
`;

const SIGN_UP_MUTATION = gql`
  mutation SignUp($input: SignUpInputType!) {
    signUp(input: $input) {
      token
      user {
        id
        email
        displayName
        avatarUrl
        isVerified
      }
    }
  }
`;

const SSO_VERIFY_MUTATION = gql`
  mutation SsoVerify($input: SsoVerifyInput!) {
    ssoVerify(input: $input) {
      token
      user {
        id
        email
        displayName
        avatarUrl
        isVerified
      }
    }
  }
`;

// Add a query to get the current user
const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      displayName
      avatarUrl
      isVerified
    }
  }
`;

// Auth token handling
const TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

export const setAuthToken = (token: string) => {
  localStorage.setItem(TOKEN_KEY, token);
  // Update Apollo client with the new token
  apolloClient.resetStore();
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearAuthToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_DATA_KEY);
  apolloClient.resetStore();
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const parseToken = (token: string): any => {
  try {
    return jwtDecode(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};


// Store user data in localStorage to avoid unnecessary API calls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setUserData = (user: any) => {
  localStorage.setItem(USER_DATA_KEY, JSON.stringify(user));
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getUserData = (): any | null => {
  const userData = localStorage.getItem(USER_DATA_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Auth service methods
export const AuthService = {
  // Email sign in
  async signInWithEmail(email: string, password: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SIGN_IN_MUTATION,
        variables: {
          input: { email, password }
        }
      });
      
      if (data?.signIn?.token) {
        setAuthToken(data.signIn.token);
        setUserData(data.signIn.user);
        return {
          user: data.signIn.user,
          token: data.signIn.token
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  },

  // Email sign up
  async signUpWithEmail(email: string, password: string, displayName: string, avatarUrl?: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SIGN_UP_MUTATION,
        variables: {
          input: { email, password, displayName, avatarUrl }
        }
      });
      
      if (data?.signUp?.token) {
        setAuthToken(data.signUp.token);
        setUserData(data.signUp.user);
        return {
          user: data.signUp.user,
          token: data.signUp.token
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  },

  // Google sign in
  async signInWithGoogle() {
    // Redirect to backend OAuth endpoint
    window.location.href = "http://localhost:4000/auth/sso/google/callback";
  },

  // Handle SSO callback from NestJS backend
  async handleSsoCallback(token: string) {
    setAuthToken(token);
    // Fetch user details
    await this.getCurrentUser(true);
  },

  // Verify SSO token (client-side verification with Google token)
  async verifySsoToken(provider: string, token: string, email: string, name?: string, avatarUrl?: string) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: SSO_VERIFY_MUTATION,
        variables: {
          input: { provider, token, email, name, avatarUrl }
        }
      });
      
      if (data?.ssoVerify?.token) {
        setAuthToken(data.ssoVerify.token);
        setUserData(data.ssoVerify.user);
        return {
          user: data.ssoVerify.user,
          token: data.ssoVerify.token
        };
      }
      
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('SSO verification error:', error);
      throw error;
    }
  },

  // Sign out
  async signOut() {
    clearAuthToken();
  },

  async getCurrentUser(forceRefresh = false) {
    if (!isAuthenticated()) {
      return null;
    }
    
    // Return cached user data if available and not forcing refresh
    const cachedUser = getUserData();
    if (cachedUser && !forceRefresh) {
      return cachedUser;
    }
    
    try {
      // Parse the token to get user data instead of using GraphQL
      const token = getAuthToken();
      if (token) {
        const decoded = parseToken(token);
        if (decoded) {
          // Extract user data from the token
          const userData = {
            id: decoded.sub || decoded.userId || decoded.id,
            email: decoded.email,
            displayName: decoded.name || decoded.displayName || decoded.email,
          };
          
          // Cache the user data
          setUserData(userData);
          return userData;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      // If there's an error (like an expired token), clear the auth token
      if (error.message.includes('Unauthorized')) {
        clearAuthToken();
      }
      return null;
    }
  }
};