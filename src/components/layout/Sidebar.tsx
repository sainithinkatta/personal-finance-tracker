
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import ExpenseForm from '@/components/ExpenseForm';
import BankAccountsList from '@/components/BankAccountsList';
import BankAccountForm from '@/components/BankAccountForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useExpenses } from '@/hooks/useExpenses';

const Sidebar: React.FC = () => {
  const [isBankAccountsCollapsed, setIsBankAccountsCollapsed] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const { addExpense } = useExpenses();

  const handleAddExpense = (expense: any) => {
    addExpense(expense);
    setIsAddExpenseOpen(false);
  };

  return (
    <aside className="w-full lg:w-[15rem] bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 flex flex-col items-center">
        {/* Standalone Add Expense Button - Touch Friendly */}
        <Button 
          onClick={() => setIsAddExpenseOpen(true)}
          className="bg-blue-500 hover:bg-blue-600 h-12 w-full max-w-[200px] text-sm font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </Button>

        {/* Bank Accounts Section - Touch Friendly */}
        <Card className="rounded-lg shadow-sm w-full max-w-[280px]">
          <CardHeader 
            className="cursor-pointer p-4 pb-2 min-h-[48px] flex items-center" 
            onClick={() => setIsBankAccountsCollapsed(!isBankAccountsCollapsed)}
          >
            <CardTitle className="flex items-center w-full">
              <span className='text-sm font-medium'>Bank Accounts</span>
              <div className="flex items-center ml-auto space-x-2">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAddAccountOpen(true);
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {isBankAccountsCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
              </div>
            </CardTitle>
          </CardHeader>
          {!isBankAccountsCollapsed && (
            <CardContent className="p-4 pt-0">
              <BankAccountsList />
            </CardContent>
          )}
        </Card>

        {/* Add Expense Dialog */}
        <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
          <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Expense</DialogTitle>
            </DialogHeader>
            <ExpenseForm onAddExpense={handleAddExpense} />
          </DialogContent>
        </Dialog>

        {/* Add Bank Account Dialog */}
        <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Bank Account</DialogTitle>
            </DialogHeader>
            <BankAccountForm onClose={() => setIsAddAccountOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </aside>
  );
};

export default Sidebar;
