import React, { memo, useCallback } from 'react';
import { useImportHistory } from '@/hooks/useImportHistory';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Trash2, Calendar, FileUp, CheckCircle, Copy, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { formatFileSize } from '@/utils/fileUtils';
import type { ImportHistoryItem } from '@/types/statementImport';

/**
 * Single import history item component
 */
interface HistoryItemProps {
  item: ImportHistoryItem;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}

const HistoryItem = memo<HistoryItemProps>(({ item, onDelete, isDeleting }) => {
  const handleDelete = useCallback(() => {
    onDelete(item.id);
  }, [item.id, onDelete]);

  return (
    <div className="border rounded-lg p-3 bg-card hover:bg-accent/5 transition-colors">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-primary/10 flex-shrink-0">
          <FileText className="h-5 w-5 text-primary" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">{item.file_name}</p>
            <span className="text-xs text-muted-foreground flex-shrink-0">
              {formatFileSize(item.file_size)}
            </span>
          </div>

          <p className="text-xs text-muted-foreground mt-0.5">
            {item.bank_account?.name || 'Unknown Account'}
          </p>

          <div className="flex items-center gap-3 mt-2 text-xs">
            <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
              <CheckCircle className="h-3 w-3" />
              <span>{item.imported_count} imported</span>
            </div>

            {item.duplicate_count > 0 && (
              <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Copy className="h-3 w-3" />
                <span>{item.duplicate_count} duplicates</span>
              </div>
            )}

            {item.skipped_count > 0 && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <AlertCircle className="h-3 w-3" />
                <span>{item.skipped_count} skipped</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            <span>{format(new Date(item.imported_at), 'MMM d, yyyy h:mm a')}</span>
          </div>
        </div>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 text-muted-foreground hover:text-destructive"
              disabled={isDeleting}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete import history?</AlertDialogTitle>
              <AlertDialogDescription>
                This will only remove the history record. The imported transactions will remain in your expenses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
});

HistoryItem.displayName = 'HistoryItem';

/**
 * Empty state component
 */
const EmptyState = memo(() => (
  <div className="text-center py-8 text-muted-foreground">
    <FileUp className="h-10 w-10 mx-auto mb-3 opacity-50" />
    <p className="text-sm">No import history yet</p>
    <p className="text-xs mt-1">Upload a bank statement to see it here</p>
  </div>
));

EmptyState.displayName = 'EmptyState';

/**
 * Loading skeleton component
 */
const LoadingSkeleton = memo(() => (
  <div className="space-y-3">
    {[1, 2, 3].map((i) => (
      <Skeleton key={i} className="h-20 w-full" />
    ))}
  </div>
));

LoadingSkeleton.displayName = 'LoadingSkeleton';

/**
 * Import history list component
 * Displays a list of past statement imports with their results
 */
export const ImportHistoryList: React.FC = () => {
  const { importHistory, isLoading, error, deleteHistory, isDeleting } = useImportHistory();

  const handleDelete = useCallback((id: string) => {
    deleteHistory(id);
  }, [deleteHistory]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-destructive">
        <AlertCircle className="h-10 w-10 mx-auto mb-3" />
        <p className="text-sm">Failed to load import history</p>
        <p className="text-xs mt-1">{error.message}</p>
      </div>
    );
  }

  if (importHistory.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="space-y-3">
      {importHistory.map((item) => (
        <HistoryItem
          key={item.id}
          item={item}
          onDelete={handleDelete}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
