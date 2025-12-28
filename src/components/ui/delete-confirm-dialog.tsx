import React from 'react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    entityName: string;
    itemIdentifier?: string;
    isLoading?: boolean;
    additionalInfo?: string;
}

/**
 * Standardized delete confirmation dialog used across all modules.
 * 
 * Pattern:
 * - Title: "Delete {entityName}"
 * - Description: "Are you sure you want to delete "{itemIdentifier}"? This action cannot be undone."
 * - Cancel button: "Cancel"
 * - Confirm button: "Delete" / "Deleting..."
 */
export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    entityName,
    itemIdentifier,
    isLoading = false,
    additionalInfo,
}) => {
    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent className="mx-auto w-[calc(100%-2rem)] sm:w-full">
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete {entityName}</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete{itemIdentifier ? ` "${itemIdentifier}"` : ` this ${entityName.toLowerCase()}`}?
                        This action cannot be undone.
                        {additionalInfo && ` ${additionalInfo}`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel onClick={onClose} disabled={isLoading}>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="bg-destructive hover:bg-destructive/90"
                    >
                        {isLoading ? 'Deleting...' : 'Delete'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteConfirmDialog;
