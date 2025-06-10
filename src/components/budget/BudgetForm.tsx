
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Budget } from '@/types/budget';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'JPY'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

interface BudgetFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (budgetData: Partial<Budget>) => void;
  budget?: Budget | null;
  isLoading?: boolean;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  isOpen,
  onClose,
  onSave,
  budget,
  isLoading = false,
}) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    name: '',
    total_amount: '',
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear(),
    currency: 'USD',
    notes: '',
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        name: budget.name || '',
        total_amount: budget.total_amount?.toString() || '',
        month: budget.month || currentDate.getMonth() + 1,
        year: budget.year || currentDate.getFullYear(),
        currency: budget.currency || 'USD',
        notes: budget.notes || '',
      });
    } else {
      setFormData({
        name: '',
        total_amount: '',
        month: currentDate.getMonth() + 1,
        year: currentDate.getFullYear(),
        currency: 'USD',
        notes: '',
      });
    }
  }, [budget, isOpen]);

  const handleSave = () => {
    if (!formData.name || !formData.total_amount) return;

    onSave({
      name: formData.name,
      total_amount: parseFloat(formData.total_amount),
      month: formData.month,
      year: formData.year,
      currency: formData.currency,
      notes: formData.notes || null,
    });
  };

  const isFormValid = formData.name && formData.total_amount && parseFloat(formData.total_amount) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {budget ? 'Edit Budget' : 'Create New Budget'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Budget Name *</Label>
            <Input
              id="name"
              placeholder="e.g., June - Living Expenses"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Total Budget Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map(currency => (
                    <SelectItem key={currency} value={currency}>{currency}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="month">Month *</Label>
              <Select 
                value={formData.month.toString()} 
                onValueChange={(value) => setFormData({ ...formData, month: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((month, index) => (
                    <SelectItem key={index + 1} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year *</Label>
              <Select 
                value={formData.year.toString()} 
                onValueChange={(value) => setFormData({ ...formData, year: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => currentDate.getFullYear() + i - 2).map(year => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional details about this budget..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!isFormValid || isLoading}
          >
            {budget ? 'Update Budget' : 'Create Budget'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
