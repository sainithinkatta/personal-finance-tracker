import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UpcomingTab } from "./tabs/UpcomingTab";
import { ActivePlansTab } from "./tabs/ActivePlansTab";
import { CompletedTab } from "./tabs/CompletedTab";
import { AnalysisTab } from "./tabs/AnalysisTab";
import { cn } from "@/lib/utils";

export const RecurringPage: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState("upcoming");

  const triggerClassName = cn(
    "flex-1 h-full rounded-xl px-3 sm:px-4 text-sm font-semibold",
    "flex items-center justify-center whitespace-nowrap",
    "transition-all duration-200",
    "text-slate-600",
    "hover:bg-white/60 hover:text-slate-900",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "data-[state=active]:bg-white data-[state=active]:text-blue-600",
    "data-[state=active]:shadow-sm data-[state=active]:ring-1 data-[state=active]:ring-black/5"
  );

  return (
    <div className="space-y-4">
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="w-full">
        <div className="w-full overflow-x-auto no-scrollbar -mx-1 px-1">
          <TabsList
            className={cn(
              "h-12",
              "inline-flex w-max min-w-full sm:w-full sm:grid sm:grid-cols-4",
              "items-center gap-1 rounded-2xl bg-muted/40 p-1",
              "overflow-hidden"
            )}
          >
            <TabsTrigger value="upcoming" className={triggerClassName}>
              Upcoming
            </TabsTrigger>

            <TabsTrigger value="active" className={triggerClassName}>
              Active Plans
            </TabsTrigger>

            <TabsTrigger value="completed" className={triggerClassName}>
              Completed
            </TabsTrigger>

            <TabsTrigger value="analysis" className={triggerClassName}>
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