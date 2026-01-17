import React, { useState, useEffect, useCallback } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, ChevronLeft, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Dashboard from "@/components/Dashboard";
import TransactionList from "@/components/TransactionList";
import FilterPanel from "@/components/FilterPanel";
import BudgetManager from "@/components/BudgetManager";
import RecurringPage from "@/components/recurring/RecurringPage";
import SavingsGoals from "@/components/SavingsGoals";
import DuesPage from "@/components/dues/DuesPage";
import CreditAnalysisDashboard from "@/components/credit-analysis/CreditAnalysisDashboard";
import LoanDashboard from "@/components/loan/LoanDashboard";
import { AccountsPage } from "@/components/accounts/AccountsPage";
import NavigationSidebar from "@/components/layout/NavigationSidebar";
import RightSidebar from "@/components/layout/RightSidebar";
import ContentHeader from "@/components/layout/ContentHeader";
import FloatingActionButton from "@/components/layout/FloatingActionButton";
import { MobileReminders } from "@/components/layout/MobileReminders";
import { UserMenu } from "@/components/layout/UserMenu";
import MobileNavigation from "@/components/layout/MobileNavigation";
import BankAccountForm from "@/components/BankAccountForm";
import { StatementUploadModal } from "@/components/StatementUploadModal";
import ExportDataButton from "@/components/ExportDataButton";
import { useTransactions } from "@/hooks/useTransactions";
import { useBankAccounts } from "@/hooks/useBankAccounts";
import { FilterOptions } from "@/types/expense";
import { filterTransactions } from "@/utils/expenseUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { BankAccount } from "@/types/bankAccount";
import { useExpenses } from "@/hooks/useExpenses";

// Finmate Logo SVG Component
const FinmateLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <rect x="4" y="14" width="4" height="6" rx="1" fill="white" />
    <rect x="10" y="10" width="4" height="10" rx="1" fill="white" />
    <rect x="16" y="4" width="4" height="16" rx="1" fill="white" />
    <path d="M6 12L12 8L18 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
    <path d="M15 3H18V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
  </svg>
);

