
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ExpenseTimeChart } from './charts/ExpenseTimeChart';
import { ExpenseCategoryChart } from './charts/ExpenseCategoryChart';
import SummaryCards from './dashboard/SummaryCards';
import { Expense } from '@/types/expense';
import { format } from 'date-fns';

interface DashboardProps {
  expenses: Expense[];
}

const Dashboard: React.FC<DashboardProps> = ({ expenses }) => {
  const currentMonthLabel = format(new Date(), 'MMM yyyy').toUpperCase();
  
  // Filter expenses to current month for summary cards and category chart
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
      {/* Summary Cards */}
      <div className="mb-6 md:mb-8">
        <SummaryCards expenses={currentMonthExpenses} currentMonthLabel={currentMonthLabel} />
      </div>

      {/* Charts Section - Mobile Responsive */}
      <div className="space-y-4">
        {/* Charts Grid - Responsive Stack */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
          {/* Expense Trends Chart - Mobile Responsive */}
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
                    <ExpenseTimeChart expenses={expenses} groupBy="day" />
                  </div>
                </TabsContent>
                <TabsContent value="monthly" className="mt-0">
                  <div className="h-[250px] md:h-[300px] w-full bg-gray-50/30 rounded-md p-1 md:p-2">
                    <ExpenseTimeChart expenses={expenses} groupBy="month" />
                  </div>
                </TabsContent>
                <TabsContent value="yearly" className="mt-0">
                  <div className="h-[250px] md:h-[300px] w-full bg-gray-50/30 rounded-md p-1 md:p-2">
                    <ExpenseTimeChart expenses={expenses} groupBy="year" />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Spending by Category Chart - Mobile Responsive */}
          <Card className="bg-white/90 backdrop-blur-sm border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200">
            <CardHeader className="px-3 py-2 border-b border-gray-100">
              <CardTitle className="text-sm md:text-base font-medium text-gray-800 flex items-center">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                <span className="truncate">Spending by Category ({currentMonthLabel})</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 md:p-3">
              <div className="h-[280px] md:h-[340px] w-full bg-gray-50/30 rounded-md p-1 md:p-2 flex items-center justify-center">
                {currentMonthExpenses.length > 0 ? (
                  <ExpenseCategoryChart expenses={currentMonthExpenses} />
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-xs md:text-sm">No data for {currentMonthLabel}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
