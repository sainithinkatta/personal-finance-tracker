import React from 'react';
import { DollarSign, TrendingDown, Percent, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { CreditSummary, PayoffResult } from '@/types/creditAnalysis';
import { CURRENCIES } from '@/types/expense';

interface CreditSummaryCardsProps {
  summary: CreditSummary;
  quickEstimate: PayoffResult | null;
  currency: string;
  isSingleCard?: boolean;
}

const CreditSummaryCards: React.FC<CreditSummaryCardsProps> = ({
  summary,
  quickEstimate,
  currency,
  isSingleCard = false,
}) => {
  const getCurrencySymbol = (curr: string) => {
    const found = CURRENCIES.find(c => c.code === curr);
    return found?.symbol || curr;
  };

  const formatCurrency = (amount: number) => {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <DollarSign className="h-3.5 w-3.5" />
            {isSingleCard ? 'Balance' : 'Total Balance'}
          </div>
          <p className="text-xl lg:text-2xl font-bold text-destructive">
            {formatCurrency(summary.totalBalance)}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <TrendingDown className="h-3.5 w-3.5" />
            Min. Payment{!isSingleCard && 's'}
          </div>
          <p className="text-xl lg:text-2xl font-bold">
            {formatCurrency(summary.totalMinimumPayments)}
          </p>
          <p className="text-xs text-muted-foreground">/month</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Percent className="h-3.5 w-3.5" />
            {isSingleCard ? 'APR' : 'Avg. APR'}
          </div>
          <p className="text-xl lg:text-2xl font-bold">
            {isSingleCard 
              ? summary.averageApr.toFixed(1) 
              : summary.weightedAverageApr.toFixed(1)}%
          </p>
          {!isSingleCard && (
            <p className="text-xs text-muted-foreground">weighted by balance</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
            <Calendar className="h-3.5 w-3.5" />
            Est. Payoff
          </div>
          <p className="text-xl lg:text-2xl font-bold">
            {quickEstimate?.isPayoffPossible 
              ? `${quickEstimate.totalMonths} mo`
              : quickEstimate?.negativeAmortization
                ? '∞'
                : 'N/A'}
          </p>
          {quickEstimate && quickEstimate.isPayoffPossible && (
            <p className="text-xs text-muted-foreground">
              Est. Interest: {formatCurrency(quickEstimate.totalInterestPaid)}
            </p>
          )}
          {quickEstimate?.negativeAmortization && (
            <p className="text-xs text-destructive">Debt growing</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditSummaryCards;
