/**
 * Type definitions for statement import functionality
 */

/**
 * Result returned from statement import API
 */
export interface StatementImportResult {
  imported_count: number;
  skipped_count: number;
  duplicate_count: number;
  message: string;
}

/**
 * Error response from statement import API
 */
export interface StatementImportError {
  error: string;
  details?: string;
}

/**
 * Import history item from database
 */
export interface ImportHistoryItem {
  id: string;
  user_id: string;
  bank_account_id: string;
  file_name: string;
  file_size: number;
  imported_count: number;
  skipped_count: number;
  duplicate_count: number;
  imported_at: string;
  bank_account?: {
    name: string | null;
  };
}

/**
 * Import summary for display
 */
export interface ImportSummary {
  imported: number;
  skipped: number;
  duplicates: number;
}

/**
 * Statement import status
 */
export type ImportStatus = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

/**
 * File upload state
 */
export interface FileUploadState {
  file: File | null;
  bankAccountId: string;
  status: ImportStatus;
  result: ImportSummary | null;
  error: string | null;
}
