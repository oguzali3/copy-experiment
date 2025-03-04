// src/components/social/ProfileAvatarUploader.tsx
import React, { useState, useRef, useCallback } from 'react';
import { Camera, ZoomIn, ZoomOut, Check, X } from 'lucide-react';
import { AvatarDisplay } from './AvatarDisplay';
import { Dialog, DialogContent, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { toast } from 'sonner';
import Cropper from 'react-easy-crop';
import { Point, Area } from 'react-easy-crop';

// Helper function to create a cropped image from an image source and crop area
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  flip = { horizontal: false, vertical: false }
): Promise<{ blob: Blob, url: string }> => {
  const image = new Image();
  image.src = imageSrc;
  
  // Convert file to canvas for cropping
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) {
    throw new Error('No 2d context available');
  }

  // Wait for image to load
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  // Calculate bounding box of the rotated image
  const imageWidth = image.naturalWidth;
  const imageHeight = image.naturalHeight;
  
  // Set canvas size to match the bounding box
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  
  // Apply transformations: translate -> rotate -> flip -> crop
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);
  
  // Draw the image with the crop applied
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );
  
  // Convert canvas to Blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve({ blob, url });
    }, 'image/jpeg', 0.95);  // JPEG at 95% quality for good size/quality balance
  });
};

interface AvatarVariants {
  original?: string;
  thumbnail?: string;
  medium?: string;
  optimized?: string;
}

interface ProfileAvatarUploaderProps {
  avatarUrl: string | null;
  avatarVariants?: AvatarVariants | null;
  onAvatarUpdated: (url: string, variants?: AvatarVariants) => void;
  isOwner: boolean;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  apiUrl?: string;
}

export const ProfileAvatarUploader: React.FC<ProfileAvatarUploaderProps> = ({
  avatarUrl,
  avatarVariants,
  onAvatarUpdated,
  isOwner,
  username,
  size = 'xl',
  className,
  apiUrl = 'http://localhost:4000',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (isOwner && !isUploading) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error(`Invalid file type. Only ${validTypes.join(', ')} are allowed.`);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error(`Maximum file size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB.`);
      return;
    }

    // Read the file and open cropper
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setIsCropperOpen(true);
      // Reset crop state
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
    };
    reader.readAsDataURL(file);
    
    // Reset file input so the same file can be selected again
    event.target.value = '';
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCancelCrop = () => {
    setIsCropperOpen(false);
    setImageSrc(null);
  };

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) {
      return;
    }

    try {
      setIsUploading(true);
      setIsCropperOpen(false);

      // Create cropped image
      const { blob } = await createCroppedImage(
        imageSrc, 
        croppedAreaPixels,
        rotation
      );

      // Prepare file for upload
      const fileName = `avatar_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });

      // Upload to server
      await uploadCroppedImage(file);
      
    } catch (error) {
      console.error('Error cropping image:', error);
      toast.error('Failed to crop and upload image');
      setIsUploading(false);
    }
  };

  const uploadCroppedImage = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${apiUrl}/profiles/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        // Add cache control headers
        cache: 'no-cache',
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload avatar');
      }
  
      const data = await response.json();
      
      // Add cache busters to all URLs in the response
      const timestamp = Date.now();
      const addCacheBuster = (url: string): string => {
        try {
          const parsedUrl = new URL(url);
          parsedUrl.searchParams.set('t', timestamp.toString());
          return parsedUrl.toString();
        } catch {
          const separator = url.includes('?') ? '&' : '?';
          return `${url}${separator}t=${timestamp}`;
        }
      };
      
      // Ensure all URLs have cache busters
      const avatarUrl = data.avatarUrl ? addCacheBuster(data.avatarUrl) : data.avatarUrl;
      let variants = data.avatarVariants;
      
      if (variants) {
        const processedVariants = {};
        Object.entries(variants).forEach(([key, url]) => {
          if (url) {
            processedVariants[key] = addCacheBuster(url as string);
          }
        });
        variants = processedVariants;
      }
      
      // Call the callback with cache-busting URLs
      onAvatarUpdated(
        avatarUrl,
        variants
      );
      
      toast.success('Profile picture updated successfully');
      
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to update profile picture. Please try again.');
    } finally {
      setIsUploading(false);
      setImageSrc(null);
    }
  };

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 0.1, 1));
  };

  // Rotation controls
  const handleRotate = () => {
    setRotation(prevRotation => (prevRotation + 90) % 360);
  };

  return (
    <>
      <div className="relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
        />
        
        <div 
          className={`relative ${isOwner ? 'cursor-pointer group' : ''}`}
          onClick={handleClick}
        >
          <AvatarDisplay
          avatarUrl={avatarUrl}
          avatarVariants={avatarVariants}
          username={username}
          size={size}
          className={className}
          // Force refresh after upload
          forceRefresh={true}
          // Add key to force remount when avatar changes
          key={`avatar-uploader-${avatarUrl}-${Date.now()}`}
        />
          
          {isOwner && !isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200">
              <div className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-full h-full">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </div>
          )}
          
          {isUploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="h-8 w-8 border-4 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>
      </div>

      {/* Image Cropper Dialog */}
      <Dialog open={isCropperOpen} onOpenChange={setIsCropperOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogTitle>Crop and Adjust Your Profile Picture</DialogTitle>
          
          <div className="relative w-full h-64 mt-4 bg-gray-100 rounded-md overflow-hidden">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            )}
          </div>
          
          <div className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Zoom</span>
              <div className="flex items-center gap-2 flex-1 mx-3">
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleZoomOut}
                  disabled={zoom <= 1}
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.01}
                  className="flex-1 mx-2"
                  onValueChange={(vals) => setZoom(vals[0])}
                />
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Rotation</span>
              <Button variant="outline" onClick={handleRotate}>
                Rotate 90°
              </Button>
            </div>
          </div>
          
          <DialogFooter className="mt-4">
            <Button 
              variant="outline" 
              onClick={handleCancelCrop}
              className="w-full sm:w-auto"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleApplyCrop}
              className="w-full sm:w-auto"
            >
              <Check className="w-4 h-4 mr-2" />
              Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};