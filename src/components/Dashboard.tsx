
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTimeChart } from './charts/ExpenseTimeChart';
import { ExpenseCategoryChart } from './charts/ExpenseCategoryChart';
import BankAccountsSnapshot from './dashboard/BankAccountsSnapshot';
import SummaryCards from './dashboard/SummaryCards';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';

interface DashboardProps {
  expenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const currentMonthLabel = format(new Date(), 'MMMM yyyy');
  
  // Filter expenses to current month for summary cards and category chart
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  return (
    <div className="p-6 space-y-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
      {/* Summary Cards */}
      <div className="mb-8">
        <SummaryCards expenses={currentMonthExpenses} currentMonthLabel={currentMonthLabel} />
      </div>

      {/* Charts Section - Full Width */}
      <div className="space-y-4">
        {/* Charts Grid - Full Width Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Trends Chart - Show All Months */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="px-3 py-2 border-b border-gray-100">
              <CardTitle className="text-sm font-medium text-gray-800 flex items-center">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                Expense Trends
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <Tabs defaultValue="daily" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-3 bg-gray-50/80 p-0.5 rounded-md h-7">
                  <TabsTrigger 
                    value="daily" 
                    className="text-xs font-medium rounded-sm py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Daily
                  </TabsTrigger>
                  <TabsTrigger 
                    value="monthly" 
                    className="text-xs font-medium rounded-sm py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Monthly
                  </TabsTrigger>
                  <TabsTrigger 
                    value="yearly" 
                    className="text-xs font-medium rounded-sm py-1 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                  >
                    Yearly
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="mt-0">
                  <div className="h-[300px] w-full bg-gray-50/30 rounded-md p-2">
                    <ExpenseTimeChart expenses={expenses} groupBy="day" />
                  </div>
                </TabsContent>
                <TabsContent value="monthly" className="mt-0">
                  <div className="h-[300px] w-full bg-gray-50/30 rounded-md p-2">
                    <ExpenseTimeChart expenses={expenses} groupBy="month" />
                  </div>
                </TabsContent>
                <TabsContent value="yearly" className="mt-0">
                  <div className="h-[300px] w-full bg-gray-50/30 rounded-md p-2">
                    <ExpenseTimeChart expenses={expenses} groupBy="year" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Spending by Category Chart - Expanded Width */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="px-3 py-2 border-b border-gray-100">
              <CardTitle className="text-sm font-medium text-gray-800 flex items-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                Spending by Category ( {currentMonthLabel} )
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3">
              <div className="h-[340px] w-full bg-gray-50/30 rounded-md p-2 flex items-center justify-center">
                {currentMonthExpenses.length > 0 ? (
                  <ExpenseCategoryChart expenses={currentMonthExpenses} />
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">No data for {currentMonthLabel}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bank Accounts Section - Full Width Below */}
        <div className="mt-4">
          <BankAccountsSnapshot />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
