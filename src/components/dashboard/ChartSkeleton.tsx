import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

interface ChartSkeletonProps {
  className?: string;
}

const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ className }) => {
  return (
    <Card className={`bg-card border border-border/60 shadow-sm ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-2 w-2 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="flex items-center justify-center h-[280px]">
          <div className="relative">
            {/* Circular skeleton for pie chart */}
            <Skeleton className="h-40 w-40 rounded-full" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-20 w-20 rounded-full bg-card" />
            </div>
          </div>
        </div>
        {/* Legend skeleton */}
        <div className="flex flex-wrap justify-center gap-3 mt-4 pt-3 border-t border-border">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-3 w-3 rounded-full" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChartSkeleton;
