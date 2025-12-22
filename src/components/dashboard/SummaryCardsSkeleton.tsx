import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const SummaryCardsSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="bg-card border border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SummaryCardsSkeleton;
