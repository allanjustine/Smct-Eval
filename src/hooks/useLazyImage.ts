/**
 * useLazyImage - Hook to lazy load images only when needed
 * Useful for GIFs in modals that should only load when visible
 */

import { useState, useEffect } from 'react';

interface UseLazyImageOptions {
  /**
   * Whether the image should be loaded (e.g., when modal is open)
   */
  shouldLoad?: boolean;
  /**
   * Delay before loading (ms) - useful for animations
   */
  delay?: number;
}

/**
 * Hook to lazy load images
 * @param src - Image source URL
 * @param options - Loading options
 * @returns Object with loading state and error state
 */
export function useLazyImage(
  src: string,
  options: UseLazyImageOptions = {}
): {
  isLoaded: boolean;
  hasError: boolean;
  load: () => void;
} {
  const { shouldLoad = true, delay = 0 } = options;
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!shouldLoad || !src) {
      setIsLoaded(false);
      setHasError(false);
      return;
    }

    let timeoutId: NodeJS.Timeout | null = null;
    const img = new Image();

    const loadImage = () => {
      img.src = src;
      img.onload = () => {
        setIsLoaded(true);
        setHasError(false);
      };
      img.onerror = () => {
        setIsLoaded(false);
        setHasError(true);
      };
    };

    if (delay > 0) {
      timeoutId = setTimeout(loadImage, delay);
    } else {
      loadImage();
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      img.onload = null;
      img.onerror = null;
    };
  }, [src, shouldLoad, delay]);

  const load = () => {
    if (!isLoaded && !hasError) {
      const img = new Image();
      img.src = src;
      img.onload = () => setIsLoaded(true);
      img.onerror = () => setHasError(true);
    }
  };

  return { isLoaded, hasError, load };
}

