/**
 * File upload configuration constants
 * Centralized configuration for bank statement imports
 */

export const FILE_UPLOAD_CONFIG = {
  // Maximum file size in bytes (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024,

  // File size in MB for display
  MAX_FILE_SIZE_MB: 10,

  // Accepted file extensions
  ACCEPTED_EXTENSIONS: ['.pdf', '.csv', '.txt'] as const,

  // Accepted MIME types
  ACCEPTED_MIME_TYPES: [
    'application/pdf',
    'text/csv',
    'text/plain',
    'application/vnd.ms-excel',
  ] as const,

  // Request timeout in milliseconds (30 seconds)
  REQUEST_TIMEOUT: 30000,

  // Auto-close success modal delay (2 seconds)
  SUCCESS_MODAL_DELAY: 2000,

  // Import history pagination limit
  HISTORY_LIMIT: 50,
} as const;

export const FILE_UPLOAD_MESSAGES = {
  ERRORS: {
    INVALID_TYPE: 'Please upload a PDF, CSV, or TXT file.',
    FILE_TOO_LARGE: `File size must be less than ${FILE_UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB.`,
    NO_FILE_SELECTED: 'Please select a file to upload.',
    NO_BANK_SELECTED: 'Please select a bank account.',
    NOT_AUTHENTICATED: 'You must be logged in to import statements.',
    UPLOAD_FAILED: 'Failed to upload statement. Please try again.',
    NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  },
  SUCCESS: {
    IMPORT_COMPLETE: 'Statement imported successfully!',
    HISTORY_DELETED: 'Import history record removed.',
  },
  LOADING: {
    ANALYZING: 'Analyzing statement with AI...',
    UPLOADING: 'Uploading file...',
  },
} as const;
