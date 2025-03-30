// src/components/social/types.ts - Updated to match backend expectations

import { Post, User } from "@/lib/graphql/types";

// Correctly matching the backend SocialPaginationInput
export interface SocialPaginationInput {
  first?: number;  // Default is 10 in backend
  after?: string;
  last?: number;
  before?: string;
}

export interface FeedFilterInput {
  tickers?: string[];
  hashtags?: string[];
  timeRange?: string;
  contentType?: string;
  sortBy?: string;
  includeFollowing?: boolean;
  includeUserPosts?: boolean;
}

export interface PageInfoType {
  hasNextPage: boolean;
  endCursor?: string | null;
  hasPreviousPage: boolean;
  startCursor?: string | null;
}

export interface FeedEdgeType {
  node: Post;
  cursor: string;
}

export interface FeedConnectionType {
  edges: FeedEdgeType[];
  pageInfo: PageInfoType;
  totalCount?: number;
}

export interface TrendingFeedType extends FeedConnectionType {
  trendingTags?: string[];
  trendingTickers?: string[];
}

export interface FilteredFeedType extends FeedConnectionType {
  appliedTickers?: string[];
  appliedHashtags?: string[];
  appliedTimeRange?: string;
  appliedContentType?: string;
}

export interface HashtagType {
  tag: string;
  count: number;
}

export interface TickerType {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

// Re-export User type to avoid import cycles
export type { User };