/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/profile/api/profileAPI.ts

import { FollowerData, PortfolioData, ProfileData } from "@/components/profile/types";

// Define API base URL
const API_URL = 'http://localhost:4000';

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
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  },

  async getProfile(userId: string): Promise<ProfileData> {
    return this.fetchWithAuth(`profiles/${userId}`);
  },

  async updateProfile(data: Partial<ProfileData>): Promise<ProfileData> {
    return this.fetchWithAuth('profiles', {
      method: 'PUT',
      body: JSON.stringify({
        displayName: data.displayName,
        bio: data.bio,
        website: data.website,
        twitterHandle: data.twitterHandle,
        linkedinHandle: data.linkedinHandle
      })
    });
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
      throw new Error('Failed to upload avatar');
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