import React, { useMemo } from 'react';
import { format } from 'date-fns';
import { ArrowDownCircle, BarChart3, CalendarDays, Percent, TrendingDown, Wallet } from 'lucide-react';
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

  const repaidPercent = Math.min(
    Math.round((totalContributions / loan.reference_outstanding) * 100),
    100
  );

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
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              Principal
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatLoanCurrency(loan.principal, loan.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <Percent className="h-3 w-3" />
              ROI (Annual)
            </p>
            <p className="text-lg font-bold text-foreground">
              {loan.roi}%
            </p>
          </div>
        </div>

        <div className="border-t border-blue-200/60 pt-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                Outstanding ({format(new Date(loan.reference_date), 'MMM d, yyyy')})
              </p>
              <p className="text-xl font-bold text-foreground">
                {formatLoanCurrency(loan.reference_outstanding, loan.currency)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <ArrowDownCircle className="h-3 w-3" />
                Paid Since
              </p>
              <p className="text-xl font-bold text-green-600">
                {totalContributions > 0
                  ? `-${formatLoanCurrency(totalContributions, loan.currency)}`
                  : formatLoanCurrency(0, loan.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-blue-200/60 pt-3">
          <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
            <TrendingDown className="h-3 w-3" />
            Current Outstanding
          </p>
          <p className="text-2xl font-bold text-foreground">
            {formatLoanCurrency(currentOutstanding, loan.currency)}
          </p>
        </div>

        <div className="border-t border-blue-200/60 pt-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Repayment Progress</p>
            <span className="text-xs font-semibold text-blue-700">{repaidPercent}% repaid</span>
          </div>
          <div className="w-full bg-blue-100 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${repaidPercent}%` }}
            />
          </div>
          {repaidPercent === 0 && (
            <p className="text-xs text-muted-foreground mt-1">Make your first contribution to track progress</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 border-t border-blue-200/60 pt-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Projected ({lastProjectionMonth})
            </p>
            <p className="text-lg font-bold text-amber-600">
              {formatLoanCurrency(projectedOutstanding, loan.currency)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
              <TrendingDown className="h-3 w-3 text-red-400" />
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
