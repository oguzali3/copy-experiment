// src/lib/graphql/operations/upload.ts
import { gql } from '@apollo/client';

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

export const DELETE_IMAGE = gql`
  mutation DeleteImage($imageUrl: String!) {
    deleteImage(imageUrl: $imageUrl)
  }
`;

export const UPLOAD_PROFILE_PICTURE = gql`
  mutation UploadProfilePicture($image: ImageUploadInput!) {
    uploadProfilePicture(image: $image) {
      url
      userId
    }
  }
`;
