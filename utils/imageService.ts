const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '';


interface CloudinaryTransformations {
  width?: number;
  height?: number;
  quality?: 'auto' | number;
  fetchFormat?: 'auto' | 'png' | 'jpg' | 'webp';
  crop?: 'fill' | 'fit' | 'thumb' | 'scale';
  gravity?: 'face' | 'center' | 'north' | 'auto';
  radius?: 'max' | number;
}

/**
 * Generates a Cloudinary URL for an image.
 * This function can either transform an image already on Cloudinary
 * or fetch and transform a remote image from another URL.
 * @param remoteUrl The original URL of the image.
 * @param transformations An object of Cloudinary transformations.
 * @returns A fully formed Cloudinary URL.
 */
export const getCloudinaryUrl = (
  remoteUrl: string,
  transformations: CloudinaryTransformations = {}
): string => {
  // Return original URL if it's not a full http/https URL (e.g., data URI or invalid)
  if (!remoteUrl || !remoteUrl.startsWith('http')) {
      return remoteUrl;
  }

  // Sensible defaults
  const defaults: Partial<CloudinaryTransformations> = {
    quality: 'auto',
    fetchFormat: 'auto',
  };
  // Apply 'fill' and 'face' gravity for avatars, but not for 'fit' crops like certificates
  if (transformations.crop !== 'fit') {
      defaults.crop = 'fill';
      defaults.gravity = 'face';
  }

  const finalTransforms = { ...defaults, ...transformations };

  const transformParts: string[] = [];
  if (finalTransforms.width) transformParts.push(`w_${finalTransforms.width}`);
  if (finalTransforms.height) transformParts.push(`h_${finalTransforms.height}`);
  if (finalTransforms.crop) transformParts.push(`c_${finalTransforms.crop}`);
  if (finalTransforms.gravity) transformParts.push(`g_${finalTransforms.gravity}`);
  if (finalTransforms.radius) transformParts.push(`r_${finalTransforms.radius}`);
  if (finalTransforms.quality) transformParts.push(`q_${finalTransforms.quality}`);
  if (finalTransforms.fetchFormat) transformParts.push(`f_${finalTransforms.fetchFormat}`);

  const transformString = transformParts.join(',');

  if (!transformString) return remoteUrl;

  const uploadStr = '/image/upload/';
  const cloudinaryUploadUrlIndex = remoteUrl.indexOf(uploadStr);

  // Case 1: It's a Cloudinary "upload" URL. Inject transformations.
  if (cloudinaryUploadUrlIndex !== -1) {
    const baseUrlPart = remoteUrl.substring(0, cloudinaryUploadUrlIndex + uploadStr.length);
    const pathPart = remoteUrl.substring(cloudinaryUploadUrlIndex + uploadStr.length);
    
    // Find a version part (e.g., "v1234567/") to reliably locate the start of the public ID.
    const versionMatch = pathPart.match(/v\d+\//);
    
    if (versionMatch && typeof versionMatch.index === 'number') {
      // Version found. The path from the version onwards is the public ID.
      // This strips any existing transformations from the original URL.
      const publicIdPath = pathPart.substring(versionMatch.index);
      return `${baseUrlPart}${transformString}/${publicIdPath}`;
    } else {
      // No version found. This is a safe fallback for unversioned assets.
      return `${baseUrlPart}${transformString}/${pathPart}`;
    }
  }

  // Case 2: It's a remote URL. Use the "fetch" method.
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/fetch/${transformString}/${encodeURIComponent(remoteUrl)}`;
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || 'Cloudinary upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};