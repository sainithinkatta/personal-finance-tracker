import { FILE_UPLOAD_CONFIG, FILE_UPLOAD_MESSAGES } from '@/constants/fileUpload';

/**
 * Format file size in bytes to human-readable format
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

/**
 * Validation result for file uploads
 */
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate file type against accepted types
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export const validateFileType = (file: File): FileValidationResult => {
  const isValidMimeType = FILE_UPLOAD_CONFIG.ACCEPTED_MIME_TYPES.includes(
    file.type as any
  );

  const isValidExtension = FILE_UPLOAD_CONFIG.ACCEPTED_EXTENSIONS.some((ext) =>
    file.name.toLowerCase().endsWith(ext)
  );

  if (!isValidMimeType && !isValidExtension) {
    return {
      isValid: false,
      error: FILE_UPLOAD_MESSAGES.ERRORS.INVALID_TYPE,
    };
  }

  return { isValid: true };
};

/**
 * Validate file size against maximum allowed size
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export const validateFileSize = (file: File): FileValidationResult => {
  if (file.size > FILE_UPLOAD_CONFIG.MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: FILE_UPLOAD_MESSAGES.ERRORS.FILE_TOO_LARGE,
    };
  }

  return { isValid: true };
};

/**
 * Comprehensive file validation for uploads
 * @param file - File to validate
 * @returns Validation result with error message if invalid
 */
export const validateFile = (file: File): FileValidationResult => {
  // Validate type first
  const typeValidation = validateFileType(file);
  if (!typeValidation.isValid) {
    return typeValidation;
  }

  // Then validate size
  const sizeValidation = validateFileSize(file);
  if (!sizeValidation.isValid) {
    return sizeValidation;
  }

  return { isValid: true };
};

/**
 * Create a FormData object for file upload
 * @param bankAccountId - Bank account ID
 * @param file - File to upload
 * @returns FormData ready for upload
 */
export const createFileUploadFormData = (
  bankAccountId: string,
  file: File
): FormData => {
  const formData = new FormData();
  formData.append('bank_account_id', bankAccountId);
  formData.append('file', file);
  return formData;
};
