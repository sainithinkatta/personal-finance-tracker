import React, { useState } from 'react';
import { Plus, TrendingUp, MoreVertical, Pencil, Trash2, PiggyBank } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { DeleteConfirmDialog } from '@/components/ui/delete-confirm-dialog';
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { SavingsGoal, SavingsGoalFormData } from '@/types/savingsGoal';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import SavingsGoalForm from './savings/SavingsGoalForm';
import EmptyState from './dashboard/EmptyState';

const SavingsGoals: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    updateSavingsGoal,
    deleteSavingsGoal,
    addContribution,
    isAdding,
    isUpdating,
    isDeleting,
    isAddingContribution,
  } = useSavingsGoals();
  const { toast } = useToast();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [contributionDescription, setContributionDescription] = useState<string>('');
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<SavingsGoal | null>(null);

  const resetContributionForm = () => {
    setContributionAmount('');
    setContributionDescription('');
    setSelectedGoalId('');
  };

  const handleGoalSubmit = (data: SavingsGoalFormData) => {
    if (editingGoal) {
      updateSavingsGoal({ id: editingGoal.id, updates: data });
    } else {
      addSavingsGoal(data);
    }
    setIsGoalDialogOpen(false);
    setEditingGoal(null);
  };

  const handleContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGoalId || !contributionAmount) {
      toast({
        title: 'Invalid Input',
        description: 'Please select a goal and enter an amount.',
        variant: 'destructive',
      });
      return;
    }

    addContribution({
      goalId: selectedGoalId,
      amount: parseFloat(contributionAmount),
      description: contributionDescription || undefined,
    });

    setIsContributionDialogOpen(false);
    resetContributionForm();
  };

  const handleEditClick = (goal: SavingsGoal) => {
    setEditingGoal(goal);
    setIsGoalDialogOpen(true);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const currencyInfo = CURRENCIES.find((c) => c.code === currency);
    return `${currencyInfo?.symbol || currency}${amount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const checkGoalMilestones = (current: number, target: number) => {
    const percentage = (current / target) * 100;
    if (percentage >= 100) return { milestone: 'completed', color: 'text-accent' };
    if (percentage >= 80) return { milestone: 'almost-there', color: 'text-warning' };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Buttons Row: Add Goal and Add Contribution aligned right */}
      <div className="flex justify-end space-x-2">
        <Dialog open={isGoalDialogOpen} onOpenChange={(open) => {
          setIsGoalDialogOpen(open);
          if (!open) setEditingGoal(null);
        }}>
          <DialogTrigger asChild>
            <Button
              variant="default"
              onClick={() => {
                setEditingGoal(null);
                setIsGoalDialogOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-auto w-[calc(100%-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle>{editingGoal ? 'Edit Savings Goal' : 'Add Savings Goal'}</DialogTitle>
              <DialogDescription>
                {editingGoal ? 'Update your savings goal details.' : 'Create a new savings goal to track your progress.'}
              </DialogDescription>
            </DialogHeader>
            <SavingsGoalForm
              onSubmit={handleGoalSubmit}
              isSaving={isAdding || isUpdating}
              editingGoal={editingGoal}
              onClose={() => setIsGoalDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={resetContributionForm}>
              <TrendingUp className="h-4 w-4" />
              Add Contribution
            </Button>
          </DialogTrigger>
          <DialogContent className="mx-auto w-[calc(100%-2rem)] sm:w-full">
            <DialogHeader>
              <DialogTitle>Add Contribution</DialogTitle>
              <DialogDescription>
                Record a contribution to one of your savings goals.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleContributionSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="goal" className="text-right">
                    Goal
                  </Label>
                  <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a savings goal" />
                    </SelectTrigger>
                    <SelectContent>
                      {savingsGoals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id}>
                          {goal.name} ({goal.currency})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={contributionAmount}
                    onChange={(e) => setContributionAmount(e.target.value)}
                    className="col-span-3"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Input
                    id="description"
                    value={contributionDescription}
                    onChange={(e) => setContributionDescription(e.target.value)}
                    className="col-span-3"
                    placeholder="Optional description"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAddingContribution}>
                  Add Contribution
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {savingsGoals.length === 0 ? (
        <EmptyState
          icon={PiggyBank}
          title="No Savings Goals Yet"
          description="Create your first savings goal to start tracking your progress toward financial milestones."
        />
      ) : (
        <div className="grid gap-6">
          {savingsGoals.map((goal) => {
            const progress = calculateProgress(goal.current_amount || 0, goal.target_amount);
            const milestone = checkGoalMilestones(goal.current_amount || 0, goal.target_amount);

            return (
              <Card key={goal.id} className="p-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">{goal.name}</h3>
                    <div className="flex items-center">
                      {milestone && (
                        <span className={`text-sm font-medium ${milestone.color} mr-2`}>
                          {milestone.milestone === 'completed'
                            ? '🎉 Goal Achieved!'
                            : '⚡ Almost There!'}
                        </span>
                      )}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditClick(goal)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onSelect={(e) => {
                              e.preventDefault();
                              setDeletingGoal(goal);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-3" />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{formatCurrency(goal.current_amount || 0, goal.currency)}</span>
                      <span>{formatCurrency(goal.target_amount, goal.currency)}</span>
                    </div>
                  </div>

                  {goal.target_date && (
                    <p className="text-sm text-muted-foreground">
                      Target Date: {format(new Date(goal.target_date), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
      <DeleteConfirmDialog
        isOpen={!!deletingGoal}
        onClose={() => setDeletingGoal(null)}
        onConfirm={() => {
          if (deletingGoal) {
            deleteSavingsGoal(deletingGoal.id);
            setDeletingGoal(null);
          }
        }}
        entityName="Savings Goal"
        itemIdentifier={deletingGoal?.name}
        isLoading={isDeleting}
        additionalInfo="This will also delete all contributions."
      />
    </div>
  );
};

export default React.memo(SavingsGoals);