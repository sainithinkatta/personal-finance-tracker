
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { SavingsGoal, SavingsGoalFormData } from '@/types/savingsGoal';
import { CURRENCIES } from '@/types/expense';
import { format } from 'date-fns';
import { DialogFooter } from '../ui/dialog';

const savingsGoalSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  target_amount: z.coerce.number().positive('Target amount must be greater than 0'),
  target_date: z.string().min(1, 'Target date is required'),
  currency: z.string().min(1, 'Currency is required'),
});

interface SavingsGoalFormProps {
  onSubmit: (data: SavingsGoalFormData) => void;
  isSaving: boolean;
  editingGoal: SavingsGoal | null;
  onClose: () => void;
}

const SavingsGoalForm: React.FC<SavingsGoalFormProps> = ({ onSubmit, isSaving, editingGoal, onClose }) => {
  const form = useForm<SavingsGoalFormData>({
    resolver: zodResolver(savingsGoalSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      target_amount: 0,
      target_date: '',
      currency: 'USD',
    },
  });

  useEffect(() => {
    if (editingGoal) {
      form.reset({
        name: editingGoal.name,
        target_amount: editingGoal.target_amount,
        target_date: editingGoal.target_date ? format(new Date(editingGoal.target_date), 'yyyy-MM-dd') : '',
        currency: editingGoal.currency,
      });
    } else {
      form.reset({
        name: '',
        target_amount: 0,
        target_date: '',
        currency: 'USD',
      });
    }
  }, [editingGoal, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Emergency Fund" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Amount</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" placeholder="10000.00" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Currency</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.symbol} {currency.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="target_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Date</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <DialogFooter className="pt-4">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={!form.formState.isValid || isSaving}>
                {isSaving ? 'Saving...' : 'Save Goal'}
            </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default SavingsGoalForm;
