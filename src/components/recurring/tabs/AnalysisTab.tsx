/**
 * =====================================================
 * ANALYSIS TAB
 * =====================================================
 * 
 * Insights and charts for recurring payments.
 */

import React from 'react';
import { useRecurringAnalytics } from '@/hooks/useRecurringAnalytics';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  CreditCard, 
  Target,
  DollarSign,
  PieChart as PieChartIcon
} from 'lucide-react';
import { format, parse } from 'date-fns';

// =====================================================
// CHART COLORS
// =====================================================

const CATEGORY_COLORS: Record<string, string> = {
  'Bills': 'hsl(0, 84%, 60%)',
  'Groceries': 'hsl(142, 71%, 45%)',
  'Food': 'hsl(25, 95%, 53%)',
  'Travel': 'hsl(217, 91%, 60%)',
  'Others': 'hsl(280, 67%, 55%)',
};

const getCurrencySymbol = (currency: string) => currency === 'INR' ? '₹' : '$';

// =====================================================
// MAIN COMPONENT
// =====================================================

export const AnalysisTab: React.FC = () => {
  const { 
    analytics, 
    monthlyTrend, 
    categoryBreakdown, 
    topItems,
    isLoading 
  } = useRecurringAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Format monthly trend data for chart
  const chartData = monthlyTrend.map(item => ({
    month: format(parse(item.month, 'yyyy-MM', new Date()), 'MMM'),
    total: item.total,
  }));

  // Format pie chart data
  const pieData = categoryBreakdown.map(item => ({
    name: item.category,
    value: item.amount,
    percentage: item.percentage,
  }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Monthly Commitment */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Monthly Commitment</p>
                <p className="text-2xl font-bold">
                  ${analytics.monthlyCommitment.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* This Month's Spend */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <DollarSign className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">This Month Spend</p>
                <p className="text-2xl font-bold">
                  ${analytics.thisMonthSpend.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Subscriptions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-info/10">
                <CreditCard className="h-5 w-5 text-info-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold">
                  {analytics.activePlansCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Largest Recurring */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Target className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Largest Item</p>
                {analytics.largestRecurring ? (
                  <>
                    <p className="text-lg font-bold truncate max-w-[120px]">
                      {analytics.largestRecurring.name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {getCurrencySymbol(analytics.largestRecurring.currency)}
                      {analytics.largestRecurring.amount.toFixed(0)}
                    </p>
                  </>
                ) : (
                  <p className="text-lg font-bold text-muted-foreground">—</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              Monthly Recurring Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <YAxis 
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Spend']}
                  />
                  <Bar 
                    dataKey="total" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No data available yet
              </div>
            )}
          </CardContent>
        </Card>

        {/* Category Breakdown Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PieChartIcon className="h-5 w-5" />
              Spend by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percentage }) => `${name} (${percentage.toFixed(0)}%)`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={CATEGORY_COLORS[entry.name] || 'hsl(var(--muted))'} 
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`$${value.toFixed(2)}`, 'Monthly']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                No active recurring plans
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Recurring Items */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Top Recurring Items (Last 3 Months)</CardTitle>
        </CardHeader>
        <CardContent>
          {topItems.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Bank</TableHead>
                    <TableHead className="text-right">Monthly</TableHead>
                    <TableHead className="text-right">Total (3mo)</TableHead>
                    <TableHead className="text-right">Share</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topItems.map((item) => (
                    <TableRow key={item.planId}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.bankName || '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        ${item.monthlyAmount.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.totalSpend.toFixed(0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {item.shareOfTotal.toFixed(0)}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              No payment history to analyze yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
