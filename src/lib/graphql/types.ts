// src/lib/graphql/types.ts

// Input types
export interface SocialPaginationInput {
    first: number;
    after?: string | null;
  }
  
  export interface UpdatePostInput {
    content?: string;
  }
  
  export interface CreateCommentInput {
    content: string;
    postId: string;
  }
  
  export interface UpdateCommentInput {
    content: string;
  }
  
  // Response types
  export interface User {
    id: string;
    displayName: string;
    bio?: string;
    avatarUrl?: string;
    isVerified: boolean;
    isFollowing?: boolean;
    followersCount?: number;
    followingCount?: number;
    createdAt: string;
    preferences?: {
      showPortfolio: boolean;
      showWatchlist: boolean;
      allowComments: boolean;
      emailNotifications: boolean;
      pushNotifications: boolean;
    };
  }
  
  // Add this to your types file where Post is defined, typically in src/lib/graphql/types.ts

  export interface ImageVariants {
    original: string;
    thumbnail: string;
    medium: string;
    optimized: string;
  }
  export interface CreatePostInput {
    content: string;
    imageUrl?: string | null;
    imageVariants?: ImageVariants | null;
  }
  
  // Update your Post interface to include imageVariants
  export interface Post {
    id: string;
    content: string;
    createdAt: string;
    updatedAt?: string;
    imageUrl?: string;
    imageVariants?: ImageVariants; // Add this line
    likesCount: number;
    commentsCount: number;
    isLikedByMe: boolean;
    author: {
      id: string;
      displayName: string;
      avatarUrl?: string;
    };
    comments?: Comment[];
  }
  
  export interface Comment {
    id: string;
    content: string;
    createdAt: string;
    likesCount: number;
    isLikedByMe: boolean;
    author: {
      id: string;
      displayName: string;
      avatarUrl?: string;
    };
  }
  
  export interface PageInfo {
    endCursor: string;
    hasNextPage: boolean;
  }
  
  export interface UserConnection {
    users: User[];
    pageInfo: PageInfo;
  }
  
  export interface PostConnection {
    posts: Post[];
    pageInfo: PageInfo;
  }
  
  export interface CommentConnection {
    comments: Comment[];
    pageInfo: PageInfo;
  }