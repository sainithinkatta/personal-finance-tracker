
import React, { useState, useMemo } from 'react';
import { CreditCard, TrendingDown, Calculator, Edit2, DollarSign, Percent, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { bankAccountsToCreditCards, getCreditSummary, calculatePayoff } from '@/utils/payoffCalculations';
import PayoffPlanner from './PayoffPlanner';
import { CURRENCIES } from '@/types/expense';

const CreditAnalysisDashboard: React.FC = () => {
  const { bankAccounts, isLoading } = useBankAccounts();
  const [showPlanner, setShowPlanner] = useState(false);

  const creditCards = useMemo(() => bankAccountsToCreditCards(bankAccounts), [bankAccounts]);
  const summary = useMemo(() => getCreditSummary(creditCards), [creditCards]);
  
  // Quick estimate using avalanche with no extra payment
  const quickEstimate = useMemo(() => {
    if (creditCards.length === 0) return null;
    return calculatePayoff(creditCards, 'avalanche', 0);
  }, [creditCards]);

  const getCurrencySymbol = (currency: string) => {
    const curr = CURRENCIES.find(c => c.code === currency);
    return curr?.symbol || currency;
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  if (creditCards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Credit Card Dues</h3>
          <p className="text-muted-foreground text-sm max-w-md">
            Add credit bank accounts with outstanding balances to see your payoff analysis here.
            Credit accounts will automatically appear when they have a balance.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (showPlanner) {
    return <PayoffPlanner creditCards={creditCards} onBack={() => setShowPlanner(false)} />;
  }

  // Get primary currency (most common among credit cards)
  const primaryCurrency = creditCards[0]?.currency || 'USD';

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              Total Balance
            </div>
            <p className="text-xl lg:text-2xl font-bold text-destructive">
              {formatCurrency(summary.totalBalance, primaryCurrency)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <TrendingDown className="h-3.5 w-3.5" />
              Min. Payments
            </div>
            <p className="text-xl lg:text-2xl font-bold">
              {formatCurrency(summary.totalMinimumPayments, primaryCurrency)}
            </p>
            <p className="text-xs text-muted-foreground">/month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Percent className="h-3.5 w-3.5" />
              Avg. APR
            </div>
            <p className="text-xl lg:text-2xl font-bold">
              {summary.averageApr.toFixed(1)}%
            </p>
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
                : 'N/A'}
            </p>
            {quickEstimate && quickEstimate.isPayoffPossible && (
              <p className="text-xs text-muted-foreground">
                Interest: {formatCurrency(quickEstimate.totalInterestPaid, primaryCurrency)}
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Open Planner Button */}
      <div className="flex justify-end">
        <Button onClick={() => setShowPlanner(true)} className="gap-2">
          <Calculator className="h-4 w-4" />
          Open Payoff Planner
        </Button>
      </div>

      {/* Credit Cards List */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Credit Cards ({creditCards.length})
          </CardTitle>
          <CardDescription>
            Your credit accounts with outstanding balances
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {creditCards.map((card) => {
            const account = bankAccounts.find(a => a.id === card.id);
            const utilizationPercent = account?.credit_limit 
              ? (card.balance / account.credit_limit) * 100 
              : 0;

            return (
              <div
                key={card.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium truncate">{card.name}</h4>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {card.apr}% APR
                    </Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>Balance: <span className="text-destructive font-medium">{formatCurrency(card.balance, card.currency)}</span></span>
                    <span>Min: {formatCurrency(card.minimumPayment, card.currency)}/mo</span>
                  </div>

                  {account?.credit_limit && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Utilization</span>
                        <span>{utilizationPercent.toFixed(0)}%</span>
                      </div>
                      <Progress 
                        value={Math.min(utilizationPercent, 100)} 
                        className="h-1.5"
                      />
                    </div>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => {
                      // This triggers the bank edit flow - we'll need to handle this via the BankAccountsList
                      // For now, show a hint
                      const event = new CustomEvent('edit-bank-account', { detail: { id: card.id } });
                      window.dispatchEvent(event);
                    }}
                  >
                    <Edit2 className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreditAnalysisDashboard;
