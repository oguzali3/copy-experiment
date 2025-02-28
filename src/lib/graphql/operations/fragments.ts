// src/lib/graphql/operations/fragments.ts
import { gql } from '@apollo/client';

export const USER_FRAGMENT = gql`
  fragment UserFragment on UserType {
    id
    displayName
    avatarUrl
    isVerified
    isFollowing
  }
`;

export const POST_FRAGMENT = gql`
  fragment PostFragment on PostType {
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
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on CommentType {
    id
    content
    createdAt
    likesCount
    isLikedByMe
    author {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;