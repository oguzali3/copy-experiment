// src/lib/graphql/operations/mutations.ts
import { gql } from '@apollo/client';

export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
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

export const UPDATE_POST = gql`
  mutation UpdatePost($id: String!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      id
      content
      createdAt
      imageUrl
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($id: String!) {
    likePost(id: $id) {
      id
      likesCount
      isLikedByMe
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($id: String!) {
    unlikePost(id: $id) {
      id
      likesCount
      isLikedByMe
    }
  }
`;

// Comment mutations
export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      createdAt
      author {
        id
        displayName
        avatarUrl
      }
    }
  }
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($id: String!, $input: UpdateCommentInput!) {
    updateComment(id: $id, input: $input) {
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

export const DELETE_COMMENT = gql`
  mutation DeleteComment($id: String!) {
    deleteComment(id: $id)
  }
`;

export const LIKE_COMMENT = gql`
  mutation LikeComment($id: String!) {
    likeComment(id: $id) {
      id
      likesCount
      isLikedByMe
    }
  }
`;

export const UNLIKE_COMMENT = gql`
  mutation UnlikeComment($id: String!) {
    unlikeComment(id: $id) {
      id
      likesCount
      isLikedByMe
    }
  }
`;

// Follow mutations
export const FOLLOW_USER = gql`
  mutation FollowUser($userId: String!) {
    followUser(userId: $userId)
  }
`;

export const UNFOLLOW_USER = gql`
  mutation UnfollowUser($userId: String!) {
    unfollowUser(userId: $userId)
  }
`;

// Update your UPLOAD_IMAGE mutation
export const UPLOAD_IMAGE = gql`
  mutation UploadImage($image: ImageUploadInput!) {
    uploadImage(image: $image) {
      url
      variants {
        original
        thumbnail
        medium
        optimized
      }
      width
      height
      fileSize
      mimeType
    }
  }
`;