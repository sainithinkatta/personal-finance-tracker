import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UpcomingTab } from './tabs/UpcomingTab';
import { ActivePlansTab } from './tabs/ActivePlansTab';
import { CompletedTab } from './tabs/CompletedTab';
import { AnalysisTab } from './tabs/AnalysisTab';
import { cn } from '@/lib/utils';

export const RecurringPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState('upcoming');

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        {/* Mobile: Scrollable tabs */}
        <div className="w-full overflow-x-auto no-scrollbar -mx-1 px-1">
          <TabsList className={cn(
            "inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-4",
            "bg-muted/50 p-1 rounded-lg gap-1"
          )}>
            <TabsTrigger
              value="upcoming"
              className="flex-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md"
            >
              Upcoming
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="flex-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md"
            >
              Active Plans
            </TabsTrigger>
            <TabsTrigger
              value="completed"
              className="flex-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md"
            >
              Completed
            </TabsTrigger>
            <TabsTrigger
              value="analysis"
              className="flex-1 whitespace-nowrap text-xs sm:text-sm px-3 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-blue-600 rounded-md"
            >
              Analysis
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="upcoming" className="mt-4">
          <UpcomingTab />
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <ActivePlansTab />
        </TabsContent>

        <TabsContent value="completed" className="mt-4">
          <CompletedTab />
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <AnalysisTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecurringPage;
