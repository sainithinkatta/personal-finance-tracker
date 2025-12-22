import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Loan, LoanContribution, LoanContributionFormData } from '@/types/loan';

interface LoanContributionFormProps {
  loanId: string;
  loan: Loan;
  contribution?: LoanContribution;
  onSubmit: (data: LoanContributionFormData) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

const createFormSchema = (referenceDate: string) => z.object({
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  contribution_date: z.date({ required_error: 'Date is required' })
    .refine((date) => {
      const refDate = new Date(referenceDate);
      refDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate >= refDate;
    }, {
      message: 'Date must be on or after the loan reference date',
    })
    .refine((date) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      return checkDate <= today;
    }, {
      message: 'Date cannot be in the future',
    }),
  note: z.string().optional(),
});

const LoanContributionForm: React.FC<LoanContributionFormProps> = ({
  loanId,
  loan,
  contribution,
  onSubmit,
  onCancel,
  isSubmitting = false,
  disabled = false,
}) => {
  const formSchema = createFormSchema(loan.reference_date);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: contribution?.amount || undefined,
      contribution_date: contribution?.contribution_date
        ? new Date(contribution.contribution_date)
        : new Date(),
      note: contribution?.note || '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) => {
    onSubmit({
      loan_id: loanId,
      amount: values.amount,
      contribution_date: values.contribution_date,
      note: values.note,
    });
    if (!contribution) {
      form.reset({
        amount: undefined,
        contribution_date: new Date(),
        note: '',
      });
    }
  };

  if (disabled) {
    return (
      <div className="text-center py-4 px-6 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700 font-medium">
          This loan is fully paid off. No additional contributions needed.
        </p>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    placeholder="Enter amount"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contribution_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="note"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Note (optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., EMI payment"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              'Saving...'
            ) : contribution ? (
              'Update'
            ) : (
              <>
                <Plus className="h-4 w-4 mr-1.5" />
                Add Contribution
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default LoanContributionForm;
