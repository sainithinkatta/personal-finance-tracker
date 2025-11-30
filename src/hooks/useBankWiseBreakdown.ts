import { useMemo } from 'react';
import { Expense, ExpenseCategory, CategoryBankBreakdown, BankBreakdown } from '@/types/expense';
import { BankAccount } from '@/types/bankAccount';

/**
 * Custom hook to calculate bank-wise breakdown for each expense category
 *
 * @param expenses - Array of expenses to analyze (should be pre-filtered by date range)
 * @param bankAccounts - Array of all bank accounts for name lookup
 * @returns Array of category breakdowns with bank-wise spending details
 */
export const useBankWiseBreakdown = (
  expenses: Expense[],
  bankAccounts: BankAccount[]
): CategoryBankBreakdown[] => {
  return useMemo(() => {
    // Create a map for quick bank account lookup
    const bankMap = new Map<string, BankAccount>();
    bankAccounts.forEach(account => {
      bankMap.set(account.id, account);
    });

    // Define all categories to ensure we include even empty ones
    const categories: ExpenseCategory[] = ['Groceries', 'Food', 'Travel', 'Bills', 'Others'];

    // Initialize result map: category -> (bank_id -> total_spent)
    const categoryBankMap = new Map<ExpenseCategory, Map<string, number>>();
    categories.forEach(cat => {
      categoryBankMap.set(cat, new Map<string, number>());
    });

    // Aggregate expenses by category and bank
    expenses.forEach(expense => {
      // Normalize category (handle null/undefined by mapping to 'Others')
      let category: ExpenseCategory = expense.category || 'Others';
      if (!categories.includes(category)) {
        category = 'Others';
      }

      // Use 'unassigned' key for expenses without bank_account_id
      const bankId = expense.bank_account_id || 'unassigned';

      const bankSpendingMap = categoryBankMap.get(category);
      if (bankSpendingMap) {
        const currentTotal = bankSpendingMap.get(bankId) || 0;
        bankSpendingMap.set(bankId, currentTotal + expense.amount);
      }
    });

    // Convert to final result format
    const result: CategoryBankBreakdown[] = categories.map(category => {
      const bankSpendingMap = categoryBankMap.get(category);

      // Calculate category total
      let categoryTotal = 0;
      if (bankSpendingMap) {
        bankSpendingMap.forEach(amount => {
          categoryTotal += amount;
        });
      }

      // Build bank breakdown array
      const banks: BankBreakdown[] = [];
      if (bankSpendingMap) {
        bankSpendingMap.forEach((totalSpent, bankId) => {
          let bankName = 'Unassigned';
          let accountType = '';

          if (bankId !== 'unassigned') {
            const account = bankMap.get(bankId);
            if (account) {
              bankName = account.name;
              accountType = account.account_type || '';
            } else {
              // Bank account exists in expense but not in current bank list
              bankName = 'Deleted Account';
            }
          }

          banks.push({
            bank_account_id: bankId,
            bank_name: bankName,
            account_type: accountType,
            total_spent: totalSpent,
            percentage: categoryTotal > 0 ? Math.round((totalSpent / categoryTotal) * 100) : 0,
          });
        });
      }

      // Sort banks by total_spent descending
      banks.sort((a, b) => b.total_spent - a.total_spent);

      return {
        category,
        total: categoryTotal,
        banks,
      };
    });

    return result;
  }, [expenses, bankAccounts]);
};
