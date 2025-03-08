export type ProfileData = {
  id: string;
  displayName: string; // Now represents the username
  bio: string;
  website: string;
  twitterHandle: string;
  linkedinHandle: string;
  avatarUrl: string | null;
  avatarVariants?: {
    original?: string;
    thumbnail?: string;
    medium?: string;
    optimized?: string;
  } | null;
  followerCount: number;
  followingCount: number;
  isPrivate: boolean;
};

export type PortfolioData = {
  id: string;
  name: string;
  yearlyPerformance: number | null;
  totalValue: number | null;
};

export type FollowerData = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
};