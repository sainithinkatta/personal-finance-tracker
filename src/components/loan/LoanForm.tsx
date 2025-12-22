import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, IndianRupee, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loan, LoanFormData } from '@/types/loan';

interface LoanFormProps {
  loan?: Loan;
  onSubmit: (data: LoanFormData) => void;
  onClose: () => void;
  isSubmitting?: boolean;
}

const LoanForm: React.FC<LoanFormProps> = ({ loan, onSubmit, onClose, isSubmitting }) => {
  const [name, setName] = useState(loan?.name || '');
  const [principal, setPrincipal] = useState(loan?.principal?.toString() || '');
  const [roi, setRoi] = useState(loan?.roi?.toString() || '12');
  const [referenceOutstanding, setReferenceOutstanding] = useState(
    loan?.reference_outstanding?.toString() || ''
  );
  const [referenceDate, setReferenceDate] = useState<Date>(
    loan?.reference_date ? new Date(loan.reference_date) : new Date()
  );
  const [currency, setCurrency] = useState(loan?.currency || 'INR');
  const [notes, setNotes] = useState(loan?.notes || '');

  const getCurrencySymbol = (code: string) => {
    return code === 'INR' ? (
      <IndianRupee className="h-4 w-4" />
    ) : (
      <DollarSign className="h-4 w-4" />
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onSubmit({
      name,
      principal: Number(principal),
      roi: Number(roi),
      reference_outstanding: Number(referenceOutstanding),
      reference_date: referenceDate,
      currency,
      notes: notes || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1 sm:px-0">
      <div className="space-y-2">
        <Label htmlFor="loan-name">Loan Name *</Label>
        <Input
          id="loan-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Education Loan"
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loan-currency">Currency</Label>
          <Select value={currency} onValueChange={setCurrency}>
            <SelectTrigger id="loan-currency">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="INR">₹ Indian Rupee</SelectItem>
              <SelectItem value="USD">$ US Dollar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-roi">Annual Interest Rate (%) *</Label>
          <Input
            id="loan-roi"
            type="number"
            step="0.01"
            min="0"
            value={roi}
            onChange={(e) => setRoi(e.target.value)}
            placeholder="12"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="loan-principal">Principal Amount Disbursed *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
            {getCurrencySymbol(currency)}
          </span>
          <Input
            id="loan-principal"
            type="number"
            step="1"
            min="0"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
            placeholder="3000000"
            className="pl-9"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="loan-outstanding">Outstanding as of Date *</Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
              {getCurrencySymbol(currency)}
            </span>
            <Input
              id="loan-outstanding"
              type="number"
              step="1"
              min="0"
              value={referenceOutstanding}
              onChange={(e) => setReferenceOutstanding(e.target.value)}
              placeholder="3408127"
              className="pl-9"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="loan-ref-date">Reference Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="loan-ref-date"
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(referenceDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={referenceDate}
                onSelect={(date) => date && setReferenceDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="loan-notes">
          Notes <span className="text-muted-foreground">(Optional)</span>
        </Label>
        <Textarea
          id="loan-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add any additional details about this loan"
          className="resize-none min-h-[80px]"
          rows={3}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1">
          Cancel
        </Button>
        <Button type="submit" variant="default" className="flex-1" disabled={isSubmitting}>
          {loan ? 'Update Loan' : 'Add Loan'}
        </Button>
      </div>
    </form>
  );
};

export default LoanForm;
