// src/lib/graphql/operations/queries.ts
import { gql } from '@apollo/client';

export const GET_FEED = gql`
  query GetFeed($pagination: SocialPaginationInput!) {
    feed(pagination: $pagination) {
      id
      content
      author {
        id
        displayName
        avatarUrl
      }
      imageUrl
      imageVariants {
        original
        thumbnail
        medium
        optimized
      }
      comments(pagination: { first: 5 }) {
        id
        content
      }
      likesCount
      isLikedByMe
      commentsCount
      createdAt
    }
  }
`;


export const GET_POST = gql`
  query GetPost($id: String!) {
    post(id: $id) {
      id
      content
      createdAt
      imageUrl
      imageVariants {
        original
        thumbnail
        medium
        optimized
      }
      likesCount
      commentsCount
      isLikedByMe
      author {
        id
        displayName
        avatarUrl
      }
    }
  }
`;

// Comment queries
export const GET_POST_COMMENTS = gql`
  query GetPostComments($postId: String!, $pagination: SocialPaginationInput!) {
    postComments(postId: $postId, pagination: $pagination) {
      id
      content
      createdAt
      likesCount
      isLikedByMe
      author {
        id
        displayName
        avatarUrl
      }
    }
  }
`;

// User & follow queries
export const GET_USER_PROFILE = gql`
  query GetUserProfile($id: String!) {
    user(id: $id) {
      id
      displayName
      bio
      avatarUrl
      isVerified
      followersCount
      followingCount
      isFollowing
      createdAt
      preferences {
        showPortfolio
        showWatchlist
        allowComments
      }
    }
  }
`;

export const GET_FOLLOWERS = gql`
  query GetFollowers($userId: String!, $pagination: SocialPaginationInput!) {
    getFollowers(userId: $userId, pagination: $pagination) {
      users {
        id
        displayName
        avatarUrl
        isVerified
        isFollowing
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const GET_FOLLOWING = gql`
  query GetFollowing($userId: String!, $pagination: SocialPaginationInput!) {
    getFollowing(userId: $userId, pagination: $pagination) {
      users {
        id
        displayName
        avatarUrl
        isVerified
        isFollowing
      }
      pageInfo {
        endCursor
        hasNextPage
      }
    }
  }
`;

export const GET_SUGGESTED_USERS = gql`
  query GetSuggestedUsers($limit: Float) {
    getSuggestedUsers(limit: $limit) {
      id
      displayName
      avatarUrl
      isVerified
      isFollowing
    }
  }
`;
// Add these to your src/lib/graphql/operations/queries.ts file

export const GET_USER_ACTIVITY = gql`
  query GetUserActivity($pagination: SocialPaginationInput!) {
    userActivity(pagination: $pagination) {
      id
      content
      createdAt
      imageUrl
      likesCount
      commentsCount
      isLikedByMe
      author {
        id
        displayName
        avatarUrl
      }
      comments(pagination: { first: 15 }) {
        id
        content
        createdAt
        likesCount
        isLikedByMe
        author {
          id
          displayName
          avatarUrl
        }
      }
    }
  }
`;

// Update your GET_POST query to include more comments
export const GET_POST_WITH_COMMENTS = gql`
  query GetPostWithComments($id: String!, $commentsPagination: SocialPaginationInput) {
    post(id: $id) {
      id
      content
      createdAt
      imageUrl
      likesCount
      commentsCount
      isLikedByMe
      author {
        id
        displayName
        avatarUrl
      }
      comments(pagination: $commentsPagination) {
        id
        content
        createdAt
        likesCount
        isLikedByMe
        author {
          id
          displayName
          avatarUrl
        }
      }
    }
  }
`;