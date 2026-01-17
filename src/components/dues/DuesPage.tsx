import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { IOweTab } from "./tabs/IOweTab";
import { TheyOweMeTab } from "./tabs/TheyOweMeTab";
import { SettledTab } from "./tabs/SettledTab";
import { CreateDueData, Due, UpdateDueData } from "@/types/due";
import { cn } from "@/lib/utils";

export const DuesPage: React.FC = () => {
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
  const [activeTab, setActiveTab] = useState("i-owe");
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

  const triggerClassName = cn(
    "flex-1 h-full rounded-xl px-3 sm:px-4 text-sm font-semibold",
    "flex items-center justify-center whitespace-nowrap",
    "transition-all duration-200",
    "text-slate-600",
    "hover:bg-white/60 hover:text-slate-900",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "data-[state=active]:bg-white data-[state=active]:text-blue-600",
    "data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-black/5"
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add Due Button */}
      <div className="flex w-full justify-end items-center">
        <Button variant="default" onClick={() => setIsDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Due
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="w-full overflow-x-auto no-scrollbar -mx-1 px-1">
          <TabsList
            className={cn(
              "h-12",
              "inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-3",
              "items-center gap-1 rounded-2xl bg-muted/40 p-1",
              "overflow-hidden"
            )}
          >
            <TabsTrigger value="i-owe" className={triggerClassName}>
              I Owe
            </TabsTrigger>

            <TabsTrigger value="they-owe-me" className={triggerClassName}>
              They Owe Me
            </TabsTrigger>

            <TabsTrigger value="settled" className={triggerClassName}>
              Settled
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="i-owe" className="mt-4">
          <IOweTab
            dues={dues}
            onEdit={handleEditDue}
            onDelete={deleteDue}
            onMarkAsSettled={markAsSettled}
          />
        </TabsContent>

        <TabsContent value="they-owe-me" className="mt-4">
          <TheyOweMeTab
            dues={dues}
            onEdit={handleEditDue}
            onDelete={deleteDue}
            onMarkAsSettled={markAsSettled}
          />
        </TabsContent>

        <TabsContent value="settled" className="mt-4">
          <SettledTab
            dues={dues}
            onEdit={handleEditDue}
            onDelete={deleteDue}
          />
        </TabsContent>
      </Tabs>

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

export default DuesPage;
