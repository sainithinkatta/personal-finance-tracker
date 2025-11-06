import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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

  const summaryChips = useMemo(() => {
    const chips: string[] = [];
    const categoryChip = filters.category === "All" ? "All expenses" : filters.category;
    chips.push(categoryChip);

    if (filters.startDate || filters.endDate) {
      const startLabel = filters.startDate ? format(filters.startDate, "MMM d") : "Any time";
      const endLabel = filters.endDate ? format(filters.endDate, "MMM d") : "Today";
      chips.push(`${startLabel} – ${endLabel}`);
    } else {
      chips.push("Any time");
    }

    return chips;
  }, [filters]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <div className="text-sm text-muted-foreground">Loading your finances...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthWrapper>
      <Tabs defaultValue="dashboard" className="flex min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex w-full">
          <div className="hidden lg:block">
            <Sidebar />
          </div>

          <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-40 border-b border-muted/40 bg-white/80 backdrop-blur pt-safe lg:hidden">
              <div className="flex h-12 items-center gap-2 px-3">
                <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="-ml-1 rounded-xl p-2 text-muted-foreground transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      aria-label="Open menu"
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <Sidebar />
                  </SheetContent>
                </Sheet>
                <div className="min-w-0">
                  <h1 className="truncate text-base font-semibold text-foreground">
                    Personal Finance Tracker
                  </h1>
                </div>
              </div>
              <nav className="px-3 pb-2">
                <TabsList className="flex gap-2 overflow-x-auto no-scrollbar snap-x rounded-full bg-transparent p-0">
                  <TabsTrigger
                    value="dashboard"
                    className="snap-start rounded-full border border-muted-foreground/30 px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Dashboard
                  </TabsTrigger>
                  <TabsTrigger
                    value="expenses"
                    className="snap-start rounded-full border border-muted-foreground/30 px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Expenses
                  </TabsTrigger>
                  <TabsTrigger
                    value="dues"
                    className="snap-start rounded-full border border-muted-foreground/30 px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Dues
                  </TabsTrigger>
                  <TabsTrigger
                    value="budget"
                    className="snap-start rounded-full border border-muted-foreground/30 px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Budget
                  </TabsTrigger>
                  <TabsTrigger
                    value="recurring"
                    className="snap-start rounded-full border border-muted-foreground/30 px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Recurring
                  </TabsTrigger>
                  <TabsTrigger
                    value="savings"
                    className="snap-start rounded-full border border-muted-foreground/30 px-3 py-1.5 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-primary data-[state=active]:text-white"
                  >
                    Savings
                  </TabsTrigger>
                </TabsList>
              </nav>
            </header>

            <div className="flex flex-1 flex-col lg:flex-row">
              <main className="flex-1 pb-safe">
                <div className="mx-auto w-full max-w-screen-sm px-3 pb-12 pt-4 sm:px-4 lg:max-w-7xl lg:px-6 lg:pt-6">
                  <TabsList className="hidden md:flex flex-wrap gap-2 rounded-full bg-white/70 p-1 shadow-sm">
                    <TabsTrigger
                      value="dashboard"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Dashboard
                    </TabsTrigger>
                    <TabsTrigger
                      value="expenses"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Expenses
                    </TabsTrigger>
                    <TabsTrigger
                      value="dues"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Dues
                    </TabsTrigger>
                    <TabsTrigger
                      value="budget"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Budget
                    </TabsTrigger>
                    <TabsTrigger
                      value="recurring"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Recurring
                    </TabsTrigger>
                    <TabsTrigger
                      value="savings"
                      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-white"
                    >
                      Savings
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="mt-4 lg:mt-6">
                    <Dashboard expenses={filteredExpenses} />
                  </TabsContent>

                  <TabsContent value="expenses" className="mt-4 lg:mt-6">
                    <section className="rounded-3xl border border-muted-foreground/20 bg-white/80 shadow-sm">
                      <header className="border-b border-muted-foreground/20 px-4 py-3">
                        <h2 className="text-lg font-semibold text-foreground">Expenses</h2>
                        <p className="text-xs text-muted-foreground">
                          Review, filter, and manage your transactions
                        </p>
                      </header>
                      <div className="space-y-4 px-4 py-4">
                        <FilterPanel filters={filters} onFilterChange={handleFilterChange} />
                        <ExpenseList expenses={filteredExpenses} summaryChips={summaryChips} />
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent value="dues" className="mt-4 lg:mt-6">
                    <section className="rounded-3xl border border-muted-foreground/20 bg-white/80 shadow-sm">
                      <header className="border-b border-muted-foreground/20 px-4 py-3">
                        <h2 className="text-lg font-semibold text-foreground">Dues Management</h2>
                        <p className="text-xs text-muted-foreground">
                          Track your personal financial obligations
                        </p>
                      </header>
                      <div className="px-4 py-4">
                        <DuesManager />
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent value="budget" className="mt-4 lg:mt-6">
                    <section className="rounded-3xl border border-muted-foreground/20 bg-white/80 shadow-sm">
                      <header className="border-b border-muted-foreground/20 px-4 py-3">
                        <h2 className="text-lg font-semibold text-foreground">Budget Manager</h2>
                        <p className="text-xs text-muted-foreground">
                          Create and manage your monthly budgets
                        </p>
                      </header>
                      <div className="px-4 py-4">
                        <BudgetManager />
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent value="recurring" className="mt-4 lg:mt-6">
                    <section className="rounded-3xl border border-muted-foreground/20 bg-white/80 shadow-sm">
                      <header className="border-b border-muted-foreground/20 px-4 py-3">
                        <h2 className="text-lg font-semibold text-foreground">Recurring Transactions</h2>
                        <p className="text-xs text-muted-foreground">
                          Keep upcoming subscriptions and bills in check
                        </p>
                      </header>
                      <div className="px-4 py-4">
                        <RecurringTransactions />
                      </div>
                    </section>
                  </TabsContent>

                  <TabsContent value="savings" className="mt-4 lg:mt-6">
                    <section className="rounded-3xl border border-muted-foreground/20 bg-white/80 shadow-sm">
                      <header className="border-b border-muted-foreground/20 px-4 py-3">
                        <h2 className="text-lg font-semibold text-foreground">Savings Goals</h2>
                        <p className="text-xs text-muted-foreground">
                          Plan and track your savings milestones
                        </p>
                      </header>
                      <div className="px-4 py-4">
                        <SavingsGoals />
                      </div>
                    </section>
                  </TabsContent>
                </div>
              </main>

              <UtilityPanel />
            </div>
          </div>
        </div>

        <FloatingActionButton />
      </Tabs>
    </AuthWrapper>
  );
};

export default Index;
