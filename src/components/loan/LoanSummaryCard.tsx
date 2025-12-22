import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loan, LoanContribution } from '@/types/loan';
import {
  generateProjection,
  calculateTotalInterest,
  calculateCurrentOutstanding,
  formatLoanCurrency,
} from '@/utils/loanCalculations';

interface LoanSummaryCardProps {
  loan: Loan;
  contributions: LoanContribution[];
  monthsAhead?: number;
}

const LoanSummaryCard: React.FC<LoanSummaryCardProps> = ({
  loan,
  contributions,
  monthsAhead = 6,
}) => {
  // Calculate current outstanding (after contributions)
  const currentOutstanding = useMemo(
    () => calculateCurrentOutstanding(loan, contributions),
    [loan, contributions]
  );

  // Calculate total contributions after reference date
  const totalContributions = useMemo(() => {
    const refDate = new Date(loan.reference_date);
    return contributions
      .filter(c => new Date(c.contribution_date) > refDate)
      .reduce((sum, c) => sum + c.amount, 0);
  }, [loan.reference_date, contributions]);

  const projections = useMemo(
    () => generateProjection(loan, contributions, monthsAhead),
    [loan, contributions, monthsAhead]
  );

  const totalInterest = calculateTotalInterest(projections);
  const projectedOutstanding = projections.length > 0 
    ? projections[projections.length - 1].closingBalance 
    : currentOutstanding;
  
  const lastProjectionMonth = projections.length > 0 
    ? projections[projections.length - 1].month 
    : '';

  return (
    <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-blue-900">
          {loan.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Principal</p>
            <p className="text-lg font-bold text-foreground">
              {formatLoanCurrency(loan.principal, loan.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">ROI (Annual)</p>
            <p className="text-lg font-bold text-foreground">
              {loan.roi}%
            </p>
          </div>
        </div>

        <div className="border-t border-blue-200/60 pt-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Outstanding ({format(new Date(loan.reference_date), 'MMM d, yyyy')})
              </p>
              <p className="text-xl font-bold text-foreground">
                {formatLoanCurrency(loan.reference_outstanding, loan.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                Paid Since
              </p>
              <p className="text-xl font-bold text-green-600">
                -{formatLoanCurrency(totalContributions, loan.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-200/60 pt-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">
            Current Outstanding
          </p>
          <p className="text-2xl font-bold text-foreground">
            {formatLoanCurrency(currentOutstanding, loan.currency)}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-blue-200/60 pt-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Projected ({lastProjectionMonth})
            </p>
            <p className="text-lg font-bold text-amber-600">
              {formatLoanCurrency(projectedOutstanding, loan.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Interest ({monthsAhead} months)
            </p>
            <p className="text-lg font-bold text-red-600">
              +{formatLoanCurrency(totalInterest, loan.currency)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoanSummaryCard;
