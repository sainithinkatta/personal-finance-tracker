import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";
import { ResponsiveSheet } from "@/components/layout/ResponsiveSheet";
import { FilterOptions, ExpenseCategory } from "@/types/expense";

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const initialFilters: FilterOptions = {
  startDate: null,
  endDate: null,
  category: "All",
};

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const isMobile = useIsMobile();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [mobileFilters, setMobileFilters] = useState<FilterOptions>(filters);

  useEffect(() => {
    if (isSheetOpen) {
      setMobileFilters(filters);
    }
  }, [filters, isSheetOpen]);

  const currentFilters = isMobile && isSheetOpen ? mobileFilters : filters;

  const handleCategoryChange = (value: string) => {
    const updatedFilters = {
      ...currentFilters,
      category: value as ExpenseCategory | "All",
    };

    if (isMobile && isSheetOpen) {
      setMobileFilters(updatedFilters);
    } else {
      onFilterChange(updatedFilters);
    }
  };

  const handleStartDateChange = (value: string) => {
    const dateValue = value ? new Date(`${value}T00:00:00`) : null;
    const updatedFilters = {
      ...currentFilters,
      startDate: dateValue,
    };

    if (isMobile && isSheetOpen) {
      setMobileFilters(updatedFilters);
    } else {
      onFilterChange(updatedFilters);
    }
  };

  const handleEndDateChange = (value: string) => {
    const dateValue = value ? new Date(`${value}T00:00:00`) : null;
    const updatedFilters = {
      ...currentFilters,
      endDate: dateValue,
    };

    if (isMobile && isSheetOpen) {
      setMobileFilters(updatedFilters);
    } else {
      onFilterChange(updatedFilters);
    }
  };

  const clearFilters = () => {
    if (isMobile) {
      setMobileFilters(initialFilters);
      onFilterChange(initialFilters);
      setIsSheetOpen(false);
    } else {
      onFilterChange(initialFilters);
    }
  };

  const handleApply = () => {
    onFilterChange(mobileFilters);
    setIsSheetOpen(false);
  };

  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            className="h-11 flex-1 rounded-xl bg-muted/80 text-sm font-medium text-foreground"
            onClick={() => setIsSheetOpen(true)}
          >
            <SlidersHorizontal className="mr-2 h-4 w-4" /> Filters
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="ml-2 h-11 rounded-xl px-4 text-sm font-medium text-muted-foreground"
            onClick={clearFilters}
          >
            Clear
          </Button>
        </div>

        <ResponsiveSheet
          open={isSheetOpen}
          onOpenChange={setIsSheetOpen}
          title="Filter expenses"
          description="Refine the list by category and date range."
          footer={(
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                className="h-11 rounded-xl border border-muted-foreground/20 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="h-11 rounded-xl bg-primary text-[15px] font-semibold text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                Apply
              </button>
            </div>
          )}
          contentClassName="pb-24"
        >
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="mobile-category">
                Category
              </label>
              <Select
                value={mobileFilters.category}
                onValueChange={handleCategoryChange}
              >
                <SelectTrigger
                  id="mobile-category"
                  className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
                >
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent className="text-[15px]">
                  <SelectItem value="All">All categories</SelectItem>
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Bills">Bills</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="mobile-start-date">
                Start date
              </label>
              <Input
                id="mobile-start-date"
                type="date"
                value={mobileFilters.startDate ? format(mobileFilters.startDate, "yyyy-MM-dd") : ""}
                onChange={(event) => handleStartDateChange(event.target.value)}
                className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground" htmlFor="mobile-end-date">
                End date
              </label>
              <Input
                id="mobile-end-date"
                type="date"
                value={mobileFilters.endDate ? format(mobileFilters.endDate, "yyyy-MM-dd") : ""}
                onChange={(event) => handleEndDateChange(event.target.value)}
                className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
        </ResponsiveSheet>
      </div>
    );
  }

  return (
    <div className="hidden md:flex flex-wrap items-end gap-3">
      <div className="min-w-[200px] space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="desktop-category">
          Category
        </label>
        <Select value={filters.category} onValueChange={handleCategoryChange}>
          <SelectTrigger
            id="desktop-category"
            className="h-11 rounded-xl border border-muted-foreground/30 text-left text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
          >
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent className="text-[15px]">
            <SelectItem value="All">All categories</SelectItem>
            <SelectItem value="Groceries">Groceries</SelectItem>
            <SelectItem value="Food">Food</SelectItem>
            <SelectItem value="Travel">Travel</SelectItem>
            <SelectItem value="Bills">Bills</SelectItem>
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="min-w-[180px] space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="desktop-start-date">
          Start date
        </label>
        <Input
          id="desktop-start-date"
          type="date"
          value={filters.startDate ? format(filters.startDate, "yyyy-MM-dd") : ""}
          onChange={(event) => handleStartDateChange(event.target.value)}
          className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="min-w-[180px] space-y-1.5">
        <label className="text-xs font-medium text-muted-foreground" htmlFor="desktop-end-date">
          End date
        </label>
        <Input
          id="desktop-end-date"
          type="date"
          value={filters.endDate ? format(filters.endDate, "yyyy-MM-dd") : ""}
          onChange={(event) => handleEndDateChange(event.target.value)}
          className="h-11 rounded-xl border border-muted-foreground/30 px-3 text-[15px] focus:border-primary focus:ring-2 focus:ring-primary"
        />
      </div>

      <Button
        type="button"
        variant="ghost"
        className="h-11 rounded-xl px-4 text-sm font-medium text-muted-foreground hover:bg-muted/80"
        onClick={clearFilters}
      >
        Clear
      </Button>
    </div>
  );
};

export default FilterPanel;
