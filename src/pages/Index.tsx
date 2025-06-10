import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Dashboard from '@/components/Dashboard';
import ExpenseList from '@/components/ExpenseList';
import FilterPanel from '@/components/FilterPanel';
import BudgetManager from '@/components/BudgetManager';
import RecurringTransactions from '@/components/RecurringTransactions';
import SavingsGoals from '@/components/SavingsGoals';
import AuthWrapper from '@/components/AuthWrapper';
import Sidebar from '@/components/layout/Sidebar';
import UtilityPanel from '@/components/layout/UtilityPanel';
import FloatingActionButton from '@/components/layout/FloatingActionButton';
import { useExpenses } from '@/hooks/useExpenses';
import { FilterOptions } from '@/types/expense';
import { filterExpenses } from '@/utils/expenseUtils';

const Index = () => {
  const { expenses, isLoading } = useExpenses();
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    category: 'All',
  });

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const filteredExpenses = filterExpenses(expenses, filters);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-sm text-gray-600">Loading your finances...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex w-full">
        {/* Left Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          {/* Content Area */}
          <div className="flex-1 flex">
            {/* Main Content */}
            <div className="flex-1 px-4 py-4">
              <div className="max-w-7xl mx-auto">
                <Tabs defaultValue="dashboard" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-4 bg-white/60 backdrop-blur-sm border border-gray-200/60 shadow-sm rounded-lg p-1">
                    <TabsTrigger 
                      value="dashboard" 
                      className="text-xs font-medium  transition-all data-[state=active]:bg-white data-[state=active] data-[state=active]:text-blue-600"
                    >
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger 
                      value="expenses" 
                      className="text-xs font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active] data-[state=active]:text-blue-600"
                    >
                      Expenses
                    </TabsTrigger>
                    <TabsTrigger 
                      value="budget" 
                      className="text-xs font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active] data-[state=active]:text-blue-600"
                    >
                      Budget
                    </TabsTrigger>
                    <TabsTrigger 
                      value="recurring" 
                      className="text-xs font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active] data-[state=active]:text-blue-600"
                    >
                      Recurring
                    </TabsTrigger>
                    <TabsTrigger 
                      value="savings" 
                      className="text-xs font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active] data-[state=active]:text-blue-600"
                    >
                      Savings
                    </TabsTrigger>
                    <TabsTrigger 
                      value="loans" 
                      className="text-xs font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active] data-[state=active]:text-blue-600"
                    >
                      Loans
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="dashboard" className="mt-0">
                    {/* Removed wrapper div to prevent duplicate rounded styling */}
                    <Dashboard expenses={filteredExpenses} />
                  </TabsContent>
                  
                  <TabsContent value="expenses" className="mt-0">
                    <div className="space-y-4">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm p-4">
                        <div className="border-b border-gray-200/60 pb-3 mb-4">
                          <h2 className="text-lg font-semibold text-gray-900">Expenses</h2>
                        </div>
                        
                        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />

                        <ExpenseList 
                          expenses={filteredExpenses} 
                          title={`${filters.category === 'All' ? 'All' : filters.category} Expenses`}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="budget" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
                        <h2 className="text-lg font-semibold text-gray-900">Budget Manager</h2>
                      </div>
                      <div className="p-4">
                        <BudgetManager />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="recurring" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
                        <h2 className="text-lg font-semibold text-gray-900">Recurring Transactions</h2>
                      </div>
                      <div className="p-4">
                        <RecurringTransactions />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="savings" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
                        <h2 className="text-lg font-semibold text-gray-900">Savings Goals</h2>
                      </div>
                      <div className="p-4">
                        <SavingsGoals />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="loans" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
                        <h2 className="text-lg font-semibold text-gray-900">Loans</h2>
                      </div>
                      <div className="p-8">
                        <div className="text-center py-6 text-gray-500">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <h3 className="text-base font-semibold mb-2 text-gray-700">Loan Tracker</h3>
                          <p className="text-sm text-gray-500">Coming Soon! Track your loans and calculate payoff schedules.</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Right Utility Panel */}
            <UtilityPanel />
          </div>
        </main>

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton />
      </div>
    </AuthWrapper>
  );
};

export default Index;