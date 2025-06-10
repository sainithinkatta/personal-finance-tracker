import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  format,
  parseISO,
  startOfMonth,
  startOfDay,
  startOfYear,
} from 'date-fns';
import { Expense, GroupByPeriod } from '@/types/expense';

interface ExpenseTimeChartProps {
  expenses: Expense[];
  groupBy: GroupByPeriod;
}

export const ExpenseTimeChart: React.FC<ExpenseTimeChartProps> = ({
  expenses,
  groupBy,
}) => {
  // Aggregate and sort expenses into chartData
  const chartData = useMemo(() => {
    if (!expenses.length) return [];

    const expenseMap = new Map<string, number>();

    expenses.forEach((expense) => {
      let periodKey: string;
      const date = new Date(expense.date);

      switch (groupBy) {
        case 'day':
          periodKey = format(startOfDay(date), 'yyyy-MM-dd');
          break;
        case 'month':
          periodKey = format(startOfMonth(date), 'yyyy-MM');
          break;
        case 'year':
          periodKey = format(startOfYear(date), 'yyyy');
          break;
      }

      expenseMap.set(
        periodKey,
        (expenseMap.get(periodKey) || 0) + expense.amount
      );
    });

    return Array.from(expenseMap.entries())
      .map(([period, total]) => ({ period, total }))
      .sort((a, b) => a.period.localeCompare(b.period));
  }, [expenses, groupBy]);

  // Format functions for X axis ticks and tooltip labels
  const formatXAxis = (tickItem: string) => {
    if (groupBy === 'day') {
      return format(parseISO(tickItem), 'MMM d');
    } else if (groupBy === 'month') {
      return format(parseISO(`${tickItem}-01`), 'MMM yyyy');
    } else {
      return tickItem;
    }
  };

  const formatTooltipLabel = (label: string) => {
    if (groupBy === 'day') {
      return format(parseISO(label), 'MMMM d, yyyy');
    } else if (groupBy === 'month') {
      return format(parseISO(`${label}-01`), 'MMMM yyyy');
    } else {
      return label;
    }
  };

  // If no data, show a clean placeholder
  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-2 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ 
          top: 20, 
          right: 20, 
          left: 20, 
          bottom: groupBy === 'day' ? 50 : 30 
        }}
      >
        <defs>
          <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.9} />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
          </linearGradient>
        </defs>

        <CartesianGrid
          strokeDasharray="2 4"
          vertical={false}
          stroke="#e5e7eb"
          strokeOpacity={0.6}
        />

        <XAxis
          dataKey="period"
          tickFormatter={formatXAxis}
          tick={{ 
            fill: '#6b7280', 
            fontSize: 11, 
            fontWeight: 500 
          }}
          axisLine={{ stroke: '#d1d5db' }}
          tickLine={{ stroke: '#d1d5db' }}
          angle={groupBy === 'day' ? -35 : 0}
          textAnchor={groupBy === 'day' ? 'end' : 'middle'}
          height={groupBy === 'day' ? 45 : 30}
          interval="preserveStartEnd"
        />

        <YAxis
          tickFormatter={(value) => `$${value}`}
          tick={{ 
            fill: '#6b7280', 
            fontSize: 11, 
            fontWeight: 500 
          }}
          axisLine={{ stroke: '#d1d5db' }}
          tickLine={{ stroke: '#d1d5db' }}
          width={55}
        />

        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '13px'
          }}
          labelStyle={{ 
            color: '#374151', 
            fontSize: '13px', 
            fontWeight: 600,
            marginBottom: '4px' 
          }}
          itemStyle={{ 
            color: '#1f2937', 
            fontWeight: 600,
            fontSize: '14px'
          }}
          formatter={(value: number) => [`$${value.toFixed(2)}`, 'Amount']}
          labelFormatter={(label) => formatTooltipLabel(label as string)}
        />

        <Bar
          dataKey="total"
          fill="url(#expenseGradient)"
          radius={[6, 6, 0, 0]}
          barSize={groupBy === 'day' ? 20 : 30}
          stroke="rgba(59, 130, 246, 0.3)"
          strokeWidth={1}
        />
      </BarChart>
    </ResponsiveContainer>
  );
};