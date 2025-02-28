// src/hooks/useImagePreloader.ts
import { useEffect, useState } from 'react';

interface ImageVariants {
  original: string;
  thumbnail: string;
  medium: string;
  optimized: string;
}

interface PostWithImages {
  id: string;
  imageUrl?: string;
  imageVariants?: ImageVariants;
}

export function useImagePreloader(posts: PostWithImages[], preloadCount: number = 3) {
  const [preloadedImages, setPreloadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!posts || posts.length === 0) return;
    
    // Find posts with images that haven't been preloaded yet
    const imagesToPreload = posts
      .filter(post => post.imageUrl && !preloadedImages.has(post.imageUrl))
      .slice(0, preloadCount)
      .map(post => {
        // Prefer thumbnail and medium variants for preloading
        if (post.imageVariants) {
          return [post.imageVariants.thumbnail, post.imageVariants.medium];
        }
        return [post.imageUrl as string];
      })
      .flat()
      .filter(url => !preloadedImages.has(url));
    
    if (imagesToPreload.length === 0) return;
    
    // Create image objects to trigger browser preloading
    const imageObjects = imagesToPreload.map(url => {
      const img = new Image();
      img.src = url;
      return url;
    });
    
    // Update preloaded images set
    setPreloadedImages(prev => {
      const newSet = new Set(prev);
      imageObjects.forEach(url => newSet.add(url));
      return newSet;
    });
  }, [posts, preloadedImages, preloadCount]);
  
  return preloadedImages;
}