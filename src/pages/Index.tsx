import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import ExpenseList from "@/components/ExpenseList";
import FilterPanel from "@/components/FilterPanel";
import BudgetManager from "@/components/BudgetManager";
import RecurringTransactions from "@/components/RecurringTransactions";
import SavingsGoals from "@/components/SavingsGoals";
import DuesManager from "@/components/DuesManager";
import AuthWrapper from "@/components/AuthWrapper";
import Sidebar from "@/components/layout/Sidebar";
import UtilityPanel from "@/components/layout/UtilityPanel";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { useExpenses } from "@/hooks/useExpenses";
import { FilterOptions } from "@/types/expense";
import { filterExpenses } from "@/utils/expenseUtils";

const Index = () => {
  const { expenses, isLoading } = useExpenses();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    category: "All",
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col w-full">
        {/* Mobile Header with Hamburger */}
        <div className="lg:hidden flex items-center gap-3 p-4 bg-white/90 backdrop-blur-sm border-b border-gray-200">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="h-full">
                <Sidebar />
              </div>
            </SheetContent>
          </Sheet>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-blue-600 truncate">
              Personal Finance Tracker
            </h1>
            <p className="text-xs text-gray-600 truncate">
              Track, analyze, and manage your complete financial picture
            </p>
          </div>
        </div>

        <div className="flex flex-1 w-full">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="flex-1 flex flex-col min-w-0">
            {/* Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Main Content */}
              <div className="flex-1 px-3 py-3 lg:px-4 lg:py-4">
                <div className="max-w-7xl mx-auto">
                  <Tabs defaultValue="dashboard" className="w-full">
                    {/* Mobile: Scrollable tabs */}
                    <div className="block md:hidden w-full overflow-x-auto mobile-tabs-container">
                      <TabsList className="flex w-max min-w-full bg-white/60 backdrop-blur-sm border border-gray-200/60 shadow-sm rounded-lg p-1 mb-4">
                        <TabsTrigger
                          value="dashboard"
                          className="flex-none px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 min-h-[44px]"
                        >
                          Dashboard
                        </TabsTrigger>
                        <TabsTrigger
                          value="expenses"
                          className="flex-none px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 min-h-[44px]"
                        >
                          Expenses
                        </TabsTrigger>
                        <TabsTrigger
                          value="dues"
                          className="flex-none px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 min-h-[44px]"
                        >
                          Dues
                        </TabsTrigger>
                        <TabsTrigger
                          value="budget"
                          className="flex-none px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 min-h-[44px]"
                        >
                          Budget
                        </TabsTrigger>
                        <TabsTrigger
                          value="recurring"
                          className="flex-none px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 min-h-[44px]"
                        >
                          Recurring
                        </TabsTrigger>
                        <TabsTrigger
                          value="savings"
                          className="flex-none px-4 py-3 text-sm font-medium rounded-md transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600 min-h-[44px]"
                        >
                          Savings
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {/* Desktop: inline tabs */}
                    <TabsList className="hidden md:grid w-full grid-cols-6 mb-4 bg-white/60 backdrop-blur-sm border border-gray-200/60 shadow-sm rounded-lg p-1">
                      <TabsTrigger
                        value="dashboard"
                        className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                      >
                        Dashboard
                      </TabsTrigger>
                      <TabsTrigger
                        value="expenses"
                        className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                      >
                        Expenses
                      </TabsTrigger>
                      <TabsTrigger
                        value="dues"
                        className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                      >
                        Dues
                      </TabsTrigger>
                      <TabsTrigger
                        value="budget"
                        className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                      >
                        Budget
                      </TabsTrigger>
                      <TabsTrigger
                        value="recurring"
                        className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                      >
                        Recurring
                      </TabsTrigger>
                      <TabsTrigger
                        value="savings"
                        className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                      >
                        Savings
                      </TabsTrigger>
                    </TabsList>

                  <TabsContent value="dashboard" className="mt-0">
                    <Dashboard expenses={filteredExpenses} />
                  </TabsContent>

                  <TabsContent value="expenses" className="mt-0">
                    <div className="space-y-4">
                      <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm p-4">
                        <div className="border-b border-gray-200/60 pb-3 mb-4">
                          <h2 className="text-lg font-semibold text-gray-900">
                            Expenses
                          </h2>
                        </div>

                        <FilterPanel
                          filters={filters}
                          onFilterChange={handleFilterChange}
                        />

                        <ExpenseList
                          expenses={filteredExpenses}
                          title={`${
                            filters.category === "All"
                              ? "All"
                              : filters.category
                          } Expenses`}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="dues" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                      <div className="flex flex-col items-start p-4 border-b border-gray-200/60 space-y-1">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Dues Management
                        </h2>
                        <p className="text-gray-600">
                          Track your personal financial obligations
                        </p>
                      </div>
                      
                      <div className="p-4">
                        <DuesManager />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="budget" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                      <div className="flex flex-col items-start p-4 border-b border-gray-200/60 space-y-1">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Budget Manager
                        </h2>
                        <p className="text-gray-600">
                          Create and manage your monthly budgets
                        </p>
                      </div>

                      {/* Main content */}
                      <div className="p-4">
                        <BudgetManager />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="recurring" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Recurring Transactions
                        </h2>
                      </div>
                      <div className="p-4">
                        <RecurringTransactions />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="savings" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/60 shadow-sm">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200/60">
                        <h2 className="text-lg font-semibold text-gray-900">
                          Savings Goals
                        </h2>
                      </div>
                      <div className="p-4">
                        <SavingsGoals />
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
        </div>

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton />
      </div>
    </AuthWrapper>
  );
};

export default Index;
