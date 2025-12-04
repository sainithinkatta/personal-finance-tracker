import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExpenseTimeChart } from './charts/ExpenseTimeChart';
import { ExpenseCategoryChart } from './charts/ExpenseCategoryChart';
import SummaryCards from './dashboard/SummaryCards';
import { BankWiseCategoryBreakdown } from './dashboard/BankWiseCategoryBreakdown';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useBankWiseBreakdown } from '@/hooks/useBankWiseBreakdown';

interface DashboardProps {
  expenses: Expense[];
}

// Helper to get currency symbol
const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const currentMonthLabel = format(new Date(), 'MMM yyyy').toUpperCase();

  // Currency filter state - default will be set based on user's data
  const [selectedCurrency, setSelectedCurrency] = useState<string>('USD');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Determine default currency based on user's expense data (run once)
  useEffect(() => {
    if (!hasInitialized && expenses.length > 0) {
      const currencies = [...new Set(expenses.map(e => e.currency))];
      if (currencies.length === 1) {
        setSelectedCurrency(currencies[0]);
      } else {
        setSelectedCurrency('USD');
      }
      setHasInitialized(true);
    } else if (!hasInitialized && expenses.length === 0) {
      setHasInitialized(true);
    }
  }, [expenses, hasInitialized]);

  // Filter expenses by selected currency
  const currencyFilteredExpenses = useMemo(() => 
    expenses.filter(e => e.currency === selectedCurrency),
    [expenses, selectedCurrency]
  );

  // Filter to current month for summary cards and category chart
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthExpenses = useMemo(() => 
    currencyFilteredExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    }),
    [currencyFilteredExpenses, currentMonth, currentYear]
  );

  // Fetch bank accounts for bank-wise breakdown
  const { bankAccounts } = useBankAccounts();

  // Calculate bank-wise category breakdown for current month (filtered by currency)
  const bankWiseBreakdown = useBankWiseBreakdown(currentMonthExpenses, bankAccounts);

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
      {/* Header with Currency Filter */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">Dashboard</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground hidden sm:inline">Currency:</span>
          <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
            <SelectTrigger className="w-[100px] h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-background">
              <SelectItem value="USD">$ USD</SelectItem>
              <SelectItem value="INR">₹ INR</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Empty State Message */}
      {currencyFilteredExpenses.length === 0 && (
        <div className="text-center py-8 bg-muted/30 rounded-lg border border-dashed border-muted-foreground/30">
          <p className="text-muted-foreground">
            No {selectedCurrency} transactions yet. Add an expense or income in {selectedCurrency} to see analytics.
          </p>
        </div>
      )}

      {/* Summary Cards */}
      <div className="mb-6 md:mb-8">
        <SummaryCards 
          expenses={currentMonthExpenses} 
          currentMonthLabel={currentMonthLabel} 
          currency={selectedCurrency}
        />
      </div>

      {/* Charts Section - Mobile Responsive */}
      <div className="space-y-4">
        {/* Top Row: Category Chart + Bank-wise Breakdown */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Spending by Category Chart */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="px-3 py-2 border-b border-gray-100">
              <CardTitle className="text-sm md:text-base font-medium text-gray-800 flex items-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                <span className="truncate">Spending by Category ({currentMonthLabel})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-3">
              <div className="h-[300px] md:h-[340px] w-full bg-gray-50/30 rounded-md p-2 md:p-2 flex items-center justify-center">
                {currentMonthExpenses.length > 0 ? (
                  <ExpenseCategoryChart expenses={currentMonthExpenses} currency={selectedCurrency} />
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-xs md:text-sm">No data for {currentMonthLabel}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Bank-wise Category Breakdown - Now side by side with Category Chart */}
          <div className="h-[340px] md:h-[396px] overflow-hidden">
            <BankWiseCategoryBreakdown
              data={bankWiseBreakdown}
              currentMonthLabel={currentMonthLabel}
              currency={selectedCurrency}
            />
          </div>
        </div>

        {/* Bottom Row: Expense Trends Chart - Full Width */}
        <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
          <CardHeader className="px-3 py-2 border-b border-gray-100">
            <CardTitle className="text-sm md:text-base font-medium text-gray-800 flex items-center">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
              Expense Trends
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 md:p-3">
            <Tabs defaultValue="daily" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-3 bg-gray-50/80 p-0.5 rounded-md h-8 md:h-9">
                <TabsTrigger
                  value="daily"
                  className="text-xs md:text-sm font-medium rounded-sm py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[32px]"
                >
                  Daily
                </TabsTrigger>
                <TabsTrigger
                  value="monthly"
                  className="text-xs md:text-sm font-medium rounded-sm py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[32px]"
                >
                  Monthly
                </TabsTrigger>
                <TabsTrigger
                  value="yearly"
                  className="text-xs md:text-sm font-medium rounded-sm py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm min-h-[32px]"
                >
                  Yearly
                </TabsTrigger>
              </TabsList>
              <TabsContent value="daily" className="mt-0">
                <div className="h-[250px] md:h-[300px] w-full bg-gray-50/30 rounded-md p-1 md:p-2">
                  <ExpenseTimeChart expenses={currencyFilteredExpenses} groupBy="day" currency={selectedCurrency} />
                </div>
              </TabsContent>
              <TabsContent value="monthly" className="mt-0">
                <div className="h-[250px] md:h-[300px] w-full bg-gray-50/30 rounded-md p-1 md:p-2">
                  <ExpenseTimeChart expenses={currencyFilteredExpenses} groupBy="month" currency={selectedCurrency} />
                </div>
              </TabsContent>
              <TabsContent value="yearly" className="mt-0">
                <div className="h-[250px] md:h-[300px] w-full bg-gray-50/30 rounded-md p-1 md:p-2">
                  <ExpenseTimeChart expenses={currencyFilteredExpenses} groupBy="year" currency={selectedCurrency} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
