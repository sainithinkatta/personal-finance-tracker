import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Bell, Calendar, CalendarIcon, Search, ChevronDown, ChevronUp, Edit2, Trash2, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useRecurringTransactions, RecurringTransactionWithStatus } from '@/hooks/useRecurringTransactions';
import { useBankAccounts } from '@/hooks/useBankAccounts';
import { RecurringTransactionFormData } from '@/types/recurringTransaction';
import { getStatusDisplayText, getStatusBadgeClass } from '@/utils/recurringStatusUtils';
import { ExpenseCategory } from '@/types/expense';
import { useToast } from '@/hooks/use-toast';
import { format, differenceInDays, addDays } from 'date-fns';
import { RecurringTransactionCard } from '@/components/recurring/RecurringTransactionCard';
import { EditRecurringTransactionForm } from '@/components/recurring/EditRecurringTransactionForm';
import { MarkAsDoneDialog } from '@/components/recurring/MarkAsDoneDialog';
import { parseLocalDate } from '@/utils/dateUtils';
import { cn } from '@/lib/utils';

const RecurringTransactions: React.FC = () => {
  const { toast } = useToast();
  const { bankAccounts } = useBankAccounts();
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'upcoming' | 'done'>('all');
  const [selectedBank, setSelectedBank] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;

  // Build filters object
  const filters = useMemo(() => ({
    searchText: searchText || undefined,
    startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
    endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
    status: selectedStatus,
    bankAccountId: selectedBank || undefined,
    includeCompleted: selectedStatus === 'done',
    limit: itemsPerPage,
    offset: currentPage * itemsPerPage,
  }), [searchText, startDate, endDate, selectedStatus, selectedBank, currentPage]);

  const {
    recurringTransactions,
    addRecurringTransaction,
    updateRecurringTransaction,
    deleteRecurringTransaction,
    markAsDone,
    getUpcomingReminders,
    processRecurringTransactions,
    isAdding,
    isUpdating,
    isMarkingDone,
  } = useRecurringTransactions(filters);

  // UI states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<RecurringTransactionWithStatus | null>(null);
  const [deletingTransactionId, setDeletingTransactionId] = useState<string | null>(null);
  const [markingTransaction, setMarkingTransaction] = useState<RecurringTransactionWithStatus | null>(null);
  const [isUpcomingExpanded, setIsUpcomingExpanded] = useState(false);
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [formData, setFormData] = useState<RecurringTransactionFormData>({
    name: '',
    amount: 0,
    category: 'Bills' as ExpenseCategory,
    frequency: 'monthly',
    next_due_date: '',
    currency: 'USD',
    email_reminder: true,
    reminder_days_before: 2,
    bank_account_id: '',
  });

  // Get upcoming reminders separately (exclude completed)
  const upcomingReminders = getUpcomingReminders().filter(tx => tx.computedStatus !== 'done');

  useEffect(() => {
    processRecurringTransactions();
    upcomingReminders.forEach((tx) => {
      const daysUntilDue = differenceInDays(
        parseLocalDate(tx.next_due_date),
        new Date()
      );
      if (daysUntilDue <= tx.reminder_days_before && daysUntilDue >= 0) {
        toast({
          title: 'Upcoming Reminder',
          description: `${tx.name} — ${formatCurrency(
            tx.amount,
            tx.currency
          )} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}.`,
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setFormData({
      name: '',
      amount: 0,
      category: 'Bills' as ExpenseCategory,
      frequency: 'monthly',
      next_due_date: '',
      currency: 'USD',
      email_reminder: true,
      reminder_days_before: 2,
      bank_account_id: '',
    });
    setIsAddDialogOpen(false);
  };

  // Filter bank accounts by selected currency for add form
  const filteredBankAccountsForAdd = useMemo(() => 
    bankAccounts.filter(account => account.currency === formData.currency),
    [bankAccounts, formData.currency]
  );

  // Track previous currency to detect changes
  const prevCurrencyRef = useRef(formData.currency);

  // Clear bank selection when currency changes and bank is incompatible
  useEffect(() => {
    // Only run if currency actually changed (not on initial mount)
    if (prevCurrencyRef.current !== formData.currency) {
      if (formData.bank_account_id) {
        const selectedBank = bankAccounts.find(b => b.id === formData.bank_account_id);
        if (selectedBank && selectedBank.currency !== formData.currency) {
          setFormData(prev => ({ ...prev, bank_account_id: '' }));
          toast({
            title: 'Bank Selection Reset',
            description: 'Bank selection cleared because currency changed.',
          });
        }
      }
      prevCurrencyRef.current = formData.currency;
    }
  }, [formData.currency, formData.bank_account_id, bankAccounts, toast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.bank_account_id) {
      toast({
        title: 'Validation Error',
        description: 'Please select a bank account.',
        variant: 'destructive',
      });
      return;
    }

    // Validate currency-bank match
    const selectedBank = bankAccounts.find(b => b.id === formData.bank_account_id);
    if (selectedBank && selectedBank.currency !== formData.currency) {
      toast({
        title: 'Currency Mismatch',
        description: 'Selected bank currency does not match the chosen currency.',
        variant: 'destructive',
      });
      return;
    }

    addRecurringTransaction(formData);
    resetForm();
  };

  const handleEdit = (transaction: RecurringTransactionWithStatus) => {
    setEditingTransaction(transaction);
  };

  const handleSaveEdit = (id: string, data: Partial<RecurringTransactionFormData>) => {
    updateRecurringTransaction({ id, data });
    setEditingTransaction(null);
  };

  const handleDelete = (id: string) => {
    setDeletingTransactionId(id);
  };

  const handleDeleteConfirm = () => {
    if (deletingTransactionId) {
      deleteRecurringTransaction(deletingTransactionId);
      setDeletingTransactionId(null);
    }
  };

  const handleMarkAsDone = (transaction: RecurringTransactionWithStatus) => {
    setMarkingTransaction(transaction);
  };

  const handleConfirmMarkAsDone = (id: string, bankAccountId: string) => {
    markAsDone({ id, bankAccountId });
    setMarkingTransaction(null);
  };

  const clearFilters = () => {
    setSearchText('');
    setStartDate(null);
    setEndDate(null);
    setSelectedStatus('all');
    setSelectedBank('');
    setCurrentPage(0);
  };

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'INR' ? '₹' : '$';
    return `${symbol}${amount.toFixed(2)}`;
  };

  const getFrequencyBadgeColor = (freq: string) => {
    switch (freq) {
      case 'daily':
        return 'bg-info-muted text-info-foreground';
      case 'weekly':
        return 'bg-accent-muted text-accent-foreground';
      case 'monthly':
        return 'bg-warning-muted text-warning-foreground';
      case 'yearly':
        return 'bg-warning-muted text-warning-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Groceries':
        return 'bg-green-100 text-green-800 hover:bg-green-200';
      case 'Food':
        return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
      case 'Travel':
        return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
      case 'Bills':
        return 'bg-red-100 text-red-800 hover:bg-red-200';
      case 'Others':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }
  };

  const transactionToDelete = recurringTransactions.find(t => t.id === deletingTransactionId);
  const hasMore = recurringTransactions.length === itemsPerPage;

  return (
    <div className="space-y-6">
      {/* Collapsible Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="bg-gradient-to-r from-warning-muted to-warning-muted border border-warning/20 rounded-lg overflow-hidden">
          <button
            onClick={() => setIsUpcomingExpanded(!isUpcomingExpanded)}
            className={cn(
              "w-full flex items-center justify-between p-4",
              "transition-colors duration-200",
              "hover:bg-warning-muted/50",
              "focus:outline-none focus:ring-2 focus:ring-warning focus:ring-inset"
            )}
          >
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-warning" />
              <h3 className="font-semibold text-warning-foreground">Upcoming Payments</h3>
            </div>
            <Badge variant="outline" className="bg-warning text-warning-foreground">
              {upcomingReminders.length}
            </Badge>
          </button>

          {isUpcomingExpanded && (
            <div className="px-4 pb-4 grid gap-2">
              {upcomingReminders.map((tx) => {
                const daysUntilDue = differenceInDays(
                  parseLocalDate(tx.next_due_date),
                  new Date()
                );
                const dueLabel =
                  daysUntilDue === 0 ? 'Today' : daysUntilDue === 1 ? 'Tomorrow' : `${daysUntilDue} days`;

                return (
                  <div
                    key={tx.id}
                    className="flex flex-col bg-card rounded-md border border-warning/20 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-4 w-4 text-warning" />
                        <div>
                          <p className="font-medium text-foreground text-sm">{tx.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Due {format(parseLocalDate(tx.next_due_date), 'MMM d')} • {dueLabel}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-foreground text-sm">
                          {formatCurrency(tx.amount, tx.currency)}
                        </p>
                        <Badge className={`text-xs ${getFrequencyBadgeColor(tx.frequency)}`}>
                          {tx.frequency}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filters Section */}
      <div>
        {/* Mobile: Toggle Button */}
        <button
            onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
            aria-expanded={isFiltersExpanded}
            aria-controls="recurring-filters-content"
            className={cn(
              "md:hidden",
              "w-full flex items-center justify-between",
              "p-3 mb-3 rounded-lg",
              "bg-secondary/50 hover:bg-secondary/70",
              "transition-colors duration-200",
              "border border-transparent hover:border-gray-300",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base font-medium text-foreground">Filters</span>
              {/* Active Filter Indicator */}
              {(searchText || startDate || endDate || selectedStatus !== 'all' || selectedBank) && (
                <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
                  {[
                    !!searchText,
                    !!startDate || !!endDate,
                    selectedStatus !== 'all',
                    !!selectedBank
                  ].filter(Boolean).length}
                </span>
              )}
            </div>
            {isFiltersExpanded ? (
              <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
            )}
          </button>

          {/* Collapsible Filter Content */}
          <div
            id="recurring-filters-content"
            className={cn(
              "overflow-hidden transition-all duration-300 ease-in-out",
              "md:max-h-[800px] md:opacity-100 md:mt-3",
              isFiltersExpanded ? "max-h-[800px] opacity-100 mt-3" : "max-h-0 opacity-0"
            )}
          >
            <div className="bg-secondary/50 p-3 md:p-4 rounded-lg space-y-3 md:space-y-0">
              {/* Mobile: Stacked Layout */}
              <div className="block md:hidden space-y-3">
                {/* Search */}
                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(0);
                      }}
                      className="pl-9 touch-target"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={selectedStatus} onValueChange={(val: 'all' | 'pending' | 'upcoming' | 'done') => {
                    setSelectedStatus(val);
                    setCurrentPage(0);
                  }}>
                    <SelectTrigger className="touch-target">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="pending">
                        <Badge variant="outline" className="bg-warning-muted text-warning-foreground">Pending</Badge>
                      </SelectItem>
                      <SelectItem value="upcoming">
                        <Badge variant="outline" className="bg-info-muted text-info-foreground">Upcoming</Badge>
                      </SelectItem>
                      <SelectItem value="done">
                        <Badge variant="outline" className="bg-accent-muted text-accent-foreground">Completed</Badge>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bank Filter */}
                <div className="w-full space-y-2">
                  <Label className="text-sm font-medium">Bank Account</Label>
                  <Select value={selectedBank} onValueChange={(val) => {
                    setSelectedBank(val);
                    setCurrentPage(0);
                  }}>
                    <SelectTrigger className="touch-target">
                      <SelectValue placeholder="All banks" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All banks</SelectItem>
                      {bankAccounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Range (Due Date)</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* Start Date */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left touch-target min-w-0"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate text-sm">
                            {startDate ? format(startDate, 'MMM d') : "Start"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={startDate || undefined}
                          onSelect={(date) => {
                            setStartDate(date || null);
                            setCurrentPage(0);
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>

                    {/* End Date */}
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left touch-target min-w-0"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="truncate text-sm">
                            {endDate ? format(endDate, 'MMM d') : "End"}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={endDate || undefined}
                          onSelect={(date) => {
                            setEndDate(date || null);
                            setCurrentPage(0);
                          }}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Clear Filters Button */}
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="w-full touch-target"
                >
                  Clear Filters
                </Button>
              </div>

              {/* Desktop: Horizontal Layout */}
              <div className="hidden md:flex flex-wrap items-center gap-3">
                {/* Search */}
                <div className="flex-1 min-w-[180px]">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name..."
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(0);
                      }}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Status */}
                <Select value={selectedStatus} onValueChange={(val: 'all' | 'pending' | 'upcoming' | 'done') => {
                  setSelectedStatus(val);
                  setCurrentPage(0);
                }}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">
                      <Badge variant="outline" className="bg-warning-muted text-warning-foreground">Pending</Badge>
                    </SelectItem>
                    <SelectItem value="upcoming">
                      <Badge variant="outline" className="bg-info-muted text-info-foreground">Upcoming</Badge>
                    </SelectItem>
                    <SelectItem value="done">
                      <Badge variant="outline" className="bg-accent-muted text-accent-foreground">Completed</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* Bank */}
                <Select value={selectedBank} onValueChange={(val) => {
                  setSelectedBank(val);
                  setCurrentPage(0);
                }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All banks" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All banks</SelectItem>
                    {bankAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Start Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[130px] justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">
                        {startDate ? format(startDate, 'MMM d') : "Start Date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate || undefined}
                      onSelect={(date) => {
                        setStartDate(date || null);
                        setCurrentPage(0);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                {/* End Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[130px] justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">
                        {endDate ? format(endDate, 'MMM d') : "End Date"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate || undefined}
                      onSelect={(date) => {
                        setEndDate(date || null);
                        setCurrentPage(0);
                      }}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
              </div>
            </div>
          </div>
      </div>

      {/* Count and Add Transaction Row */}
      <div className="flex items-center justify-between pt-2 pb-3 gap-2">
        <div className="text-xs sm:text-sm text-muted-foreground">
          {recurringTransactions.length} {recurringTransactions.length === 1 ? 'transaction' : 'transactions'}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="default" size="sm" className="flex shadow-lg">
                <Plus className="h-4 w-4 mr-1" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md mx-auto my-8 overflow-auto">
              <DialogHeader>
                <DialogTitle>Add Recurring Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields remain the same */}
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-sm font-medium">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Netflix"
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="amount" className="text-sm font-medium">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0.00"
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
                  <Select value={formData.currency} onValueChange={(val) => setFormData({ ...formData, currency: val })}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="USD" />
                    </SelectTrigger>
                    <SelectContent className="text-sm bg-background">
                      <SelectItem value="USD" className="text-sm">$ US Dollar</SelectItem>
                      <SelectItem value="INR" className="text-sm">₹ Indian Rupee</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(val) => setFormData({ ...formData, category: val as ExpenseCategory })}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Bills" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      <SelectItem value="Groceries">Groceries</SelectItem>
                      <SelectItem value="Food">Food</SelectItem>
                      <SelectItem value="Travel">Travel</SelectItem>
                      <SelectItem value="Bills">Bills</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="frequency" className="text-sm font-medium">Frequency</Label>
                  <Select
                    value={formData.frequency}
                    onValueChange={(val: 'daily' | 'weekly' | 'monthly' | 'yearly') =>
                      setFormData({ ...formData, frequency: val })
                    }
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Monthly" />
                    </SelectTrigger>
                    <SelectContent className="text-sm">
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label htmlFor="next_due_date" className="text-sm font-medium">Next Due Date</Label>
                  <Input
                    id="next_due_date"
                    type="date"
                    value={formData.next_due_date}
                    onChange={(e) => setFormData({ ...formData, next_due_date: e.target.value })}
                    required
                    className="text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <Label htmlFor="bank_account_id" className="text-sm font-medium">
                    Bank Account <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.bank_account_id}
                    onValueChange={(val) => setFormData({ ...formData, bank_account_id: val })}
                    disabled={filteredBankAccountsForAdd.length === 0}
                  >
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder={filteredBankAccountsForAdd.length === 0 ? `No ${formData.currency} accounts` : "Select bank account"} />
                    </SelectTrigger>
                    <SelectContent className="text-sm bg-background">
                      {filteredBankAccountsForAdd.map((account) => (
                        <SelectItem key={account.id} value={account.id} className="text-sm">
                          {account.name} ({account.account_type || 'Debit'})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {filteredBankAccountsForAdd.length === 0 ? (
                    <p className="text-xs text-amber-600 mt-1">
                      No bank accounts available for {formData.currency}. Add a {formData.currency} account first.
                    </p>
                  ) : !formData.bank_account_id && (
                    <p className="text-xs text-muted-foreground">Required - select where this payment will be made from</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="reminder_days_before" className="text-sm font-medium">
                    Remind (days before)
                  </Label>
                  <Input
                    id="reminder_days_before"
                    type="number"
                    min="0"
                    max="30"
                    value={formData.reminder_days_before}
                    onChange={(e) =>
                      setFormData({ ...formData, reminder_days_before: parseInt(e.target.value) || 0 })
                    }
                    className="text-sm"
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" size="sm" disabled={isAdding || filteredBankAccountsForAdd.length === 0}>Save</Button>
                  <Button variant="outline" size="sm" onClick={resetForm} type="button">
                    Cancel
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
      </div>

      {/* Transactions List */}
      <div>
        {recurringTransactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No recurring transactions found.</p>
              <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters or add a new transaction.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <ScrollArea className="h-[500px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="font-semibold text-foreground">
                          Name
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Category
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Bank
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Frequency
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Next Due Date
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-right">
                          Amount
                        </TableHead>
                        <TableHead className="font-semibold text-foreground">
                          Status
                        </TableHead>
                        <TableHead className="font-semibold text-foreground text-right">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recurringTransactions.map((transaction, index) => {
                        const isDone = transaction.computedStatus === 'done';
                        const isPending = transaction.computedStatus === 'pending';
                        const bankAccount = bankAccounts.find(ba => ba.id === transaction.bank_account_id);
                        return (
                          <TableRow
                            key={transaction.id}
                            className={cn(
                              'hover:bg-muted/30 transition-colors',
                              index % 2 === 0 ? 'bg-background' : 'bg-muted/10',
                              isDone && 'opacity-60'
                            )}
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <RotateCcw className={cn(
                                  "h-4 w-4",
                                  isDone ? 'text-accent' : 'text-muted-foreground'
                                )} />
                                <span className="text-sm">{transaction.name}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                className={cn(
                                  'font-normal',
                                  getCategoryColor(transaction.category)
                                )}
                              >
                                {transaction.category}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <span className="text-sm text-muted-foreground">
                                {bankAccount?.name || 'Not assigned'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn('text-xs', getFrequencyBadgeColor(transaction.frequency))}
                              >
                                {transaction.frequency.charAt(0).toUpperCase() + transaction.frequency.slice(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">
                                  {format(parseLocalDate(transaction.next_due_date), 'MMM d, yyyy')}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {format(parseLocalDate(transaction.next_due_date), 'EEEE')}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-semibold">
                              {formatCurrency(transaction.amount, transaction.currency)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline" 
                                className={getStatusBadgeClass(transaction.computedStatus)}
                              >
                                {isDone && '✓ '}{getStatusDisplayText(transaction.computedStatus)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end space-x-1">
                                {!isDone && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-accent hover:text-accent hover:bg-accent/10"
                                    onClick={() => handleMarkAsDone(transaction)}
                                    disabled={isMarkingDone}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0"
                                  onClick={() => handleEdit(transaction)}
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                                  onClick={() => handleDelete(transaction.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              </div>

              {/* Mobile Card View */}
              <div className="block md:hidden space-y-4">
                {recurringTransactions.map((transaction) => (
                  <RecurringTransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onMarkAsDone={() => handleMarkAsDone(transaction)}
                    isMarkingDone={isMarkingDone}
                    bankAccounts={bankAccounts}
                  />
                ))}
              </div>

              {/* Pagination */}
              {(currentPage > 0 || hasMore) && (
                <div className="flex items-center justify-center gap-2 pt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Page {currentPage + 1}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={!hasMore}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
      </div>

      {/* Edit Dialog */}
      <EditRecurringTransactionForm
        transaction={editingTransaction}
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        onSave={handleSaveEdit}
        isLoading={isUpdating}
      />

      {/* Mark as Done Dialog */}
      <MarkAsDoneDialog
        transaction={markingTransaction}
        isOpen={!!markingTransaction}
        onClose={() => setMarkingTransaction(null)}
        onConfirm={handleConfirmMarkAsDone}
        isLoading={isMarkingDone}
      />

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingTransactionId}
        onOpenChange={(open) => !open && setDeletingTransactionId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Recurring Transaction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{transactionToDelete?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecurringTransactions;