const Index = () => {
  const { transactions, isLoading } = useTransactions();
  const { expenses } = useExpenses();
  const { bankAccounts } = useBankAccounts();
  const { toast } = useToast();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isLeftSidebarExpanded, setIsLeftSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [hasInitializedCurrency, setHasInitializedCurrency] = useState(false);
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

  useEffect(() => {
    if (hasInitializedCurrency) return;

    if (expenses.length === 0) {
      setHasInitializedCurrency(true);
      return;
    }

    const currencies = Array.from(new Set(expenses.map((expense) => expense.currency)));
    setSelectedCurrency(currencies.length === 1 ? currencies[0] : "USD");
    setHasInitializedCurrency(true);
  }, [expenses, hasInitializedCurrency]);

  const handleEditBankAccountClose = () => {
    setIsEditBankAccountOpen(false);
    setEditingBankAccount(null);
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  const filteredTransactions = filterTransactions(transactions, filters);

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

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard expenses={expenses} selectedCurrency={selectedCurrency} />;
      case "expenses":
        return (
          <div className="space-y-3">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm p-3.5 sm:p-4">
              <div className="border-b border-gray-200/60 pb-2 mb-3 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  Transactions
                </h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsUploadModalOpen(true)}
                    className="gap-1.5"
                    aria-label="Upload Statement"
                    title="Upload Statement"
                  >
                    <Upload className="h-4 w-4" />
                    <span className="hidden sm:inline">Upload Statement</span>
                    <span className="sm:hidden">Upload</span>
                  </Button>
                  <ExportDataButton transactions={filteredTransactions} />
                </div>
              </div>
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
              />
              <TransactionList
                transactions={filteredTransactions}
                title={`${filters.category === "All" ? "All" : filters.category} Transactions`}
                bankAccounts={bankAccounts}
              />
            </div>
          </div>
        );
      case "accounts":
        return <AccountsPage />;
      case "budget":
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="p-3.5 sm:p-4">
              <BudgetManager />
            </div>
          </div>
        );
      case "recurring":
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="p-3.5 sm:p-4">
              <RecurringPage />
            </div>
          </div>
        );
      case "dues":
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="p-3.5 sm:p-4">
              <DuesPage />
            </div>
          </div>
        );
      case "savings":
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="p-3.5 sm:p-4">
              <SavingsGoals />
            </div>
          </div>
        );
      case "loan":
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="p-3.5 sm:p-4">
              <LoanDashboard />
            </div>
          </div>
        );
      case "credit":
        return (
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm">
            <div className="p-3.5 sm:p-4">
              <CreditAnalysisDashboard />
            </div>
          </div>
        );
      default:
        return <Dashboard expenses={expenses} selectedCurrency={selectedCurrency} />;
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col w-full">
      {/* Desktop Header - Sticky */}
      <header className="hidden lg:flex flex-shrink-0 sticky top-0 z-40 bg-white border-b border-gray-200/60 shadow-sm min-h-[72px] items-center px-6 py-3 gap-4">
        {/* Left: Toggle Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsLeftSidebarExpanded(!isLeftSidebarExpanded)}
          className="h-9 w-9 rounded-lg hover:bg-gray-100 mr-4"
          title={isLeftSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {isLeftSidebarExpanded ? (
            <ChevronLeft className="h-5 w-5 text-gray-500" />
          ) : (
            <Menu className="h-5 w-5 text-gray-500" />
          )}
        </Button>

        {/* Finmate Logo */}
        <div
          className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0"
          style={{
            background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
          }}
        >
          <FinmateLogo />
        </div>

        {/* Title and Tagline */}
        <div className="flex flex-col justify-center">
          <span className="text-xl font-bold text-blue-600 leading-tight">Finmate</span>
          <span className="text-[11px] text-black font-medium tracking-wide">
            Track, analyze, and manage your complete financial picture
          </span>
        </div>

        {/* Right: User Avatar */}
        <div className="ml-auto flex items-center">
          {user && <UserMenu user={user} />}
        </div>
      </header>

      {/* Mobile Header - Sticky with safe area */}
      <header className="lg:hidden flex-shrink-0 sticky top-0 z-40 bg-white backdrop-blur-md pt-safe border-b border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 px-4 h-14">
          <Sheet open={isMobileSidebarOpen} onOpenChange={setIsMobileSidebarOpen}>
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
            <SheetContent side="left" className="w-72 p-0">
              <div className="h-full pt-4">
                <MobileNavigation
                  activeTab={activeTab}
                  onTabChange={handleTabChange}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Mobile Logo */}
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
            }}
          >
            <FinmateLogo />
          </div>

          <h1 className="text-base font-semibold text-blue-600 truncate flex-1">
            Finmate
          </h1>
          {user && <UserMenu user={user} />}
        </div>
      </header>

      {/* Main Layout: 3 columns */}
      <div className="flex flex-1 w-full overflow-hidden min-h-0">
        {/* Left Sidebar - Navigation (Desktop only) */}
        <NavigationSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          isExpanded={isLeftSidebarExpanded}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <div className="flex-1 px-3 py-3 sm:px-4 sm:py-4 lg:px-6 lg:py-4">
            {/* Mobile: Tab navigation */}
            <div className="block lg:hidden mb-4">
              <MobileNavigation
                activeTab={activeTab}
                onTabChange={handleTabChange}
                variant="pills"
              />
            </div>

            {/* Content Header */}
            <div className="mb-4">
              <ContentHeader
                activeTab={activeTab}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={setSelectedCurrency}
              />
            </div>

            {/* Tab Content */}
            <div className="w-full">
              {renderContent()}
            </div>
          </div>
        </main>

        {/* Right Sidebar - Actions & Upcoming Payments (Desktop only) */}
        <RightSidebar />
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
