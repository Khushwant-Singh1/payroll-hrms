// Client-side Cloudinary upload helper
// Note: This file only handles client-side uploads using unsigned upload presets
// For server-side operations, create a separate file that imports 'cloudinary' v2

// Helper function for client-side uploads
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      "Cloudinary configuration missing. Please check your environment variables."
    );
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("File must be an image");
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error("File size must be less than 5MB");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Cloudinary upload error:", errorData);
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.secure_url) {
      throw new Error("Upload successful but no URL returned");
    }

    return result.secure_url;
  } catch (error) {
    console.error("Upload error:", error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown upload error occurred");
  }
}