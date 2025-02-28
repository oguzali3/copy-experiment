// src/hooks/useUploadApi.ts
import { useMutation } from '@apollo/client';
import { 
  UPLOAD_IMAGE, 
  DELETE_IMAGE, 
  UPLOAD_PROFILE_PICTURE 
} from '@/lib/graphql/operations/upload';
import { toast } from 'sonner';

/**
 * Hook providing API operations for file uploads
 */
export const useUploadApi = () => {
  // Mutation hooks
  const [uploadImageMutation, { loading: uploadLoading }] = useMutation(UPLOAD_IMAGE);
  const [deleteImageMutation, { loading: deleteLoading }] = useMutation(DELETE_IMAGE);
  const [uploadProfilePictureMutation, { loading: profilePictureLoading }] = useMutation(UPLOAD_PROFILE_PICTURE);

  /**
   * Convert a File to base64 string
   */
  const fileToBase64 = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Make sure we have a valid base64 string with data URL prefix
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  };

  /**
   * Upload an image file
   */
  const uploadImage = async (file: File) => {
    try {
      // Validate file
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('Image size should be less than 5MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      console.log(`Uploading image: ${file.name}, type: ${file.type}, size: ${file.size} bytes`);
      
      // Upload via GraphQL mutation
      const { data } = await uploadImageMutation({
        variables: {
          image: {
            base64,
            filename: file.name,
            contentType: file.type
          }
        }
      });
      
      return data.uploadImage;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload image');
      throw error;
    }
  };

  /**
   * Delete an image by URL
   */
  const deleteImage = async (imageUrl: string) => {
    try {
      const { data } = await deleteImageMutation({
        variables: { imageUrl }
      });
      
      return data.deleteImage;
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
      throw error;
    }
  };

  /**
   * Upload a profile picture
   */
  const uploadProfilePicture = async (file: File) => {
    try {
      // Validate file
      if (file.size > 2 * 1024 * 1024) { // 2MB limit for profile pictures
        throw new Error('Profile picture size should be less than 2MB');
      }
      
      if (!file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
      }
      
      // Convert file to base64
      const base64 = await fileToBase64(file);
      
      // Upload via GraphQL mutation
      const { data } = await uploadProfilePictureMutation({
        variables: {
          image: {
            base64,
            filename: file.name,
            contentType: file.type
          }
        }
      });
      
      return data.uploadProfilePicture;
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload profile picture');
      throw error;
    }
  };

  return {
    uploadImage,
    deleteImage,
    uploadProfilePicture,
    loading: {
      upload: uploadLoading,
      delete: deleteLoading,
      profilePicture: profilePictureLoading
    }
  };
};