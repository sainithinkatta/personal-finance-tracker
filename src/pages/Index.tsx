import React, { useState, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, PanelLeftClose, PanelLeftOpen, Wallet, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Dashboard from "@/components/Dashboard";
import ExpenseList from "@/components/ExpenseList";
import FilterPanel from "@/components/FilterPanel";
import BudgetManager from "@/components/BudgetManager";
import RecurringTransactions from "@/components/RecurringTransactions";
import SavingsGoals from "@/components/SavingsGoals";
import DuesManager from "@/components/DuesManager";
import CreditAnalysisDashboard from "@/components/credit-analysis/CreditAnalysisDashboard";
import LoanDashboard from "@/components/loan/LoanDashboard";
import Sidebar from "@/components/layout/Sidebar";
import UtilityPanel from "@/components/layout/UtilityPanel";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { MobileReminders } from "@/components/layout/MobileReminders";
import { UserMenu } from "@/components/layout/UserMenu";
import BankAccountForm from "@/components/BankAccountForm";
import { StatementUploadModal } from "@/components/StatementUploadModal";
import ExportDataButton from "@/components/ExportDataButton";
import { useExpenses } from "@/hooks/useExpenses";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { FilterOptions } from "@/types/expense";
import { filterExpenses } from "@/utils/expenseUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BankAccount } from "@/types/bankAccount";

const Index = () => {
  const { expenses, isLoading } = useExpenses();
  const { bankAccounts } = useBankAccounts();
  const { toast } = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDesktopSidebarVisible, setIsDesktopSidebarVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [filters, setFilters] = useState<FilterOptions>({
    startDate: null,
    endDate: null,
    category: "All",
  });
  const [user, setUser] = useState<any>(null);

  // State for editing bank account from Credit Analysis
  const [editingBankAccount, setEditingBankAccount] = useState<BankAccount | null>(null);
  const [isEditBankAccountOpen, setIsEditBankAccountOpen] = useState(false);

  // State for statement upload modal
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  // Listen for edit-bank-account custom event from Credit Analysis
  const handleEditBankAccountEvent = useCallback((event: CustomEvent<{ id: string }>) => {
    const accountId = event.detail?.id;
    if (!accountId) {
      console.error('edit-bank-account event missing account id');
      return;
    }

    const account = bankAccounts.find(acc => acc.id === accountId);
    if (!account) {
      toast({
        title: 'Account not found',
        description: 'This card could not be loaded for editing. Please refresh and try again.',
        variant: 'destructive',
      });
      return;
    }

    setEditingBankAccount(account);
    setIsEditBankAccountOpen(true);
  }, [bankAccounts, toast]);

  useEffect(() => {
    window.addEventListener('edit-bank-account', handleEditBankAccountEvent as EventListener);
    return () => {
      window.removeEventListener('edit-bank-account', handleEditBankAccountEvent as EventListener);
    };
  }, [handleEditBankAccountEvent]);

  const handleEditBankAccountClose = () => {
    setIsEditBankAccountOpen(false);
    setEditingBankAccount(null);
  };

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
    <div className="min-h-dvh bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col w-full">
      {/* Mobile Header - Sticky with safe area */}
      <header className="lg:hidden sticky top-0 z-40 bg-card backdrop-blur-md pt-safe border-b border-border shadow-sm">
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
          <Wallet className="h-5 w-5 text-primary flex-shrink-0" />
          <h1 className="text-base font-semibold text-primary truncate flex-1">
            FinMate
          </h1>
          {user && <UserMenu user={user} />}
        </div>
      </header>

      <div className="flex flex-1 w-full">
        {/* Desktop Sidebar - Conditionally Rendered */}
        {isDesktopSidebarVisible && (
          <div className="hidden lg:block transition-all duration-300">
            <Sidebar />
          </div>
        )}

        {/* Main Content */}
        <main className="sticky flex-1 flex flex-col min-w-0">
          {/* Desktop Sidebar Toggle Button */}
          <div className="hidden lg:flex items-center px-4 pt-0.5 pb-0">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDesktopSidebarVisible(!isDesktopSidebarVisible)}
              className="h-9 w-9 rounded-lg hover:bg-muted"
              title={isDesktopSidebarVisible ? "Hide sidebar" : "Show sidebar"}
            >
              {isDesktopSidebarVisible ? (
                <PanelLeftClose className="h-5 w-5" />
              ) : (
                <PanelLeftOpen className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Content Area */}
          <div className="flex-1 flex flex-col lg:flex-row">
            {/* Main Content */}
            <div className="flex-1 px-3 pb-2 sm:px-4 sm:py-3 lg:px-4 lg:pt-0 lg:pb-4">
              <div className="mx-auto w-full max-w-screen-sm sm:max-w-7xl">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  {/* Mobile: Scrollable pill tabs - Sticky */}
                  <div className="block md:hidden w-full overflow-x-auto no-scrollbar scroll-px-3 pb-1 pt-3 -mx-3 sticky top-12 z-30 bg-gradient-to-br from-gray-50 to-gray-100 shadow-sm border-b border-gray-200/40">
                    <TabsList className="flex gap-2.5 w-max bg-transparent border-0 shadow-none p-0 mb-3 pl-3 pr-6">
                      <TabsTrigger
                        value="dashboard"
                        className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                      >
                        Dashboard
                      </TabsTrigger>
                      <TabsTrigger
                        value="expenses"
                        className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                      >
                        Expenses
                      </TabsTrigger>
                      <TabsTrigger
                        value="budget"
                        className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                      >
                        Budget
                      </TabsTrigger>
                      <TabsTrigger
                        value="recurring"
                        className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                      >
                        Recurring
                      </TabsTrigger>
                      <TabsTrigger
                        value="dues"
                        className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                      >
                        Dues
                      </TabsTrigger>
                      <TabsTrigger
                        value="savings"
                        className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                      >
                        Savings
                      </TabsTrigger>
                      <TabsTrigger
                        value="loan"
                        className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                      >
                        Loan
                      </TabsTrigger>
                      <TabsTrigger
                        value="credit"
                        className="flex-none px-4 py-2 h-auto rounded-full text-sm font-medium border border-gray-300 bg-white data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:border-blue-600 data-[state=active]:shadow-sm shadow-none transition-all touch-target whitespace-nowrap"
                      >
                        Credit Analysis
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Desktop: inline tabs */}
                  <TabsList className="hidden md:grid w-full grid-cols-8 mb-4 bg-white/60 backdrop-blur-sm border border-gray-200/60 shadow-sm rounded-lg p-1">
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
                      value="dues"
                      className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      Dues
                    </TabsTrigger>
                    <TabsTrigger
                      value="savings"
                      className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      Savings
                    </TabsTrigger>
                    <TabsTrigger
                      value="loan"
                      className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      Loan
                    </TabsTrigger>
                    <TabsTrigger
                      value="credit"
                      className="text-xs lg:text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-blue-600"
                    >
                      Credit
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dashboard" className="mt-0">
                    {activeTab === "dashboard" && <Dashboard expenses={expenses} />}
                  </TabsContent>

                  <TabsContent value="expenses" className="mt-0">
                    {activeTab === "expenses" && (
                      <div className="space-y-3">
                        <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-3.5 sm:p-4">
                          <div className="border-b border-gray-200/60 pb-2 mb-3 flex items-center justify-between">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                              Expenses
                            </h2>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsUploadModalOpen(true)}
                                className="gap-1.5"
                                aria-label="Upload Bank Statement"
                                title="Upload Bank Statement"
                              >
                                <Upload className="h-4 w-4" />
                                <span className="hidden sm:inline">Upload Bank Statement</span>
                                <span className="sm:hidden">Upload</span>
                              </Button>
                              <ExportDataButton expenses={filteredExpenses} />
                            </div>
                          </div>

                          <FilterPanel
                            filters={filters}
                            onFilterChange={handleFilterChange}
                          />

                          <ExpenseList
                            expenses={filteredExpenses}
                            title={`${filters.category === "All"
                              ? "All"
                              : filters.category
                              } Expenses`}
                            bankAccounts={bankAccounts}
                          />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="dues" className="mt-0">
                    {activeTab === "dues" && (
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
                    )}
                  </TabsContent>

                  <TabsContent value="budget" className="mt-0">
                    {activeTab === "budget" && (
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
                    )}
                  </TabsContent>

                  <TabsContent value="recurring" className="mt-0">
                    {activeTab === "recurring" && (
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
                    )}
                  </TabsContent>

                  <TabsContent value="savings" className="mt-0">
                    {activeTab === "savings" && (
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
                    )}
                  </TabsContent>

                  <TabsContent value="loan" className="mt-0">
                    {activeTab === "loan" && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
                        <div className="flex flex-col items-start p-3.5 sm:p-4 border-b border-gray-200/60 gap-1">
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                            Loan Tracker
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Track and project your loan repayment
                          </p>
                        </div>
                        <div className="p-3.5 sm:p-4">
                          <LoanDashboard />
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="credit" className="mt-0">
                    {activeTab === "credit" && (
                      <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
                        <div className="flex flex-col items-start p-3.5 sm:p-4 border-b border-gray-200/60 gap-1">
                          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                            Credit Analysis
                          </h2>
                          <p className="text-xs sm:text-sm text-gray-600">
                            Payoff planner for your credit card dues
                          </p>
                        </div>
                        <div className="p-3.5 sm:p-4">
                          <CreditAnalysisDashboard />
                        </div>
                      </div>
                    )}
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

      {/* Edit Bank Account Dialog - triggered from Credit Analysis */}
      <Dialog open={isEditBankAccountOpen} onOpenChange={setIsEditBankAccountOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
          </DialogHeader>
          {editingBankAccount && (
            <BankAccountForm
              onClose={handleEditBankAccountClose}
              account={editingBankAccount}
              bankAccounts={bankAccounts}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Statement Upload Modal */}
      <StatementUploadModal
        open={isUploadModalOpen}
        onOpenChange={setIsUploadModalOpen}
      />
    </div>
  );
};

export default Index;