import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from "@/components/ui/bottom-sheet";
import { useDues } from "@/hooks/useDues";
import { useIsMobile } from "@/hooks/use-mobile";
import DueForm from "@/components/DueForm";
import DuesList from "@/components/DuesList";
import { CreateDueData, Due, UpdateDueData } from "@/types/due";

const DuesManager: React.FC = () => {
  const {
    dues,
    isLoading,
    addDue,
    updateDue,
    deleteDue,
    markAsSettled,
    isAdding,
    isUpdating,
  } = useDues();

  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDue, setEditingDue] = useState<Due | null>(null);

  const handleAddDue = (data: CreateDueData) => {
    addDue(data);
    setIsDialogOpen(false);
  };

  const handleEditDue = (due: Due) => {
    setEditingDue(due);
    setIsDialogOpen(true);
  };

  const handleUpdateDue = (data: CreateDueData) => {
    if (editingDue) {
      updateDue({
        id: editingDue.id,
        data: data as UpdateDueData,
      });
      setEditingDue(null);
      setIsDialogOpen(false);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingDue(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex w-full justify-end items-center mb-4">
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="h-4 w-4" />
          Add Due
        </Button>
      </div>

      <DuesList
        dues={dues}
        onEdit={handleEditDue}
        onDelete={deleteDue}
        onMarkAsSettled={markAsSettled}
      />

      {/* Add/Edit Due - Bottom Sheet on Mobile, Dialog on Desktop */}
      {isMobile ? (
        <BottomSheet open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <BottomSheetContent>
            <BottomSheetHeader>
              <BottomSheetTitle>
                {editingDue ? "Edit Due" : "Add New Due"}
              </BottomSheetTitle>
            </BottomSheetHeader>
            <BottomSheetBody>
              <DueForm
                onSubmit={editingDue ? handleUpdateDue : handleAddDue}
                onClose={handleCloseDialog}
                initialData={editingDue || undefined}
                isLoading={isAdding || isUpdating}
              />
            </BottomSheetBody>
          </BottomSheetContent>
        </BottomSheet>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingDue ? "Edit Due" : "Add New Due"}
              </DialogTitle>
            </DialogHeader>
            <DueForm
              onSubmit={editingDue ? handleUpdateDue : handleAddDue}
              onClose={handleCloseDialog}
              initialData={editingDue || undefined}
              isLoading={isAdding || isUpdating}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DuesManager;