
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
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetTitle,
  BottomSheetBody,
} from '@/components/ui/bottom-sheet';
import { useExpenses } from '@/hooks/useExpenses';
import { useIsMobile } from '@/hooks/use-mobile';

const Sidebar: React.FC = () => {
  const [isBankAccountsCollapsed, setIsBankAccountsCollapsed] = useState(false);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const { addExpense } = useExpenses();
  const isMobile = useIsMobile();

  const handleAddExpense = (expense: any) => {
    addExpense(expense);
    setIsAddExpenseOpen(false);
  };

  return (
    <aside className="w-full lg:w-[15rem] bg-background border-r h-full overflow-y-auto">
      <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 flex flex-col items-center">
        {/* Standalone Add Expense Button - Touch Friendly */}
        <Button
          onClick={() => setIsAddExpenseOpen(true)}
          variant="default"
          className="h-12 w-full max-w-[200px] text-sm font-medium"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Expense
        </Button>

        {/* Bank Accounts Section - Touch Friendly */}
        <Card className="rounded-lg shadow-sm w-full max-w-[280px]">
          <CardHeader
            className="cursor-pointer p-4 pb-2 min-h-[48px] flex items-center touch-target"
            onClick={() => setIsBankAccountsCollapsed(!isBankAccountsCollapsed)}
          >
            <CardTitle className="flex items-center w-full">
              <span className='text-sm font-medium'>Bank Accounts</span>
              <div className="flex items-center ml-auto space-x-2">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-9 w-9"
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

        {/* Add Expense - Bottom Sheet on Mobile, Dialog on Desktop */}
        {isMobile ? (
          <BottomSheet open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetTitle>Add Expense</BottomSheetTitle>
              </BottomSheetHeader>
              <BottomSheetBody>
                <ExpenseForm
                  onAddExpense={handleAddExpense}
                  onClose={() => setIsAddExpenseOpen(false)}
                />
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        ) : (
          <Dialog open={isAddExpenseOpen} onOpenChange={setIsAddExpenseOpen}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Expense</DialogTitle>
              </DialogHeader>
              <ExpenseForm
                onAddExpense={handleAddExpense}
                onClose={() => setIsAddExpenseOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Add Bank Account - Bottom Sheet on Mobile, Dialog on Desktop */}
        {isMobile ? (
          <BottomSheet open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <BottomSheetContent>
              <BottomSheetHeader>
                <BottomSheetTitle>Add Bank Account</BottomSheetTitle>
              </BottomSheetHeader>
              <BottomSheetBody>
                <BankAccountForm onClose={() => setIsAddAccountOpen(false)} />
              </BottomSheetBody>
            </BottomSheetContent>
          </BottomSheet>
        ) : (
          <Dialog open={isAddAccountOpen} onOpenChange={setIsAddAccountOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
              </DialogHeader>
              <BankAccountForm onClose={() => setIsAddAccountOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
