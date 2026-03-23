/**
 * Checks if a file is a HEIC/HEIF image.
 */
export const isHeic = (file: File): boolean => {
  if (!file) return false;
  const type = (file.type || "").toLowerCase();
  const name = (file.name || "").toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
};

/**
 * Converts a HEIC file to a JPEG blob.
 * Returns the original file if it's not a HEIC file or if conversion fails.
 */
export const convertHeicToJpeg = async (file: File): Promise<File> => {
  if (!isHeic(file)) {
    return file;
  }

  try {
    // Dynamic import to avoid issues in some environments
    const heic2anyModule = await import("heic2any");
    const heic2any = heic2anyModule.default || heic2anyModule;

    const blob = await (heic2any as any)({
      blob: file,
      toType: "image/jpeg",
      quality: 0.8,
    });

    // heic2any can return an array if multiple images are in the HEIC
    const resultBlob = Array.isArray(blob) ? blob[0] : blob;

    // Create a new File object from the blob
    const newFileName = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
    return new File([resultBlob], newFileName, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch (error: any) {
    // If heic2any tells us the image is already browser readable (e.g., a JPEG with a .heic extension),
    // we can safely return the original file as it can be displayed/processed by the browser.
    if (error?.message?.includes("already browser readable")) {
      console.log("HEIC file is already browser-readable, skipping conversion:", file.name);
      return file;
    }
    
    console.error("HEIC conversion failed for:", file.name, error);
    return file; // Fallback to original file
  }
};

/**
 * Processes a list of files, converting any HEIC files to JPEG.
 */
export const processImages = async (files: File[]): Promise<File[]> => {
  if (!files || files.length === 0) return [];
  
  const processedFiles = await Promise.all(
    files.map(async (file) => {
      try {
        return await convertHeicToJpeg(file);
      } catch (err) {
        console.error("Error processing individual image:", err);
        return file;
      }
    })
  );
  return processedFiles;
};
