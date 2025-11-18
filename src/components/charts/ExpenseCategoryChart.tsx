import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Sector } from 'recharts';
import { Expense, ExpenseCategory, CategorySummary } from '@/types/expense';
import { useIsMobile } from '@/hooks/use-mobile';

interface ExpenseCategoryChartProps {
  expenses: Expense[];
  isCompact?: boolean; // For landing page preview
}

const COLORS: Record<ExpenseCategory, string> = {
  Groceries: '#10b981', // emerald-500
  Food: '#f59e0b',      // amber-500
  Travel: '#3b82f6',    // blue-500
  Bills: '#ef4444',     // red-500
  Others: '#6b7280',    // gray-500
};

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={fill}
        strokeWidth={2}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
      />
    </g>
  );
};

export const ExpenseCategoryChart: React.FC<ExpenseCategoryChartProps> = ({ 
  expenses, 
  isCompact = false 
}) => {
  const [activeIndex, setActiveIndex] = React.useState<number | undefined>(undefined);
  const isMobile = useIsMobile();

  // Responsive radii - smaller on mobile and for compact mode (landing page preview)
  const innerRadius = isCompact ? 35 : (isMobile ? 50 : 65);
  const outerRadius = isCompact ? 55 : (isMobile ? 75 : 95);

  const chartData = useMemo(() => {
    if (expenses.length === 0) return [];

    const categoryMap = new Map<ExpenseCategory, number>();
    const categories: ExpenseCategory[] = ['Groceries', 'Food', 'Travel', 'Bills', 'Others'];
    categories.forEach(cat => categoryMap.set(cat, 0));

    let total = 0;
    expenses.forEach(exp => {
      const prev = categoryMap.get(exp.category) || 0;
      categoryMap.set(exp.category, prev + exp.amount);
      total += exp.amount;
    });

    return Array.from(categoryMap.entries())
      .filter(([_, amount]) => amount > 0)
      .map(([category, amount]): CategorySummary => ({
        category,
        total: amount,
        percentage: Math.round((amount / total) * 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [expenses]);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };
  const onPieLeave = () => {
    setActiveIndex(undefined);
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0-01-2-2z"
              />
            </svg>
          </div>
          <p className="text-sm text-gray-500">No expense data available</p>
        </div>
      </div>
    );
  }

  const totalAmount = chartData.reduce((sum, item) => sum + item.total, 0);

  return (
    <div className="w-full h-full flex flex-col">
      {/* Chart Container */}
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={2}
              dataKey="total"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              stroke="white"
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.category]}
                  style={{
                    filter: activeIndex === index ? 'brightness(1.1)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Pie>
            <Tooltip
              wrapperStyle={{ zIndex: 1000 }}  /* Ensure tooltip appears above center text */
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
                      <p className="text-sm font-semibold text-gray-900">{data.category}</p>
                      <p className="text-sm text-gray-600">${data.total.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">{data.percentage}% of total</p>
                    </div>
                  );
                }
                return null;
              }}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Center Total */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className={`${isCompact ? 'text-[0.55rem]' : 'text-[0.65rem] md:text-xs'} font-medium text-gray-500 uppercase tracking-wide`}>Total</p>
            <p className={`${isCompact ? 'text-sm' : 'text-base md:text-lg'} font-bold text-gray-900`}>${totalAmount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Custom Legend - Hidden in compact mode */}
      {!isCompact && (
        <div className="mt-3 pt-3 border-t border-gray-100 mb-3">
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2">
            {chartData.map((entry) => (
              <div key={entry.category} className="flex items-center space-x-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[entry.category] }}
                />
                <span className="text-xs text-gray-700 font-medium">{entry.category}</span>
                <span className="text-xs text-gray-500">({entry.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};