import React, { useState, useMemo } from 'react';
import { ArrowLeft, TrendingUp, Target, DollarSign, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  calculatePayoff,
  calculateRequiredExtraForGoal,
  getCreditSummary,
} from '@/utils/payoffCalculations';
import { CreditCard, PayoffStrategy } from '@/types/creditAnalysis';
import { CURRENCIES } from '@/types/expense';

interface PayoffPlannerProps {
  creditCards: CreditCard[];
  onBack: () => void;
}

const PayoffPlanner: React.FC<PayoffPlannerProps> = ({ creditCards, onBack }) => {
  const [strategy, setStrategy] = useState<PayoffStrategy>('avalanche');
  const [extraPayment, setExtraPayment] = useState<string>('0');
  const [goalMode, setGoalMode] = useState(false);
  const [targetMonths, setTargetMonths] = useState<string>('12');

  const summary = useMemo(() => getCreditSummary(creditCards), [creditCards]);
  const primaryCurrency = creditCards[0]?.currency || 'USD';

  const getCurrencySymbol = (currency: string) => {
    const curr = CURRENCIES.find(c => c.code === currency);
    return curr?.symbol || currency;
  };

  const formatCurrency = (amount: number, currency: string = primaryCurrency) => {
    return `${getCurrencySymbol(currency)}${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Validate inputs - need minimum payments to run simulation
  const hasValidMinimums = creditCards.every(c => c.minimumPaymentProvided && c.minimumPayment > 0);

  // Calculate minimum-only baseline for comparison
  const minimumOnlyResult = useMemo(() => {
    if (!hasValidMinimums) return null;
    return calculatePayoff(creditCards, strategy, 0);
  }, [creditCards, strategy, hasValidMinimums]);

  // Calculate required extra for goal mode
  const requiredExtraForGoal = useMemo(() => {
    if (!goalMode || !hasValidMinimums) return 0;
    const months = parseInt(targetMonths) || 12;
    return calculateRequiredExtraForGoal(creditCards, strategy, months);
  }, [goalMode, targetMonths, creditCards, strategy, hasValidMinimums]);

  // Calculate payoff result
  const payoffResult = useMemo(() => {
    if (!hasValidMinimums) return null;
    const extra = goalMode ? requiredExtraForGoal : parseFloat(extraPayment) || 0;
    return calculatePayoff(creditCards, strategy, extra);
  }, [creditCards, strategy, extraPayment, goalMode, requiredExtraForGoal, hasValidMinimums]);

  // Get ordered cards for display
  const orderedCards = useMemo(() => {
    if (!payoffResult || !payoffResult.isPayoffPossible) return creditCards;
    return payoffResult.payoffOrder.map(id => creditCards.find(c => c.id === id)!).filter(Boolean);
  }, [payoffResult, creditCards]);

  // Calculate savings vs minimum-only
  const savings = useMemo(() => {
    if (!minimumOnlyResult?.isPayoffPossible || !payoffResult?.isPayoffPossible) return null;
    return {
      monthsSaved: minimumOnlyResult.totalMonths - payoffResult.totalMonths,
      interestSaved: minimumOnlyResult.totalInterestPaid - payoffResult.totalInterestPaid,
    };
  }, [minimumOnlyResult, payoffResult]);

  if (!hasValidMinimums) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>

        <Card className="border-destructive">
          <CardContent className="py-8 text-center">
            <h3 className="text-lg font-semibold text-destructive mb-2">Missing Information</h3>
            <p className="text-muted-foreground">
              All credit cards must have a minimum payment greater than 0 to run the planner.
              Please edit your credit accounts to add minimum payment amounts.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const effectiveExtra = goalMode ? requiredExtraForGoal : parseFloat(extraPayment) || 0;
  const totalMonthlyPayment = summary.totalMinimumPayments + effectiveExtra;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <h2 className="text-lg font-semibold">Payoff Planner</h2>
        <div className="w-20" /> {/* Spacer for centering */}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Settings Panel */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Strategy Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Payoff Strategy</Label>
              <RadioGroup value={strategy} onValueChange={(v) => setStrategy(v as PayoffStrategy)}>
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="avalanche" id="avalanche" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="avalanche" className="font-medium cursor-pointer">Avalanche</Label>
                    <p className="text-xs text-muted-foreground">Highest APR first. Saves most on interest.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <RadioGroupItem value="snowball" id="snowball" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="snowball" className="font-medium cursor-pointer">Snowball</Label>
                    <p className="text-xs text-muted-foreground">Smallest balance first. Quick wins for motivation.</p>
                  </div>
                </div>
              </RadioGroup>
            </div>

            {/* Goal Mode Toggle */}
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <Label className="font-medium">Goal Mode</Label>
                  <p className="text-xs text-muted-foreground">Set a target payoff date</p>
                </div>
              </div>
              <Switch checked={goalMode} onCheckedChange={setGoalMode} />
            </div>

            {/* Extra Payment / Goal Input */}
            {goalMode ? (
              <div className="space-y-2">
                <Label htmlFor="targetMonths">Debt Free In (Months)</Label>
                <Input
                  id="targetMonths"
                  type="number"
                  min="1"
                  max="360"
                  value={targetMonths}
                  onChange={(e) => setTargetMonths(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Required extra: <span className="font-semibold text-primary">{formatCurrency(requiredExtraForGoal)}/mo</span>
                  <br />
                  <span className="text-muted-foreground/80">(on top of {formatCurrency(summary.totalMinimumPayments)} minimums)</span>
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="extraPayment">Extra Payment / Month</Label>
                <Input
                  id="extraPayment"
                  type="number"
                  min="0"
                  step="10"
                  value={extraPayment}
                  onChange={(e) => setExtraPayment(e.target.value)}
                  placeholder="0.00"
                />
                <p className="text-xs text-muted-foreground">
                  Additional payment beyond minimum requirements
                </p>
              </div>
            )}

            {/* Summary */}
            <div className="p-3 bg-muted rounded-lg space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Balance</span>
                <span className="font-medium">{formatCurrency(summary.totalBalance)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Min. Payments</span>
                <span>{formatCurrency(summary.totalMinimumPayments)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Extra Payment</span>
                <span>{formatCurrency(effectiveExtra)}</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-sm font-medium">
                <span>Total Monthly Payment</span>
                <span className="text-primary">{formatCurrency(totalMonthlyPayment)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Panel */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Estimated Payoff Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {payoffResult && (
              <Tabs defaultValue="summary" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="order">Payoff Order</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                </TabsList>

                <TabsContent value="summary" className="space-y-4">
                  {/* Negative Amortization Warning */}
                  {payoffResult.negativeAmortization && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Debt Cannot Be Paid Off</AlertTitle>
                      <AlertDescription className="mt-2 space-y-2">
                        <p>
                          Your current total payment of {formatCurrency(totalMonthlyPayment)}/mo is less than 
                          the monthly interest being charged. Your debt will grow over time.
                        </p>
                        {payoffResult.minimumExtraRequired && payoffResult.minimumExtraRequired > 0 && (
                          <p className="font-medium">
                            To make progress, increase your extra payment to at least {formatCurrency(payoffResult.minimumExtraRequired)}/mo.
                          </p>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Payoff Not Possible (max months reached) */}
                  {!payoffResult.isPayoffPossible && !payoffResult.negativeAmortization && (
                    <Alert variant="destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Payoff Timeline Too Long</AlertTitle>
                      <AlertDescription>
                        With your current payments, it would take more than 50 years to pay off this debt.
                        Consider increasing your monthly payment amount.
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Success Results */}
                  {payoffResult.isPayoffPossible && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg text-center">
                          <Calendar className="h-5 w-5 mx-auto mb-2 text-primary" />
                          <p className="text-2xl font-bold text-primary">{payoffResult.totalMonths}</p>
                          <p className="text-xs text-muted-foreground">Est. Months to Debt Free</p>
                        </div>
                        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg text-center">
                          <DollarSign className="h-5 w-5 mx-auto mb-2 text-destructive" />
                          <p className="text-2xl font-bold text-destructive">{formatCurrency(payoffResult.totalInterestPaid)}</p>
                          <p className="text-xs text-muted-foreground">Est. Total Interest</p>
                        </div>
                      </div>

                      <div className="p-4 border rounded-lg space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Total You'll Pay</span>
                          <span className="font-semibold">{formatCurrency(payoffResult.totalPaid)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Est. Debt Free Date</span>
                          <span className="font-semibold">
                            {new Date(Date.now() + payoffResult.totalMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Savings vs Minimum Only */}
                      {savings && (savings.monthsSaved > 0 || savings.interestSaved > 0) && (
                        <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <p className="text-sm font-medium text-green-700 dark:text-green-400 mb-1">
                            {goalMode ? 'With your goal plan' : 'With extra payments'}, compared to minimums only:
                          </p>
                          <div className="flex flex-wrap gap-4 text-sm">
                            {savings.monthsSaved > 0 && (
                              <span>Save <strong>{savings.monthsSaved} months</strong></span>
                            )}
                            {savings.interestSaved > 0 && (
                              <span>Save <strong>{formatCurrency(savings.interestSaved)}</strong> in interest</span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Goal Mode Explanation */}
                      {goalMode && (
                        <p className="text-sm text-muted-foreground">
                          To pay off all debt in {targetMonths} months, you need to pay{' '}
                          <strong>{formatCurrency(requiredExtraForGoal)}/mo extra</strong> beyond your{' '}
                          {formatCurrency(summary.totalMinimumPayments)}/mo minimum payments.
                        </p>
                      )}

                      {/* Non-Goal Mode Explanation */}
                      {!goalMode && effectiveExtra > 0 && (
                        <p className="text-sm text-muted-foreground">
                          With your extra payment of {formatCurrency(effectiveExtra)}/mo on top of minimum payments,
                          you'll be debt-free in {payoffResult.totalMonths} months.
                        </p>
                      )}
                    </>
                  )}
                </TabsContent>

                <TabsContent value="order" className="space-y-3">
                  <p className="text-sm text-muted-foreground mb-4">
                    {strategy === 'avalanche' 
                      ? 'Paying highest APR cards first to minimize interest.'
                      : 'Paying smallest balances first for quick wins.'}
                  </p>
                  {orderedCards.map((card, index) => (
                    <div key={card.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{card.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(card.balance)} • {card.apr}% APR
                        </p>
                      </div>
                      <Badge variant="outline">{card.apr}%</Badge>
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="timeline">
                  {payoffResult.isPayoffPossible ? (
                    <ScrollArea className="h-[400px] pr-4">
                      <div className="space-y-2">
                        {payoffResult.timeline.slice(0, 36).map((month) => (
                          <div key={month.month} className="p-3 border rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium text-sm">Month {month.month}</span>
                              <div className="flex gap-3 text-xs text-muted-foreground">
                                <span>Pay: {formatCurrency(month.totalPayment)}</span>
                                <span>Remaining: {formatCurrency(month.totalRemaining)}</span>
                              </div>
                            </div>
                            <div className="space-y-1">
                              {month.payments.filter(p => p.remainingBalance > 0 || p.payment > 0).map((payment) => (
                                <div key={payment.cardId} className="flex justify-between text-xs">
                                  <span className="text-muted-foreground truncate max-w-[120px]">{payment.cardName}</span>
                                  <span>
                                    -{formatCurrency(payment.payment)} → {formatCurrency(payment.remainingBalance)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                        {payoffResult.timeline.length > 36 && (
                          <p className="text-center text-sm text-muted-foreground py-4">
                            ... and {payoffResult.timeline.length - 36} more months
                          </p>
                        )}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>Timeline not available. Increase your payment to see the payoff schedule.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center px-4">
        These payoff timelines and interest numbers are estimates for planning only. 
        Real credit card interest may vary based on daily balance calculations. 
        Always rely on your lender or card statement for exact amounts.
      </p>
    </div>
  );
};

export default PayoffPlanner;
