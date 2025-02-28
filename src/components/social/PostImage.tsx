// src/components/social/PostImage.tsx
import React, { useState, useEffect, useRef } from 'react';
import { ImageVariants } from '@/lib/graphql/types';
import { ImageOff } from 'lucide-react';

interface PostImageProps {
  imageUrl: string;
  variants?: ImageVariants;
  alt?: string;
  onClick?: () => void;
  priority?: boolean;
}

export const PostImage: React.FC<PostImageProps> = ({ 
  imageUrl, 
  variants, 
  alt = "Post image",
  onClick,
  priority = false
}) => {
  const [loadingState, setLoadingState] = useState<'initial' | 'thumbnail' | 'main' | 'full' | 'error'>('initial');
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const imageRef = useRef<HTMLDivElement>(null);
  
  // Track animation state for smooth transitions
  const [fadeIn, setFadeIn] = useState(false);
  
  // Determine which image URLs to use
  const thumbnailSrc = variants?.thumbnail || imageUrl;
  const mediumSrc = variants?.medium || imageUrl;
  const fullSrc = variants?.optimized || variants?.original || imageUrl;
  
  // Set up intersection observer to detect when image is visible
  useEffect(() => {
    // If priority is true, skip intersection observer and load immediately
    if (priority) {
      setIsVisible(true);
      return;
    }
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          // Once we've detected visibility, we can disconnect the observer
          if (imageRef.current) {
            observer.unobserve(imageRef.current);
          }
        }
      },
      {
        rootMargin: '200px', // Start loading when image is within 200px of viewport
        threshold: 0.01
      }
    );
    
    if (imageRef.current) {
      observer.observe(imageRef.current);
    }
    
    return () => {
      if (imageRef.current) {
        observer.unobserve(imageRef.current);
      }
    };
  }, [priority]);
  
  // Start loading sequence when element becomes visible
  useEffect(() => {
    if (isVisible) {
      // Start with thumbnail
      setLoadingState('thumbnail');
      
      // Immediately attempt to load the main image
      const mainImg = new Image();
      mainImg.onload = () => {
        setLoadingState('main');
        setFadeIn(true);
      };
      mainImg.onerror = () => {
        setLoadingState('error');
      };
      mainImg.src = mediumSrc;
    }
  }, [isVisible, mediumSrc]);
  
  // Handle click events
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsViewerOpen(true);
    }
  };
  
  // Handle keyboard events for the image viewer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isViewerOpen) {
        setIsViewerOpen(false);
      }
    };
    
    if (isViewerOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
      
      // When viewer opens, start loading the full resolution image
      if (loadingState !== 'full' && fullSrc !== mediumSrc) {
        setLoadingState('full');
        const fullImg = new Image();
        fullImg.src = fullSrc;
      }
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Restore scrolling
    };
  }, [isViewerOpen, fullSrc, mediumSrc, loadingState]);
  
  // If there's an error loading the image, show error placeholder
  if (loadingState === 'error') {
    return (
      <div className="mt-3 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center" 
        style={{ aspectRatio: '16/9' }}>
        <div className="flex flex-col items-center text-gray-500 p-4">
          <ImageOff className="h-8 w-8 mb-2" />
          <p className="text-sm">Image could not be loaded</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Image container with fixed aspect ratio */}
      <div 
        ref={imageRef}
        className="mt-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 relative"
      >
        <div 
          className="relative cursor-pointer w-full"
          style={{ paddingBottom: '56.25%' }} // 16:9 aspect ratio
          onClick={handleClick}
        >
          {/* Loading skeleton */}
          {loadingState === 'initial' && (
            <div className="absolute inset-0 w-full h-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          )}
          
          {/* Blurred thumbnail while loading the main image */}
          {loadingState === 'thumbnail' && (
            <img
              src={thumbnailSrc}
              alt={alt}
              className="absolute inset-0 w-full h-full object-cover blur-sm scale-105 transform"
              loading="lazy"
            />
          )}
          
          {/* Main image */}
          {(loadingState === 'main' || loadingState === 'full') && (
            <img
              src={mediumSrc}
              alt={alt}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                fadeIn ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
            />
          )}
        </div>
      </div>
      
      {/* Full-screen image viewer */}
      {isViewerOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setIsViewerOpen(false)}
        >
          {/* Close button */}
          <button 
            className="absolute top-4 right-4 text-white p-2 rounded-full bg-black bg-opacity-50 hover:bg-opacity-70 transition-colors"
            onClick={() => setIsViewerOpen(false)}
            aria-label="Close"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          
          {/* Image container */}
          <div className="w-full h-full max-w-screen-lg max-h-screen p-4 flex items-center justify-center">
            {/* Show spinner while full image loads if needed */}
            {loadingState !== 'full' && fullSrc !== mediumSrc && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            
            {/* Show best available image */}
            <img
              src={loadingState === 'full' ? fullSrc : mediumSrc}
              alt={alt}
              className="max-w-full max-h-[90vh] object-contain"
              onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image
            />
          </div>
        </div>
      )}
    </>
  );
};