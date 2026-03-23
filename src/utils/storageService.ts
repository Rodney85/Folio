import { api } from "../../convex/_generated/api";

/**
 * Get the MIME type of a file, falling back to extension detection if file.type is empty.
 */
function getMimeType(file: File): string {
  if (file.type && file.type !== '') return file.type;

  // Fallback: guess from file extension
  const ext = file.name.split('.').pop()?.toLowerCase();
  const extMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    heic: 'image/heic',
    heif: 'image/heif',
  };
  return extMap[ext ?? ''] ?? 'image/jpeg';
}

/**
 * Upload a file to Backblaze B2 via Convex
 * @param file The file to upload
 * @param fileName Desired file name (can include path)
 * @param convex The Convex client for API calls (can be obtained from useConvex())
 * @returns URL to the uploaded file
 */
export async function uploadToBackblaze(file: File, fileName: string, convex: any): Promise<string> {
  try {
    // Step 1: Upload file to Convex temporary storage
    const storageId = await uploadToConvexStorage(file, convex);
    if (!storageId) {
      throw new Error('Failed to upload file to temporary storage');
    }
    // Step 2: Transfer the file from Convex storage to Backblaze
    const result = await (convex as any).action("files:uploadFileToBackblaze", {
      storageId,
      fileName,
      contentType: getMimeType(file),
    }) as { success: boolean; fileUrl: string; fileName: string; fileId: string };
    
    if (!result || !result.success || !result.fileUrl) {
      throw new Error('Failed to transfer file to Backblaze');
    }
    
    // Step 3: Return the public URL for the file
    return result.fileUrl;
  } catch (error) {
    console.error('Error uploading to Backblaze:', error);
    throw new Error(`Failed to upload file: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Upload a file to Convex temporary storage
 * @param file The file to upload
 * @param convex The Convex client for API calls
 * @returns Storage ID of the uploaded file
 */
async function uploadToConvexStorage(file: File, convex: any): Promise<string | null> {
  try {
    // Get an upload URL from Convex (use derived MIME type as fallback)
    const mimeType = getMimeType(file);
    // Step 1: Execute mutation securely (returns string | null)
    const postUrl = await (convex as any).mutation("files:generateUploadUrl", {
      contentType: mimeType,
    }) as string | null;
    
    // Upload the file to Convex storage
    const result = await fetch(postUrl, {
      method: 'POST',
      headers: {
        'Content-Type': mimeType,
      },
      body: file,
    });
    
    if (!result.ok) {
      throw new Error(`Failed to upload to Convex storage: ${result.status} ${result.statusText}`);
    }
    
    // Extract the storage ID from the result
    const { storageId } = await result.json();
    return storageId;
  } catch (error) {
    console.error('Error uploading to Convex storage:', error);
    throw new Error(`Failed to upload to Convex storage: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Get the URL for a file stored in Backblaze
 * @param fileName The file name/path in Backblaze
 * @param bucketName Optional bucket name, can be provided by component
 * @returns Full URL to the file
 */
export function getBackblazeUrl(fileName: string, bucketName?: string): string {
  // If it's already a full URL, return it
  if (fileName.startsWith('http')) {
    return fileName;
  }
  
  if (!bucketName) {
    // Return the filename as-is if no bucket name is provided
    // This is likely a pre-signed URL case where we already have the full URL
    return fileName;
  }
  
  // Default to the standard public URL format
  return `https://f002.backblazeb2.com/file/${bucketName}/${fileName}`;
}

/**
 * Check if a string is a Backblaze URL
 * @param url The URL to check
 * @param bucketName Optional bucket name for additional check
 * @returns True if the URL is a Backblaze URL
 */
export function isBackblazeUrl(url: string, bucketName?: string): boolean {
  // Some simple checks to identify if this is likely a URL
  return url && typeof url === 'string' && (
    url.startsWith('http') && 
    (url.includes('backblazeb2.com') || url.includes('/file/') || 
     (bucketName && url.includes(bucketName)))
  );
}
