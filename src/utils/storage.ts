/**
 * Storage utility for handling image uploads
 * Currently using Convex storage, but designed for easy migration to Backblaze in the future
 */

import { api } from "../../convex/_generated/api";
import { useMutation } from "convex/react";

// Interface for uploaded file metadata
export interface UploadedFile {
  url: string;
  id: string;
  contentType: string;
}

/**
 * Storage provider type - currently only Convex, but will add Backblaze
 */
export type StorageProvider = "convex" | "backblaze";

/**
 * Current storage provider - change this when migrating to Backblaze
 */
export const CURRENT_STORAGE: StorageProvider = "convex";

/**
 * Upload a file to the current storage provider
 * This abstraction makes it easy to switch between Convex and Backblaze
 * 
 * @param file The file to upload
 * @returns The uploaded file metadata including URL
 */
export const uploadFile = async (file: File): Promise<UploadedFile> => {
  if (CURRENT_STORAGE === "convex") {
    return uploadToConvex(file);
  } else {
    return uploadToBackblaze(file);
  }
};

/**
 * Upload a file to Convex storage
 * 
 * @param file The file to upload
 * @returns The uploaded file metadata
 */
const uploadToConvex = async (file: File): Promise<UploadedFile> => {
  // Import this dynamically to avoid circular dependencies
  const { default: { useMutation } } = await import("convex/react");
  
  // Get the upload URL from Convex
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  const uploadUrl = await generateUploadUrl({
    contentType: file.type
  });
  
  if (!uploadUrl) {
    throw new Error("Failed to generate upload URL");
  }
  
  // Upload the file to Convex storage
  await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file
  });
  
  // Get the stored URL (without query parameters)
  const storedUrl = uploadUrl.toString().split("?")[0];
  const id = storedUrl.split("/").pop() || "";
  
  return {
    url: storedUrl,
    id,
    contentType: file.type
  };
};

/**
 * Upload a file to Backblaze storage (to be implemented)
 * This is a placeholder for future implementation
 * 
 * @param file The file to upload
 * @returns The uploaded file metadata
 */
const uploadToBackblaze = async (file: File): Promise<UploadedFile> => {
  // This will be implemented when we migrate to Backblaze
  // For now, throw an error if someone tries to use it
  throw new Error("Backblaze storage not yet implemented");
};

/**
 * Hook to get the uploadFile function for use in components
 * Returns a function to upload a file to the current storage provider
 */
export const useFileUpload = () => {
  const generateUploadUrl = useMutation(api.files.generateUploadUrl);
  
  return async (file: File): Promise<UploadedFile> => {
    if (CURRENT_STORAGE === "convex") {
      // Upload to Convex
      const uploadUrl = await generateUploadUrl({
        contentType: file.type
      });
      
      if (!uploadUrl) {
        throw new Error("Failed to generate upload URL");
      }
      
      await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file
      });
      
      const storedUrl = uploadUrl.toString().split("?")[0];
      const id = storedUrl.split("/").pop() || "";
      
      return {
        url: storedUrl,
        id,
        contentType: file.type
      };
    } else {
      // Will be implemented for Backblaze in the future
      throw new Error("Backblaze storage not yet implemented");
    }
  };
};

/**
 * Helper function to convert File objects to UploadedFile objects
 * Uses the current storage provider
 * 
 * @param files Array of File objects
 * @returns Array of UploadedFile objects
 */
export const uploadFiles = async (files: File[]): Promise<UploadedFile[]> => {
  const uploadPromises = files.map(file => uploadFile(file));
  return Promise.all(uploadPromises);
};
