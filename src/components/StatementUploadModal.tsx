import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useStatementImport } from '@/hooks/useStatementImport';
import { useQueryClient } from '@tanstack/react-query';
import { Upload, FileText, X, Loader2, CheckCircle, History, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ImportHistoryList } from './ImportHistoryList';
import { FILE_UPLOAD_CONFIG, FILE_UPLOAD_MESSAGES } from '@/constants/fileUpload';
import { formatFileSize, validateFile } from '@/utils/fileUtils';
import type { ImportSummary } from '@/types/statementImport';

interface StatementUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StatementUploadModal: React.FC<StatementUploadModalProps> = ({
  open,
  onOpenChange,
}) => {
  const { bankAccounts, isLoading: isLoadingBanks } = useBankAccounts();
  const { importStatement, isImporting, error, clearError } = useStatementImport();
  const queryClient = useQueryClient();

  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importResult, setImportResult] = useState<ImportSummary | null>(null);
  const [activeTab, setActiveTab] = useState<string>('upload');
  const [validationError, setValidationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * Handle file selection with validation
   */
  const handleFileSelect = useCallback((file: File) => {
    clearError();
    setImportResult(null);
    setValidationError(null);

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      setValidationError(validation.error!);
      return;
    }

    setSelectedFile(file);
  }, [clearError]);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  /**
   * Trigger file input click
   */
  const handleBrowseClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  /**
   * Handle file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  }, [handleFileSelect]);

  /**
   * Remove selected file
   */
  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setImportResult(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  /**
   * Close modal and reset state
   */
  const handleClose = useCallback(() => {
    setSelectedBankId('');
    setSelectedFile(null);
    setImportResult(null);
    setActiveTab('upload');
    setValidationError(null);
    clearError();
    onOpenChange(false);
  }, [clearError, onOpenChange]);

  /**
   * Confirm and process upload
   */
  const handleConfirmUpload = useCallback(async () => {
    if (!selectedBankId || !selectedFile) return;

    const result = await importStatement(selectedBankId, selectedFile);

    if (result) {
      setImportResult({
        imported: result.imported_count,
        skipped: result.skipped_count,
        duplicates: result.duplicate_count || 0,
      });

      // Invalidate import history to show new record
      queryClient.invalidateQueries({ queryKey: ['import-history'] });

      // Auto-close after success with a delay
      setTimeout(() => {
        handleClose();
      }, FILE_UPLOAD_CONFIG.SUCCESS_MODAL_DELAY);
    }
  }, [selectedBankId, selectedFile, importStatement, queryClient, handleClose]);

  /**
   * Check if upload can be submitted
   */
  const canSubmit = useMemo(
    () => selectedBankId && selectedFile && !isImporting && !importResult && !validationError,
    [selectedBankId, selectedFile, isImporting, importResult, validationError]
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Bank Statement Import</DialogTitle>
          <DialogDescription>
            Upload statements to import transactions or view import history.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="flex-1 mt-4 space-y-4">
            {/* Bank Account Selector */}
            <div className="space-y-2">
              <Label htmlFor="bank-select">Bank Account</Label>
              <Select
                value={selectedBankId}
                onValueChange={setSelectedBankId}
                disabled={isImporting || !!importResult}
              >
                <SelectTrigger id="bank-select">
                  <SelectValue placeholder="Select a bank account" />
                </SelectTrigger>
                <SelectContent>
                  {isLoadingBanks ? (
                    <SelectItem value="loading" disabled>
                      Loading...
                    </SelectItem>
                  ) : bankAccounts.length === 0 ? (
                    <SelectItem value="none" disabled>
                      No bank accounts found
                    </SelectItem>
                  ) : (
                    bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} ({account.account_type})
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Area */}
            <div className="space-y-2">
              <Label>Statement File</Label>
              
              {!selectedFile ? (
                <div
                  className={cn(
                    'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
                    dragOver
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/25 hover:border-primary/50',
                    (isImporting || !!importResult) && 'pointer-events-none opacity-50'
                  )}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={handleBrowseClick}
                >
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop your statement here, or{' '}
                    <span className="text-primary font-medium">browse files</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, CSV, or TXT (max {FILE_UPLOAD_CONFIG.MAX_FILE_SIZE_MB}MB)
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-3 flex items-center gap-3 bg-muted/30">
                  <FileText className="h-8 w-8 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(selectedFile.size)}
                    </p>
                  </div>
                  {!isImporting && !importResult && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={handleRemoveFile}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept={FILE_UPLOAD_CONFIG.ACCEPTED_EXTENSIONS.join(',')}
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>

            {/* Status Messages */}
            {validationError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4" />
                <span>{validationError}</span>
              </div>
            )}

            {isImporting && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{FILE_UPLOAD_MESSAGES.LOADING.ANALYZING}</span>
              </div>
            )}

            {importResult && (
              <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 dark:bg-green-950/30 rounded-lg p-3">
                <CheckCircle className="h-4 w-4" />
                <span>
                  Imported {importResult.imported} transactions
                  {importResult.duplicates > 0 && `, ${importResult.duplicates} duplicates skipped`}
                  {importResult.skipped > 0 && ` (${importResult.skipped} net-zero pairs skipped)`}
                </span>
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 rounded-lg p-3">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button variant="outline" onClick={handleClose} disabled={isImporting}>
                {importResult ? 'Close' : 'Cancel'}
              </Button>
              {!importResult && (
                <Button onClick={handleConfirmUpload} disabled={!canSubmit}>
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    'Confirm Upload'
                  )}
                </Button>
              )}
            </DialogFooter>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 mt-4 overflow-auto">
            <ImportHistoryList />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
