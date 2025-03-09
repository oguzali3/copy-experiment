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
  totalValue: number | string | null;
  previousDayValue?: number | string | null;
  dayChange?: number | string | null;
  dayChangePercent?: number | string | null;
  lastPriceUpdate?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  positions?: Array<any>;
};

export type FollowerData = {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  isFollowing: boolean;
};