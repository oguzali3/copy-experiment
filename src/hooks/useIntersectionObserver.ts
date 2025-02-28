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
 * Hook to observe when an element intersects the viewport
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

  const { root = null, rootMargin = '0px', threshold = 0 } = options;

  useEffect(() => {
    if (!elementRef?.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
        setEntry(entry);
      },
      { root, rootMargin, threshold }
    );

    observer.observe(elementRef.current);

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [elementRef, root, rootMargin, threshold]);

  return { isVisible, entry };
};