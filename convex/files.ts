import { v } from "convex/values";
import { mutation, query, action } from "./_generated/server";
import { ConvexError } from "convex/values";
import { Id } from "./_generated/dataModel";
import { getUser } from "./auth";
import { isValidFileType } from "./lib/sanitize";
import { checkRateLimit } from "./lib/rateLimit";

// Allowed image types for uploads
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

// Generate a URL for file upload to Convex storage
export const generateUploadUrl = mutation({
  args: {
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    // Ensure user is authenticated
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Authentication required for file uploads");
    }

    // Rate limit file uploads
    checkRateLimit("uploadFile", identity.subject);

    // Validate content type
    if (!isValidFileType(args.contentType, ALLOWED_IMAGE_TYPES)) {
      throw new ConvexError(
        `Invalid file type: ${args.contentType}. Allowed types: JPEG, PNG, WebP, GIF`
      );
    }

    return await ctx.storage.generateUploadUrl();
  },
});


// Get a temporary URL for viewing a stored file
export const getUrl = query({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      return await ctx.storage.getUrl(args.storageId);
    } catch (error) {
      // Instead of throwing an error that breaks the UI, return null
      // This allows the frontend to gracefully handle missing images
      console.warn(`Storage ID not found: ${args.storageId}`);
      return null;
    }
  },
});

// Delete a file from Convex storage
export const deleteFile = mutation({
  args: {
    storageId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      await ctx.storage.delete(args.storageId);
      return { success: true };
    } catch (error) {
      throw new ConvexError("Failed to delete file");
    }
  },
});

