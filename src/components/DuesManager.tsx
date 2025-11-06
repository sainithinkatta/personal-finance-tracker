import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDues } from "@/hooks/useDues";
import DueForm from "@/components/DueForm";
import DuesList from "@/components/DuesList";
import { CreateDueData, Due, UpdateDueData } from "@/types/due";
import { ResponsiveSheet } from "@/components/layout/ResponsiveSheet";

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

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingDue, setEditingDue] = useState<Due | null>(null);

  const handleAddDue = (data: CreateDueData) => {
    addDue(data);
    setIsSheetOpen(false);
  };

  const handleEditDue = (due: Due) => {
    setEditingDue(due);
    setIsSheetOpen(true);
  };

  const handleUpdateDue = (data: CreateDueData) => {
    if (editingDue) {
      updateDue({
        id: editingDue.id,
        data: data as UpdateDueData,
      });
      setEditingDue(null);
      setIsSheetOpen(false);
    }
  };

  const handleCloseSheet = () => {
    setIsSheetOpen(false);
    setEditingDue(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      </div>
    );
  }

  const formId = editingDue ? "edit-due-form" : "add-due-form";

  return (
    <div className="space-y-4">
      <div className="flex w-full items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Track your dues</h2>
        <Button
          onClick={() => {
            setEditingDue(null);
            setIsSheetOpen(true);
          }}
          className="h-11 rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary/90"
        >
          <Plus className="mr-2 h-4 w-4" /> Add Due
        </Button>
      </div>

      <DuesList
        dues={dues}
        onEdit={handleEditDue}
        onDelete={deleteDue}
        onMarkAsSettled={markAsSettled}
      />

      <ResponsiveSheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseSheet();
          } else {
            setIsSheetOpen(true);
          }
        }}
        title={editingDue ? "Edit due" : "Add new due"}
        description="Manage the people you owe and who owe you back."
        footer={(
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleCloseSheet}
              className="h-11 rounded-xl border border-muted-foreground/20 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              Cancel
            </button>
            <button
              type="submit"
              form={formId}
              disabled={(editingDue ? isUpdating : isAdding)}
              className="h-11 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {editingDue ? (isUpdating ? "Saving..." : "Save changes") : isAdding ? "Saving..." : "Add due"}
            </button>
          </div>
        )}
        contentClassName="pb-24"
      >
        <DueForm
          onSubmit={editingDue ? handleUpdateDue : handleAddDue}
          onClose={handleCloseSheet}
          initialData={editingDue || undefined}
          isLoading={editingDue ? isUpdating : isAdding}
          formId={formId}
          hideActions
        />
      </ResponsiveSheet>
    </div>
  );
};

export default DuesManager;
