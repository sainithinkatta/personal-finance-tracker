import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTimeChart } from './charts/ExpenseTimeChart';
import { ExpenseCategoryChart } from './charts/ExpenseCategoryChart';
import SummaryCards from './dashboard/SummaryCards';
import { BankWiseCategoryBreakdown } from './dashboard/BankWiseCategoryBreakdown';
import { BudgetSummary } from './dashboard/BudgetSummary';
import EmptyState from './dashboard/EmptyState';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { useBankWiseBreakdown } from '@/hooks/useBankWiseBreakdown';
import { PieChart, BarChart3, Receipt } from 'lucide-react';

interface DashboardProps {
  expenses: Expense[];
  selectedCurrency: string;
}

const Dashboard: React.FC<DashboardProps> = ({ expenses, selectedCurrency }) => {
  const currentMonthLabel = format(new Date(), 'MMM yyyy').toUpperCase();

  const currencyFilteredExpenses = useMemo(() => 
    expenses.filter(e => e.currency === selectedCurrency),
    [expenses, selectedCurrency]
  );

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

  const { bankAccounts } = useBankAccounts();
  const bankWiseBreakdown = useBankWiseBreakdown(currentMonthExpenses, bankAccounts);

  return (
    <div className="space-y-6">
      {/* Empty State */}
      {currencyFilteredExpenses.length === 0 && (
        <Card className="bg-card border border-dashed border-border">
          <EmptyState
            icon={Receipt}
            title="No transactions yet"
            description={`Add your first ${selectedCurrency} expense or income to see your analytics here.`}
          />
        </Card>
      )}

      {/* Summary Cards */}
      <SummaryCards 
        expenses={currentMonthExpenses} 
        currentMonthLabel={currentMonthLabel} 
        currency={selectedCurrency}
      />

      {/* Analytics Grid - 2 Columns on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending by Category Chart */}
        <div className="h-[400px] lg:h-[440px]">
          <Card className="bg-card border border-border/60 shadow-sm h-full flex flex-col">
            <CardHeader className="pb-2 px-4 pt-4 flex-shrink-0">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-accent" />
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 min-h-0">
              <div className="h-full">
                {currentMonthExpenses.length > 0 ? (
                  <ExpenseCategoryChart expenses={currentMonthExpenses} currency={selectedCurrency} />
                ) : (
                  <EmptyState
                    icon={PieChart}
                    title="No data yet"
                    description={`No expenses recorded for ${currentMonthLabel}`}
                    className="h-full"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bank-wise Category Breakdown */}
        <div className="h-[400px] lg:h-[440px]">
          <BankWiseCategoryBreakdown
            data={bankWiseBreakdown}
            currentMonthLabel={currentMonthLabel}
            currency={selectedCurrency}
          />
        </div>

        {/* Expense Trends Chart */}
        <div className="h-full">
          <Card className="bg-card border border-border/60 shadow-sm h-full">
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                Expense Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full max-w-xs grid-cols-3 mb-4 bg-muted/50 p-1 h-9">
                  <TabsTrigger
                    value="daily"
                    className="text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    Daily
                  </TabsTrigger>
                  <TabsTrigger
                    value="monthly"
                    className="text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger
                    value="yearly"
                    className="text-xs font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm"
                  >
                    Yearly
                  </TabsTrigger>
                </TabsList>

                {currencyFilteredExpenses.length > 0 ? (
                  <>
                    <TabsContent value="daily" className="mt-0">
                      <div className="h-[280px] lg:h-[320px]">
                        <ExpenseTimeChart expenses={currencyFilteredExpenses} groupBy="day" currency={selectedCurrency} />
                      </div>
                    </TabsContent>
                    <TabsContent value="monthly" className="mt-0">
                      <div className="h-[280px] lg:h-[320px]">
                        <ExpenseTimeChart expenses={currencyFilteredExpenses} groupBy="month" currency={selectedCurrency} />
                      </div>
                    </TabsContent>
                    <TabsContent value="yearly" className="mt-0">
                      <div className="h-[280px] lg:h-[320px]">
                        <ExpenseTimeChart expenses={currencyFilteredExpenses} groupBy="year" currency={selectedCurrency} />
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <EmptyState
                    icon={BarChart3}
                    title="No trend data"
                    description="Add some expenses to see your spending trends over time"
                    className="h-[280px]"
                  />
                )}
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Budget Summary */}
        <div className="h-[400px] lg:h-[440px]">
          <BudgetSummary
            expenses={currentMonthExpenses}
            currency={selectedCurrency}
          />
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
