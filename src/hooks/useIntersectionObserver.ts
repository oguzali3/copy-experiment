// src/hooks/useIntersectionObserver.ts
import { useState, useEffect, RefObject } from 'react';

interface IntersectionObserverOptions {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
}

interface IntersectionResult {
  isVisible: boolean;
  entry?: IntersectionObserverEntry;
}

/**
 * Hook to observe when an element intersects the viewport or a specified container
 * @param elementRef Reference to the element to observe
 * @param options IntersectionObserver options
 * @param initialValue Optional initial visibility value
 * @returns Object containing isVisible flag and intersection entry
 */
export const useIntersectionObserver = (
  elementRef: RefObject<Element>,
  options: IntersectionObserverOptions = {},
  initialValue = false
): IntersectionResult => {
  const [isVisible, setIsVisible] = useState<boolean>(initialValue);
  const [entry, setEntry] = useState<IntersectionObserverEntry>();

  useEffect(() => {
    // If element ref is empty, don't do anything
    if (!elementRef?.current) return;

    // Try to get the custom scroll container if available
    let root = options.root;
    try {
      // @ts-expect-error - Custom property may exist on window
      const customContainer = window.feedScrollContainer;
      if (customContainer && !options.root) {
        root = customContainer;
      }
    } catch (e) {
      // If there's an error, use the default root
      console.warn('Error accessing custom scroll container:', e);
    }

    const observerOptions = {
      rootMargin: options.rootMargin || '0px',
      threshold: options.threshold || 0,
      root
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) {
          setIsVisible(entry.isIntersecting);
          setEntry(entry);
        }
      },
      observerOptions
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
      observer.disconnect();
    };
  }, [elementRef, options.rootMargin, options.threshold, options.root]);

  return { isVisible, entry };
};