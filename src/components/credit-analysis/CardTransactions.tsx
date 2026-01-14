import React, { useMemo } from 'react';
import { format, startOfMonth, isWithinInterval, subMonths } from 'date-fns';
import { Receipt, TrendingDown, TrendingUp, ChevronDown, ChevronUp, ShoppingCart, Utensils, Car, FileText, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';
import { ExpenseCategory, CURRENCIES } from '@/types/expense';

interface CardTransactionsProps {
  cardId: string;
  cardName: string;
  currency: string;
}

interface MonthGroup {
  monthKey: string;
  monthLabel: string;
  transactions: Transaction[];
  totalSpent: number;
  totalIncome: number;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  Groceries: <ShoppingCart className="h-3.5 w-3.5" />,
  Food: <Utensils className="h-3.5 w-3.5" />,
  Travel: <Car className="h-3.5 w-3.5" />,
  Bills: <FileText className="h-3.5 w-3.5" />,
  Others: <MoreHorizontal className="h-3.5 w-3.5" />,
  Income: <TrendingUp className="h-3.5 w-3.5" />,
};

const CardTransactions: React.FC<CardTransactionsProps> = ({
  cardId,
  cardName,
  currency,
}) => {
  const { transactions, isLoading } = useTransactions();
  const [expandedMonths, setExpandedMonths] = React.useState<Set<string>>(new Set());

  const getCurrencySymbol = (curr: string) => {
    const found = CURRENCIES.find(c => c.code === curr);
    return found?.symbol || curr;
  };

  const formatCurrency = (amount: number) => {
    const absAmount = Math.abs(amount);
    return `${getCurrencySymbol(currency)}${absAmount.toLocaleString(undefined, { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Filter transactions for this card and group by month
  const monthGroups = useMemo(() => {
    // Filter to only this card's transactions
    const cardTransactions = transactions.filter(t => t.bank_account_id === cardId);
    
    // Group by month
    const groups = new Map<string, Transaction[]>();
    
    cardTransactions.forEach(t => {
      const monthKey = format(t.date, 'yyyy-MM');
      if (!groups.has(monthKey)) {
        groups.set(monthKey, []);
      }
      groups.get(monthKey)!.push(t);
    });

    // Convert to array and sort by month descending
    const result: MonthGroup[] = Array.from(groups.entries())
      .map(([monthKey, txns]) => {
        const totalSpent = txns
          .filter(t => t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        const totalIncome = txns
          .filter(t => t.type === 'income')
          .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
          monthKey,
          monthLabel: format(new Date(monthKey + '-01'), 'MMMM yyyy'),
          transactions: txns.sort((a, b) => b.date.getTime() - a.date.getTime()),
          totalSpent,
          totalIncome,
        };
      })
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));

    return result;
  }, [transactions, cardId]);

  // Auto-expand current month
  React.useEffect(() => {
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    if (monthGroups.some(g => g.monthKey === currentMonthKey)) {
      setExpandedMonths(new Set([currentMonthKey]));
    } else if (monthGroups.length > 0) {
      setExpandedMonths(new Set([monthGroups[0].monthKey]));
    }
  }, [monthGroups]);

  const toggleMonth = (monthKey: string) => {
    setExpandedMonths(prev => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (monthGroups.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-8 text-center">
          <Receipt className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium mb-1">No Transactions Yet</p>
          <p className="text-xs text-muted-foreground">
            Transactions made with {cardName} will appear here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const totalTransactions = monthGroups.reduce((sum, g) => sum + g.transactions.length, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Card Transactions
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {totalTransactions} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {monthGroups.slice(0, 6).map((group) => {
          const isExpanded = expandedMonths.has(group.monthKey);
          
          return (
            <Collapsible 
              key={group.monthKey} 
              open={isExpanded}
              onOpenChange={() => toggleMonth(group.monthKey)}
            >
              <CollapsibleTrigger asChild>
                <button className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium">{group.monthLabel}</div>
                    <Badge variant="outline" className="text-xs">
                      {group.transactions.length}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {group.totalSpent > 0 && (
                        <span className="text-sm font-medium text-destructive">
                          -{formatCurrency(group.totalSpent)}
                        </span>
                      )}
                      {group.totalIncome > 0 && (
                        <span className="text-sm font-medium text-green-600 ml-2">
                          +{formatCurrency(group.totalIncome)}
                        </span>
                      )}
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 pt-2 pl-2">
                  {group.transactions.map((txn) => (
                    <div
                      key={txn.id}
                      className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
                          txn.type === 'income' 
                            ? 'bg-green-500/10 text-green-600' 
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {CATEGORY_ICONS[txn.category] || <Receipt className="h-3.5 w-3.5" />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {txn.description || txn.category}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(txn.date, 'MMM d')} • {txn.category}
                          </p>
                        </div>
                      </div>
                      <div className={`text-sm font-medium shrink-0 ml-3 ${
                        txn.type === 'income' ? 'text-green-600' : 'text-foreground'
                      }`}>
                        {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}

        {monthGroups.length > 6 && (
          <p className="text-xs text-muted-foreground text-center pt-2">
            Showing last 6 months. View all transactions in the Expenses tab.
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default CardTransactions;
