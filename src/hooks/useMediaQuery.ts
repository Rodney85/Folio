import { useState, useEffect } from 'react';

/**
 * Custom hook for responsive design using media queries
 * @param query CSS media query string (e.g., "(min-width: 768px)")
 * @returns boolean indicating whether the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const media = window.matchMedia(query);
    
    // Set initial state
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // Define listener function
    const listener = () => {
      setMatches(media.matches);
    };

    // Add event listener
    media.addEventListener("change", listener);
    
    // Clean up
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};