// Upload file to Backblaze B2 via Convex
export const uploadFileToBackblaze = action({
  args: {
    storageId: v.string(), // Convex storage ID of the temporarily uploaded file
    fileName: v.string(),  // Desired filename in Backblaze
    contentType: v.string(), // MIME type of the file
  },
  handler: async (ctx, args) => {
    // Get environment variables
    const BACKBLAZE_KEY_ID = process.env.BACKBLAZE_KEY_ID;
    const BACKBLAZE_APP_KEY = process.env.BACKBLAZE_APP_KEY;
    const BACKBLAZE_BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME;
    const BACKBLAZE_BUCKET_ID = process.env.BACKBLAZE_BUCKET_ID;
    const BACKBLAZE_S3_ENDPOINT = process.env.BACKBLAZE_S3_ENDPOINT || "https://s3.us-west-004.backblazeb2.com";

    // For debugging with master key, use environment variables only
    // You can set both MASTER_KEY_ID and MASTER_APP_KEY in your Convex environment
    // Run: npx convex env set MASTER_KEY_ID "your-master-key-id"
    // Run: npx convex env set MASTER_APP_KEY "your-master-app-key"
    // Never hard-code sensitive credentials

    // Use the standard Backblaze API URL for authentication
    // Regional endpoints are only used for S3-compatible API, not the native B2 API
    const BACKBLAZE_API_URL = "https://api.backblazeb2.com";

    if (!BACKBLAZE_KEY_ID || !BACKBLAZE_APP_KEY || !BACKBLAZE_BUCKET_NAME || !BACKBLAZE_BUCKET_ID) {
      throw new Error("Missing Backblaze configuration");
    }

    try {
      // Get current user for security
      const user = await getUser(ctx);

      // Get the file from Convex storage
      const fileData = await ctx.storage.get(args.storageId);
      if (!fileData) {
        throw new Error(`File with ID ${args.storageId} not found in storage`);
      }

      // Generate a unique filename with timestamp and user ID for security
      const timestamp = Date.now();
      const uniqueFileName = `cars/${user.id}/${timestamp}_${args.fileName.replace(/\s+/g, '-')}`;

      // Helper function for base64 encoding that works in Convex (no Buffer dependency)
      function base64Encode(str: string): string {
        // This function works in browsers and Convex environments
        // It uses the built-in btoa function but handles Unicode characters properly
        const bytes: number[] = [];
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          if (char < 128) {
            bytes.push(char);
          } else {
            // Handle Unicode characters by using UTF-8 encoding
            if (char < 2048) {
              bytes.push(192 | (char >> 6), 128 | (char & 63));
            } else if (char < 55296 || char >= 57344) {
              bytes.push(224 | (char >> 12), 128 | ((char >> 6) & 63), 128 | (char & 63));
            } else {
              // Handle surrogate pairs
              i++;
              const c = 65536 + ((char & 1023) << 10) + (str.charCodeAt(i) & 1023);
              bytes.push(
                240 | (c >> 18),
                128 | ((c >> 12) & 63),
                128 | ((c >> 6) & 63),
                128 | (c & 63)
              );
            }
          }
        }

        // Convert bytes to string and then use btoa
        // Use apply to avoid TypeScript spread operator type errors
        const byteString = String.fromCharCode.apply(null, bytes);
        return btoa(byteString);
      }

      // Step 1: Try to authenticate with Backblaze B2 using multiple methods
      // First try the application key, then try master key if that fails



      // This is a helper function that will try to authenticate with a given keyId and key
      async function tryAuthenticate(keyId: string, appKey: string): Promise<any> {
        try {
          const authString = `${keyId}:${appKey}`;
          const encoded = base64Encode(authString);

          const response = await fetch(`${BACKBLAZE_API_URL}/b2api/v2/b2_authorize_account`, {
            method: 'GET',
            headers: {
              'Authorization': `Basic ${encoded}`
            }
          });

          if (!response.ok) {
            return null;
          }

          return await response.json();
        } catch (error) {
          console.error(`Authentication error:`, error);
          return null;
        }
      }

      // Authenticate with application key
      const authData = await tryAuthenticate(BACKBLAZE_KEY_ID!, BACKBLAZE_APP_KEY!);

      if (!authData) {
        throw new Error(`Failed to authenticate with Backblaze. Check your credentials and permissions.`);
      }

      const { apiUrl, authorizationToken, downloadUrl } = authData;

      // Step 2: Get an upload URL and auth token
      const getUploadUrlResponse = await fetch(`${apiUrl}/b2api/v2/b2_get_upload_url`, {
        method: 'POST',
        headers: {
          'Authorization': authorizationToken,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bucketId: BACKBLAZE_BUCKET_ID,
        }),
      });

      if (!getUploadUrlResponse.ok) {
        throw new Error(`Failed to get upload URL: ${getUploadUrlResponse.status} ${getUploadUrlResponse.statusText}`);
      }

      const uploadUrlData = await getUploadUrlResponse.json();
      const { uploadUrl, authorizationToken: uploadAuthToken } = uploadUrlData;

      // Step 3: Upload the file to Backblaze B2
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': uploadAuthToken,
          'Content-Type': args.contentType,
          'X-Bz-File-Name': encodeURIComponent(uniqueFileName),
          'X-Bz-Content-Sha1': 'do_not_verify', // In production, calculate the SHA1 hash
        },
        body: fileData,
      });

      if (!uploadResponse.ok) {
        throw new Error(`Failed to upload file: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();

      // The file URL will be in this format: https://f002.backblazeb2.com/file/bucket-name/path/to/file
      const fileUrl = `${downloadUrl}/file/${BACKBLAZE_BUCKET_NAME}/${uniqueFileName}`;

      return {
        success: true,
        fileUrl,
        fileName: uniqueFileName,
        fileId: uploadResult.fileId,
      };
    } catch (error) {
      console.error("Error uploading to Backblaze:", error);
      throw new Error(`Failed to upload to Backblaze: ${error instanceof Error ? error.message : String(error)}`);
    }
  },
});

// Get Backblaze file download URL
export const getBackblazeUrl = query({
  args: {
    fileName: v.string(),
  },
  handler: async (ctx, args) => {
    const BACKBLAZE_BUCKET_NAME = process.env.BACKBLAZE_BUCKET_NAME;
    if (!BACKBLAZE_BUCKET_NAME) {
      throw new Error("Missing Backblaze configuration");
    }

    return `https://f002.backblazeb2.com/file/${BACKBLAZE_BUCKET_NAME}/${args.fileName}`;
  }
});

