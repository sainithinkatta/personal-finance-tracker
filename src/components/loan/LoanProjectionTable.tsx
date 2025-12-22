import React, { useMemo } from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Loan, LoanContribution, MonthlyProjection } from '@/types/loan';
import {
  generateProjection,
  calculateTotalInterest,
  calculateNetChange,
  formatLoanCurrency,
} from '@/utils/loanCalculations';

interface LoanProjectionTableProps {
  loan: Loan;
  contributions: LoanContribution[];
  monthsAhead?: number;
}

/**
 * Displays loan projection table with Month, Days, Interest Added, and Outstanding columns.
 * 
 * Projections are driven by:
 * - Base outstanding (from loan)
 * - Recorded contributions (reduces base outstanding)
 * - Interest calculations (reducing balance method)
 * 
 * No inline per-row payments - contributions are handled separately.
 */
const LoanProjectionTable: React.FC<LoanProjectionTableProps> = ({
  loan,
  contributions,
  monthsAhead = 6,
}) => {
  // Generate projections using contributions to calculate starting balance
  const projections = useMemo(
    () => generateProjection(loan, contributions, monthsAhead),
    [loan, contributions, monthsAhead]
  );

  const totalInterest = calculateTotalInterest(projections);
  const netChange = calculateNetChange(projections);

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[100px]">Month</TableHead>
            <TableHead className="text-center min-w-[60px]">Days</TableHead>
            <TableHead className="text-right min-w-[120px]">Interest Added</TableHead>
            <TableHead className="text-right min-w-[140px]">Outstanding</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projections.map((projection) => {
            const monthKey = format(projection.monthStart, 'yyyy-MM');
            return (
              <TableRow key={monthKey}>
                <TableCell className="font-medium">{projection.month}</TableCell>
                <TableCell className="text-center text-muted-foreground">
                  {projection.daysInMonth}
                </TableCell>
                <TableCell className="text-right text-amber-600 font-medium">
                  +{formatLoanCurrency(projection.interestAdded, loan.currency)}
                </TableCell>
                <TableCell className="text-right font-semibold">
                  {formatLoanCurrency(projection.closingBalance, loan.currency)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={2} className="font-semibold">Totals</TableCell>
            <TableCell className="text-right text-amber-600 font-semibold">
              +{formatLoanCurrency(totalInterest, loan.currency)}
            </TableCell>
            <TableCell className="text-right font-semibold">
              <span className={netChange >= 0 ? 'text-destructive' : 'text-green-600'}>
                {netChange >= 0 ? '+' : ''}{formatLoanCurrency(Math.abs(netChange), loan.currency)}
              </span>
              <span className="text-xs text-muted-foreground ml-1">net</span>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
};

export default LoanProjectionTable;
