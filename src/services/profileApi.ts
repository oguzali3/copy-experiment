/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/profile/api/profileAPI.ts

import { FollowerData, PortfolioData, ProfileData } from "@/components/profile/types";

// Define API base URL
const API_URL = 'http://localhost:4000';

// Custom error class to preserve API error responses
export class APIError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data: any) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export const profileAPI = {
  async fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
      'Authorization': `Bearer ${token}`
    };

    const response = await fetch(`${API_URL}/${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'API request failed' };
      }
      
      throw new APIError(
        errorData.message || 'API request failed',
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async getProfile(userId: string): Promise<ProfileData> {
    return this.fetchWithAuth(`profiles/${userId}`);
  },

  async updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
    try {
      return await this.fetchWithAuth('profiles', {
        method: 'PUT',
        body: JSON.stringify({
          displayName: data.displayName,
          bio: data.bio,
          website: data.website,
          twitterHandle: data.twitterHandle,
          linkedinHandle: data.linkedinHandle
        })
      });
    } catch (error) {
      // Rethrow APIError with more specific messages for common profile update issues
      if (error instanceof APIError) {
        if (error.status === 400) {
          // Try to detect specific validation errors
          const errorMessage = error.data?.message?.toLowerCase() || '';
          
          if (errorMessage.includes('taken') || errorMessage.includes('already exists') || errorMessage.includes('unique')) {
            throw new APIError('This username is already taken. Please choose another one.', 400, error.data);
          }
          
          if (errorMessage.includes('format') || errorMessage.includes('pattern')) {
            throw new APIError('Username format is invalid. Only letters, numbers, and underscores are allowed.', 400, error.data);
          }
        }
      }
      
      // If not a specific case, rethrow the original error
      throw error;
    }
  },

  async followUser(userId: string) {
    return this.fetchWithAuth(`profiles/follow/${userId}`, {
      method: 'POST'
    });
  },

  async unfollowUser(userId: string) {
    return this.fetchWithAuth(`profiles/unfollow/${userId}`, {
      method: 'POST'
    });
  },

  async getFollowers(userId: string): Promise<FollowerData[]> {
    return this.fetchWithAuth(`profiles/${userId}/followers`);
  },

  async getFollowing(userId: string): Promise<FollowerData[]> {
    return this.fetchWithAuth(`profiles/${userId}/following`);
  },

  async getUserPortfolios(userId: string): Promise<PortfolioData[]> {
    return this.fetchWithAuth(`portfolios/user/${userId}`);
  },

  async uploadAvatar(file: File) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${API_URL}/profiles/avatar`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { message: 'Failed to upload avatar' };
      }
      
      throw new APIError(
        errorData.message || 'Failed to upload avatar',
        response.status,
        errorData
      );
    }

    return response.json();
  },

  async toggleProfilePrivacy() {
    return this.fetchWithAuth('profiles/privacy', {
      method: 'POST'
    });
  },

  async updatePreferences(preferences: any) {
    return this.fetchWithAuth('profiles/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences)
    });
  },

  async searchProfiles(query: string, limit: number = 10) {
    return this.fetchWithAuth(`profiles/search?query=${encodeURIComponent(query)}&limit=${limit}`);
  }
};