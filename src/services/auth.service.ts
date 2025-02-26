// src/services/auth.service.ts
import apolloClient from "@/integrations/apollo/apolloClient";
import { gql } from "@apollo/client";

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

// Auth token handling
const TOKEN_KEY = 'auth_token';

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
  apolloClient.resetStore();
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
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
    // You may want to fetch user details here if needed
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

  // Get current user (could be extended with a GraphQL query for full user details)
  async getCurrentUser() {
    // In a real implementation, you would fetch the user profile from the backend
    // For now, this is a placeholder
    if (!isAuthenticated()) {
      return null;
    }
    
    // This would be a GraphQL query to your backend
    // For now, just return a dummy user
    return {
      id: '1',
      email: 'user@example.com',
      displayName: 'User',
    };
  }
};