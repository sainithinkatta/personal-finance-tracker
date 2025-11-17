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
import  { MobileReminders }from "@/components/layout/MobileReminders";
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
      <div className="min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col w-full">
        {/* Mobile Header - Sticky with safe area */}
        <header className="lg:hidden sticky top-0 z-40 bg-white backdrop-blur-md pt-safe border-b border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 px-3 h-12">
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl -ml-1 hover:bg-muted/60 touch-target"
                  aria-label="Open menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="h-full">
                  <Sidebar />
                </div>
              </SheetContent>
            </Sheet>
            <h1 className="text-base font-semibold truncate flex-1">
              Personal Finance Tracker
            </h1>
          </div>
        </header>

        <div className="flex flex-1 w-full">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          {/* Main Content */}
          <main className="sticky flex-1 flex flex-col min-w-0">
            {/* Content Area */}
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Main Content */}
              <div className="flex-1 px-3 pb-2 sm:px-4 sm:py-3 lg:px-4 lg:py-4">
                <div className="mx-auto w-full max-w-screen-sm sm:max-w-7xl">
                  <Tabs defaultValue="dashboard" className="w-full">
                    {/* Mobile: Scrollable pill tabs - Sticky */}
                    <div className="block md:hidden w-full overflow-x-auto no-scrollbar scroll-px-3 pb-1 pt-3 -mx-3 sticky top-12 z-30 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm border-b border-gray-200/40">
                      <TabsList className="flex gap-2.5 w-max bg-transparent border-0 shadow-none p-0 mb-3 pl-3 pr-6">
                        <TabsTrigger
                          value="dashboard"
                          className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                        >
                          Dashboard
                        </TabsTrigger>
                        <TabsTrigger
                          value="expenses"
                          className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                        >
                          Expenses
                        </TabsTrigger>
                        <TabsTrigger
                          value="dues"
                          className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                        >
                          Dues
                        </TabsTrigger>
                        <TabsTrigger
                          value="budget"
                          className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                        >
                          Budget
                        </TabsTrigger>
                        <TabsTrigger
                          value="recurring"
                          className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                        >
                          Recurring
                        </TabsTrigger>
                        <TabsTrigger
                          value="savings"
                          className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:border-primary data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
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
                    <div className="space-y-3">
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-3.5 sm:p-4">
                        <div className="border-b border-gray-200/60 pb-2 mb-3">
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
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
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
                      <div className="flex flex-col items-start p-3.5 sm:p-4 border-b border-gray-200/60 gap-1">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                          Dues Management
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Track your personal financial obligations
                        </p>
                      </div>

                      <div className="p-3.5 sm:p-4">
                        <DuesManager />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="budget" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
                      <div className="flex flex-col items-start p-3.5 sm:p-4 border-b border-gray-200/60 gap-1">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                          Budget Manager
                        </h2>
                        <p className="text-xs sm:text-sm text-gray-600">
                          Create and manage your monthly budgets
                        </p>
                      </div>

                      {/* Main content */}
                      <div className="p-3.5 sm:p-4">
                        <BudgetManager />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="recurring" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
                      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-200/60">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                          Recurring Transactions
                        </h2>
                      </div>
                      <div className="p-3.5 sm:p-4">
                        <RecurringTransactions />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="savings" className="mt-0">
                    <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
                      <div className="flex items-center justify-between p-3.5 sm:p-4 border-b border-gray-200/60">
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                          Savings Goals
                        </h2>
                      </div>
                      <div className="p-3.5 sm:p-4">
                        <SavingsGoals />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

              {/* Right Utility Panel - Desktop Only */}
              <div className="hidden xl:block">
                <UtilityPanel />
              </div>
            </div>
          </main>
        </div>

        {/* Floating Action Button for Mobile */}
        <FloatingActionButton />

        {/* Mobile Reminders */}
        <MobileReminders />
      </div>
    </AuthWrapper>
  );
};

export default Index;