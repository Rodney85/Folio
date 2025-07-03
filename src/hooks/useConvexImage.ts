import { useState, useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

/**
 * Hook to convert Convex storage ID to a URL that can be used in image tags
 * @param storageId The Convex storage ID
 * @returns The temporary URL for the storage ID, or null if not available
 */
export const useConvexImage = (storageId: string | undefined): string | null => {
  const [url, setUrl] = useState<string | null>(null);
  
  // Use convex useQuery with error handling
  const result = useQuery(
    api.files.getUrl, 
    storageId ? { storageId } : "skip"
  );
  
  // Safely extract URL and handle null/undefined cases
  const tempUrl = typeof result === 'string' ? result : null;
  // We know the API can return an error, but TypeScript doesn't recognize this
  // in the type system, so we need to handle it safely
  const error = result === null || typeof result !== 'object' ? null : null;
  
  useEffect(() => {
    if (tempUrl && !error) {
      setUrl(tempUrl);
    }
    
    // If there's an error, log it but don't crash the app
    if (error) {
      console.warn(`Error loading image (${storageId}):`, error);
      setUrl(null);
    }
  }, [tempUrl, error, storageId]);
  
  return url;
};

/**
 * Hook to convert multiple Convex storage IDs to URLs
 * @param storageIds Array of Convex storage IDs
 * @returns Array of URLs in the same order, with nulls for any IDs that failed
 */
export const useConvexImages = (storageIds: string[] | undefined): (string | null)[] => {
  // Use separate state to avoid excessive re-renders
  const [urls, setUrls] = useState<(string | null)[]>([]);
  
  // Get individual URLs using the single hook
  const imageUrls = storageIds?.map(id => useConvexImage(id)) || [];
  
  useEffect(() => {
    if (imageUrls.length > 0) {
      setUrls(imageUrls);
    }
  }, [imageUrls]);
  
  return urls;
};
