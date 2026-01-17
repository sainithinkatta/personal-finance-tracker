import React, { useState, useMemo, useEffect } from 'react';
import { CreditCard as CreditCardIcon, Calculator, AlertTriangle, Info } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import CreditCardTabs from './CreditCardTabs';
import SelectedCardHeader from './SelectedCardHeader';
import CreditSummaryCards from './CreditSummaryCards';
import CardTransactions from './CardTransactions';
import { CURRENCIES } from '@/types/expense';
import { CreditCard } from '@/types/creditAnalysis';

const CreditAnalysisDashboard: React.FC = () => {
  const { bankAccounts, isLoading } = useBankAccounts();
  const [showPlanner, setShowPlanner] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | 'all'>('all');
  
  // Get available currencies from credit accounts
  const availableCurrencies = useMemo(() => {
    const creditAccounts = bankAccounts.filter(acc => acc.account_type === 'Credit');
    const currencies = [...new Set(creditAccounts.map(acc => acc.currency || 'USD'))];
    return currencies.length > 0 ? currencies : ['USD'];
  }, [bankAccounts]);

  const [selectedCurrency, setSelectedCurrency] = useState<string>(availableCurrencies[0] || 'USD');

  // Update currency when available currencies change
  useEffect(() => {
    if (!availableCurrencies.includes(selectedCurrency)) {
      setSelectedCurrency(availableCurrencies[0] || 'USD');
    }
  }, [availableCurrencies, selectedCurrency]);

  // Get credit accounts for current currency
  const creditAccounts = useMemo(() => {
    return bankAccounts.filter(
      acc => acc.account_type === 'Credit' && (acc.currency || 'USD') === selectedCurrency
    );
  }, [bankAccounts, selectedCurrency]);

  // All credit cards for current currency
  const allCreditCards = useMemo(
    () => bankAccountsToCreditCards(bankAccounts, selectedCurrency), 
    [bankAccounts, selectedCurrency]
  );

  // Reset selected card when currency changes or card is deleted
  useEffect(() => {
    if (selectedCardId !== 'all' && !creditAccounts.find(a => a.id === selectedCardId)) {
      setSelectedCardId('all');
    }
  }, [creditAccounts, selectedCardId]);

  // Get the selected account and credit card
  const selectedAccount = useMemo(() => {
    if (selectedCardId === 'all') return null;
    return creditAccounts.find(a => a.id === selectedCardId) || null;
  }, [creditAccounts, selectedCardId]);

  const selectedCreditCard = useMemo(() => {
    if (selectedCardId === 'all') return null;
    return allCreditCards.find(c => c.id === selectedCardId) || null;
  }, [allCreditCards, selectedCardId]);

  // Cards to use for summary (single card or all)
  const cardsForSummary: CreditCard[] = useMemo(() => {
    if (selectedCardId === 'all') {
      return allCreditCards;
    }
    return selectedCreditCard ? [selectedCreditCard] : [];
  }, [selectedCardId, allCreditCards, selectedCreditCard]);

  // Summary for current selection
  const summary = useMemo(() => getCreditSummary(cardsForSummary), [cardsForSummary]);
  
  // Quick estimate using avalanche with no extra payment
  const quickEstimate = useMemo(() => {
    if (cardsForSummary.length === 0) return null;
    if (summary.cardsMissingMinPayment.length > 0) return null;
    return calculatePayoff(cardsForSummary, 'avalanche', 0);
  }, [cardsForSummary, summary.cardsMissingMinPayment]);

  const getCurrencySymbol = (currency: string) => {
    const curr = CURRENCIES.find(c => c.code === currency);
    return curr?.symbol || currency;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-16 bg-muted animate-pulse rounded-lg" />
        <div className="h-32 bg-muted animate-pulse rounded-lg" />
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  // Check if there are any credit accounts at all
  const allCreditAccounts = bankAccounts.filter(acc => acc.account_type === 'Credit');
  
  if (allCreditAccounts.length === 0) {
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

  // Show planner
  if (showPlanner) {
    // Pass filtered cards based on selection
    const plannerCards = selectedCardId === 'all' ? allCreditCards : cardsForSummary;
    return <PayoffPlanner creditCards={plannerCards} onBack={() => setShowPlanner(false)} />;
  }

  const isSingleCard = selectedCardId !== 'all';

  return (
    <div className="space-y-6">
      {/* Header with Currency Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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

      {/* Card Tabs Strip */}
      <CreditCardTabs
        creditAccounts={creditAccounts}
        selectedCardId={selectedCardId}
        onSelectCard={setSelectedCardId}
        currency={selectedCurrency}
      />

      {/* No cards for selected currency */}
      {creditAccounts.length === 0 && allCreditAccounts.length > 0 && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            No credit cards found for {selectedCurrency}. Select a different currency or add a {selectedCurrency} credit account.
          </AlertDescription>
        </Alert>
      )}

      {creditAccounts.length > 0 && (
        <>
          {/* Selected Card Header (only for single card selection) */}
          {isSingleCard && selectedAccount && selectedCreditCard && (
            <Card>
              <CardContent className="pt-4">
                <SelectedCardHeader
                  account={selectedAccount}
                  creditCard={selectedCreditCard}
                  currency={selectedCurrency}
                />
              </CardContent>
            </Card>
          )}

          {/* Missing Data Warning */}
          {summary.hasMissingData && (
            <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {summary.cardsMissingMinPayment.length > 0 && summary.cardsMissingApr.length > 0 
                  ? `${isSingleCard ? 'This card is' : 'Some cards are'} missing APR and minimum payment data. `
                  : summary.cardsMissingMinPayment.length > 0 
                    ? `${isSingleCard ? 'This card is' : 'Some cards are'} missing minimum payment data. `
                    : `${isSingleCard ? 'This card is' : 'Some cards are'} missing APR data. `}
                Edit {isSingleCard ? 'this card' : 'those cards'} to enable accurate payoff planning.
              </AlertDescription>
            </Alert>
          )}

          {/* Summary Cards */}
          <CreditSummaryCards
            summary={summary}
            quickEstimate={quickEstimate}
            currency={selectedCurrency}
            isSingleCard={isSingleCard}
          />

          {/* Open Planner Button */}
          <div className="flex justify-end">
            <Button 
              onClick={() => setShowPlanner(true)} 
              className="gap-2"
              disabled={summary.cardsMissingMinPayment.length > 0}
            >
              <Calculator className="h-4 w-4" />
              {isSingleCard ? 'Plan Payoff for This Card' : 'Open Payoff Planner'}
            </Button>
          </div>

          {/* Card Transactions (only for single card selection) */}
          {isSingleCard && selectedAccount && (
            <CardTransactions
              cardId={selectedAccount.id}
              cardName={selectedAccount.name || 'Credit Card'}
              currency={selectedCurrency}
            />
          )}

          {/* All Cards List (only shown when "All Cards" is selected) */}
          {!isSingleCard && allCreditCards.length > 1 && (
            <Card>
              <CardContent className="pt-4 space-y-3">
                <p className="text-sm font-medium text-muted-foreground mb-3">
                  Click a card tab above to see detailed information
                </p>
                {allCreditCards.map((card) => {
                  const account = bankAccounts.find(a => a.id === card.id);
                  const utilizationPercent = account?.credit_limit 
                    ? (card.balance / account.credit_limit) * 100 
                    : 0;

                  return (
                    <button
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className="w-full flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors text-left"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <CreditCardIcon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium truncate">{card.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {card.apr}% APR • {getCurrencySymbol(card.currency)}{card.balance.toLocaleString()}
                          </p>
                        </div>
                      </div>
                      {account?.credit_limit && (
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-xs text-muted-foreground">Utilization</p>
                          <p className={`text-sm font-medium ${
                            utilizationPercent > 80 ? 'text-destructive' : 
                            utilizationPercent > 50 ? 'text-yellow-600' : 'text-green-600'
                          }`}>
                            {utilizationPercent.toFixed(0)}%
                          </p>
                        </div>
                      )}
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )}

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
