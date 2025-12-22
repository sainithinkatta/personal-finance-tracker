import React, { useState, useMemo } from 'react';
import { CreditCard as CreditCardIcon, TrendingDown, Calculator, Edit2, DollarSign, Percent, Calendar, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { bankAccountsToCreditCards, getCreditSummary, calculatePayoff } from '@/utils/payoffCalculations';
import PayoffPlanner from './PayoffPlanner';
import { CURRENCIES } from '@/types/expense';

const CreditAnalysisDashboard: React.FC = () => {
  const { bankAccounts, isLoading } = useBankAccounts();
  const [showPlanner, setShowPlanner] = useState(false);
  
  // Get available currencies from credit accounts
  const availableCurrencies = useMemo(() => {
    const creditAccounts = bankAccounts.filter(acc => acc.account_type === 'Credit');
    const currencies = [...new Set(creditAccounts.map(acc => acc.currency || 'USD'))];
    return currencies.length > 0 ? currencies : ['USD'];
  }, [bankAccounts]);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(availableCurrencies[0] || 'USD');

  // Filter credit cards by selected currency
  const creditCards = useMemo(
    () => bankAccountsToCreditCards(bankAccounts, selectedCurrency), 
    [bankAccounts, selectedCurrency]
  );
  
  const summary = useMemo(() => getCreditSummary(creditCards), [creditCards]);
  
  // Quick estimate using avalanche with no extra payment
  const quickEstimate = useMemo(() => {
    if (creditCards.length === 0) return null;
    // Only calculate if all cards have valid minimum payments
    if (summary.cardsMissingMinPayment.length > 0) return null;
    return calculatePayoff(creditCards, 'avalanche', 0);
  }, [creditCards, summary.cardsMissingMinPayment]);

  const getCurrencySymbol = (currency: string) => {
    const curr = CURRENCIES.find(c => c.code === currency);
    return curr?.symbol || currency;
  };

  const formatCurrency = (amount: number, currency: string = selectedCurrency) => {
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

  // Check if there are any credit accounts at all
  const allCreditCards = bankAccountsToCreditCards(bankAccounts);
  
  if (allCreditCards.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <CreditCardIcon className="h-12 w-12 text-muted-foreground mb-4" />
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

  return (
    <div className="space-y-6">
      {/* Header with Currency Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Credit Analysis</h2>
          <p className="text-sm text-muted-foreground">Track and plan your credit card payoff</p>
        </div>
        {availableCurrencies.length > 1 && (
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableCurrencies.map(currency => (
                <SelectItem key={currency} value={currency}>
                  {getCurrencySymbol(currency)} {currency}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Missing Data Warning */}
      {summary.hasMissingData && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {summary.cardsMissingMinPayment.length > 0 && summary.cardsMissingApr.length > 0 
              ? 'Some cards are missing APR and minimum payment data. '
              : summary.cardsMissingMinPayment.length > 0 
                ? 'Some cards are missing minimum payment data. '
                : 'Some cards are missing APR data. '}
            Edit those cards to enable accurate payoff planning.
          </AlertDescription>
        </Alert>
      )}

      {/* No cards for selected currency */}
      {creditCards.length === 0 && allCreditCards.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No credit cards found for {selectedCurrency}. Select a different currency or add a {selectedCurrency} credit account.
          </AlertDescription>
        </Alert>
      )}

      {creditCards.length > 0 && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  Total Balance
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
                  Min. Payments
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
                  Avg. APR
                </div>
                <p className="text-xl lg:text-2xl font-bold">
                  {summary.weightedAverageApr.toFixed(1)}%
                </p>
                <p className="text-xs text-muted-foreground">weighted by balance</p>
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

          {/* Open Planner Button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowPlanner(true)} 
              className="gap-2"
              disabled={summary.cardsMissingMinPayment.length > 0}
            >
              <Calculator className="h-4 w-4" />
              Open Payoff Planner
            </Button>
          </div>

          {/* Credit Cards List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CreditCardIcon className="h-4 w-4" />
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
                // Use the provided flags - 0% APR is valid, only flag truly missing data
                const hasMissingApr = !card.aprProvided;
                const hasMissingMinPayment = !card.minimumPaymentProvided;

                return (
                  <div
                    key={card.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-3 ${
                      (hasMissingApr || hasMissingMinPayment) ? 'border-destructive/50 bg-destructive/5' : ''
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="font-medium truncate">{card.name}</h4>
                        <Badge variant="outline" className="text-xs shrink-0">
                          {card.apr}% APR
                        </Badge>
                        {hasMissingApr && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            Missing APR
                          </Badge>
                        )}
                        {hasMissingMinPayment && (
                          <Badge variant="destructive" className="text-xs shrink-0">
                            Missing Min Payment
                          </Badge>
                        )}
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

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center px-4">
            These payoff estimates are for planning only. Consult your card statements for exact balances and interest charges.
          </p>
        </>
      )}
    </div>
  );
};

export default CreditAnalysisDashboard;
