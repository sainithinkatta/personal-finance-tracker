import React, { useState } from 'react';
import { Plus, TrendingUp } from 'lucide-react';
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
import { useSavingsGoals } from '@/hooks/useSavingsGoals';
import { SavingsGoalFormData } from '@/types/savingsGoal';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const SavingsGoals: React.FC = () => {
  const {
    savingsGoals,
    addSavingsGoal,
    addContribution,
    isAdding,
    isAddingContribution,
  } = useSavingsGoals();
  const { toast } = useToast();
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isContributionDialogOpen, setIsContributionDialogOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [contributionAmount, setContributionAmount] = useState<string>('');
  const [contributionDescription, setContributionDescription] = useState<string>('');
  const [goalFormData, setGoalFormData] = useState<SavingsGoalFormData>({
    name: '',
    target_amount: 0,
    target_date: '',
    currency: 'USD',
  });

  const resetGoalForm = () => {
    setGoalFormData({
      name: '',
      target_amount: 0,
      target_date: '',
      currency: 'USD',
    });
  };

  const resetContributionForm = () => {
    setContributionAmount('');
    setContributionDescription('');
    setSelectedGoalId('');
  };

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addSavingsGoal(goalFormData);
    setIsGoalDialogOpen(false);
    resetGoalForm();
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
    if (percentage >= 100) return { milestone: 'completed', color: 'text-green-600' };
    if (percentage >= 80) return { milestone: 'almost-there', color: 'text-yellow-600' };
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Buttons Row: Add Goal and Add Contribution aligned right */}
      <div className="flex justify-end space-x-2">
        <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetGoalForm} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Savings Goal</DialogTitle>
              <DialogDescription>
                Create a new savings goal to track your progress.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleGoalSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input
                    id="name"
                    value={goalFormData.name}
                    onChange={(e) =>
                      setGoalFormData({ ...goalFormData, name: e.target.value })
                    }
                    className="col-span-3"
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target_amount" className="text-right">
                    Target Amount
                  </Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    value={goalFormData.target_amount}
                    onChange={(e) =>
                      setGoalFormData({
                        ...goalFormData,
                        target_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="col-span-3"
                    placeholder="10000.00"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="currency" className="text-right">
                    Currency
                  </Label>
                  <Select
                    value={goalFormData.currency}
                    onValueChange={(value) =>
                      setGoalFormData({ ...goalFormData, currency: value })
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="target_date" className="text-right">
                    Target Date (Optional)
                  </Label>
                  <Input
                    id="target_date"
                    type="date"
                    value={goalFormData.target_date}
                    onChange={(e) =>
                      setGoalFormData({
                        ...goalFormData,
                        target_date: e.target.value,
                      })
                    }
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isAdding}>
                  Add Goal
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isContributionDialogOpen} onOpenChange={setIsContributionDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" onClick={resetContributionForm}>
              <TrendingUp className="h-4 w-4" />
              Add Contribution
            </Button>
          </DialogTrigger>
          <DialogContent>
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
        <div className="text-center py-8 text-muted-foreground">
          No savings goals created yet. Add your first goal to start saving!
        </div>
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
                    {milestone && (
                      <span className={`text-sm font-medium ${milestone.color}`}>
                        {milestone.milestone === 'completed'
                          ? '🎉 Goal Achieved!'
                          : '⚡ Almost There!'}
                      </span>
                    )}
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
    </div>
  );
};

export default SavingsGoals;