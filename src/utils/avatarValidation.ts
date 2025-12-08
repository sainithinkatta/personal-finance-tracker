/**
 * Shared avatar file validation utilities
 *
 * Provides consistent validation logic across all components that handle avatar uploads
 */

export interface AvatarValidationResult {
  valid: boolean;
  error?: string;
}

// Allowed MIME types for avatars
export const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

// Maximum file size (5MB)
export const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

// Map MIME types to file extensions
export const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

/**
 * Validates avatar file type and size
 *
 * @param file - The file to validate
 * @returns Validation result with error message if invalid
 */
export function validateAvatarFile(file: File): AvatarValidationResult {
  // Validate file type
  if (!ALLOWED_AVATAR_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.',
    };
  }

  // Validate file size
  if (file.size > MAX_AVATAR_SIZE) {
    return {
      valid: false,
      error: 'File is too large. Maximum size is 5MB.',
    };
  }

  return { valid: true };
}

/**
 * Gets the file extension from a validated MIME type
 * SECURITY: Never derive extension from user-provided filename
 *
 * @param mimeType - The MIME type of the file
 * @returns File extension (without dot) or 'jpg' as fallback
 */
export function getExtensionFromMimeType(mimeType: string): string {
  return MIME_TO_EXTENSION[mimeType] || 'jpg';
}

/**
 * Generates a secure avatar file path for storage
 *
 * @param userId - The user's ID
 * @param mimeType - The file's MIME type
 * @returns Storage path in format: userId/avatar.ext
 */
export function getAvatarFilePath(userId: string, mimeType: string): string {
  const ext = getExtensionFromMimeType(mimeType);
  return `${userId}/avatar.${ext}`;
}
