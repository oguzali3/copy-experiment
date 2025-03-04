// src/components/social/AvatarDisplay.tsx
import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AvatarVariants {
  original?: string;
  thumbnail?: string;
  medium?: string;
  optimized?: string;
}

interface AvatarDisplayProps {
  avatarUrl: string | null | undefined;
  avatarVariants?: AvatarVariants | null;
  username?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
  className?: string;
  fallbackClassName?: string;
  interactive?: boolean;
  forceRefresh?: boolean; // Add force refresh prop
}

export const AvatarDisplay: React.FC<AvatarDisplayProps> = ({
  avatarUrl,
  avatarVariants,
  username,
  size = 'md',
  onClick,
  className = '',
  fallbackClassName = '',
  interactive = false,
  forceRefresh = false,
}) => {
  const [imgError, setImgError] = useState(false);
  const [cacheBuster, setCacheBuster] = useState(() => Date.now().toString());
  
  // Reset error state and update cache buster when the avatar URL changes
  useEffect(() => {
    if (avatarUrl) {
      setImgError(false);
      if (forceRefresh) {
        setCacheBuster(Date.now().toString());
      }
    }
  }, [avatarUrl, forceRefresh]);
  
  // Size mapping
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
    xl: 'w-20 h-20',
  };

  // Fallback icon size mapping
  const iconSizeMap = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7',
    xl: 'w-10 h-10',
  };

  // Handle click with optional preventDefault for links
  const handleClick = (e: React.MouseEvent) => {
    if (interactive) e.preventDefault();
    onClick?.();
  };
  
  // Helper to add cache buster to URL
  const addCacheBuster = (url: string): string => {
    // If URL already has a t= parameter, replace it
    if (url.includes('t=')) {
      return url.replace(/[?&]t=\d+/, `$&${cacheBuster}`);
    }
    
    // Otherwise add it
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}t=${cacheBuster}`;
  };
  
  // Select the appropriate avatar variant based on size
  const getAvatarUrl = (): string | undefined => {
    if (imgError || !avatarUrl) return undefined;
    
    let selectedUrl: string;
    
    if (!avatarVariants) {
      selectedUrl = avatarUrl;
    } else {
      // Use appropriate variant based on size
      switch (size) {
        case 'xs':
        case 'sm':
          selectedUrl = avatarVariants.thumbnail || avatarVariants.original || avatarUrl;
          break;
        case 'md':
          selectedUrl = avatarVariants.medium || avatarVariants.original || avatarUrl;
          break;
        case 'lg':
        case 'xl':
          selectedUrl = avatarVariants.optimized || avatarVariants.original || avatarUrl;
          break;
        default:
          selectedUrl = avatarUrl;
      }
    }
    
    // Add cache buster to prevent stale images
    return addCacheBuster(selectedUrl);
  };
  
  // Handle image loading errors
  const handleError = () => {
    setImgError(true);
    // Optionally try a different variant on error
    if (avatarVariants?.original && getAvatarUrl() !== avatarVariants.original) {
      setImgError(false);
    }
  };

  return (
    <Avatar
      className={cn(
        sizeMap[size],
        interactive && 'cursor-pointer hover:ring-2 hover:ring-blue-200 transition-all duration-200',
        className
      )}
      onClick={onClick ? handleClick : undefined}
    >
      <AvatarImage 
        src={getAvatarUrl()} 
        alt={username || 'User avatar'} 
        onError={handleError}
        // Add key to force remount when URL changes
        key={`avatar-${avatarUrl}-${cacheBuster}`}
      />
      <AvatarFallback
        className={cn(
          'bg-gray-100 dark:bg-gray-800 text-gray-500',
          fallbackClassName
        )}
      >
        {username?.charAt(0).toUpperCase() || (
          <User className={iconSizeMap[size]} />
        )}
      </AvatarFallback>
    </Avatar>
  );
};