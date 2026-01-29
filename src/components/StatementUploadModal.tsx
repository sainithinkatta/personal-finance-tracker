import React, { useState, useRef } from 'react';
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
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useStatementImport } from '@/hooks/useStatementImport';
import { useAISettings } from '@/hooks/useAISettings';
import { Upload, FileText, X, Loader2, CheckCircle, Bot, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface StatementUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ACCEPTED_TYPES = ['.pdf', '.csv', '.txt'];
const ACCEPTED_MIME_TYPES = [
  'application/pdf',
  'text/csv',
  'text/plain',
  'application/vnd.ms-excel',
];

export const StatementUploadModal: React.FC<StatementUploadModalProps> = ({
  open,
  onOpenChange,
}) => {
  const navigate = useNavigate();
  const { bankAccounts, isLoading: isLoadingBanks } = useBankAccounts();
  const { importStatement, isImporting, error, clearError } = useStatementImport();
  const { hasKey, isLoading: isLoadingAISettings } = useAISettings();
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importResult, setImportResult] = useState<{ imported: number; skipped: number; duplicates: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If user doesn't have an AI key, show setup prompt
  const showKeySetupPrompt = !isLoadingAISettings && hasKey === false;

  const handleFileSelect = (file: File) => {
    clearError();
    setImportResult(null);

    // Validate file type
    const isValidType = ACCEPTED_MIME_TYPES.includes(file.type) ||
      ACCEPTED_TYPES.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!isValidType) {
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return;
    }

    setSelectedFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmUpload = async () => {
    if (!selectedBankId || !selectedFile) return;

    const result = await importStatement(selectedBankId, selectedFile);

    if (result) {
      setImportResult({
        imported: result.imported_count,
        skipped: result.skipped_count,
        duplicates: result.duplicate_count || 0,
      });

      // Auto-close after success with a delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    setSelectedBankId('');
    setSelectedFile(null);
    setImportResult(null);
    clearError();
    onOpenChange(false);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const canSubmit = selectedBankId && selectedFile && !isImporting && !importResult;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Statement</DialogTitle>
          <DialogDescription>
            Upload your bank statement to automatically import transactions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Show AI key setup prompt if user hasn't configured their key */}
          {showKeySetupPrompt ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Bot className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Gemini API Key Required</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  To use AI-powered statement import, you need to connect your Gemini API key first.
                </p>
              </div>
              <Button
                onClick={() => {
                  handleClose();
                  navigate('/settings');
                }}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Go to Settings
              </Button>
            </div>
          ) : (
            <>
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
                  PDF, CSV, or TXT (max 10MB)
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
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              onChange={handleFileInputChange}
            />
          </div>

          {/* Status Messages */}
          {isImporting && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Analyzing statement with AI...</span>
            </div>
          )}

          {importResult && (
            <div className="flex items-center gap-2 text-sm text-primary bg-primary/10 rounded-lg p-3">
              <CheckCircle className="h-4 w-4" />
              <span>
                Imported {importResult.imported} transactions
                {importResult.duplicates > 0 && `, ${importResult.duplicates} duplicates skipped`}
                {importResult.skipped > 0 && ` (${importResult.skipped} net-zero pairs skipped)`}
              </span>
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 rounded-lg p-3">
              {error}
            </div>
          )}
            </>
          )}
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
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
      </DialogContent>
    </Dialog>
  );
};
