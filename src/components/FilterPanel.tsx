
import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { FilterOptions, ExpenseCategory } from '@/types/expense';

interface FilterPanelProps {
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (value: string) => {
    onFilterChange({
      ...filters,
      category: value as ExpenseCategory | 'All',
    });
  };

  const handleStartDateChange = (date: Date | undefined) => {
    onFilterChange({
      ...filters,
      startDate: date || null,
    });
  };

  const handleEndDateChange = (date: Date | undefined) => {
    onFilterChange({
      ...filters,
      endDate: date || null,
    });
  };

  const clearFilters = () => {
    onFilterChange({
      startDate: null,
      endDate: null,
      category: 'All',
    });
  };

  const toggleFilters = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="mb-3">
      {/* Filters Toggle Button */}
      <button
        onClick={toggleFilters}
        aria-expanded={isExpanded}
        aria-controls="filter-panel-content"
        className={cn(
          "md:hidden",
          "w-full flex items-center justify-between",
          "p-3 md:p-3.5 rounded-lg",
          "bg-secondary/50 hover:bg-secondary/70",
          "transition-colors duration-200",
          "border border-transparent hover:border-gray-300",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
          "touch-target"
        )}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm md:text-base font-medium text-foreground">
            Filters
          </span>
          {/* Active Filter Indicator */}
          {(filters.category !== 'All' || filters.startDate || filters.endDate) && (
            <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs font-semibold">
              {[
                filters.category !== 'All',
                filters.startDate !== null,
                filters.endDate !== null
              ].filter(Boolean).length}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200" />
        )}
      </button>

      {/* Collapsible Filter Content */}
      <div
        id="filter-panel-content"
        className={cn(
          "overflow-hidden transition-all duration-300 ease-in-out",
          "md:max-h-[800px] md:opacity-100 md:mt-3",
          isExpanded ? "max-h-[800px] opacity-100 mt-3" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-secondary/50 p-3 md:p-4 rounded-lg space-y-3 md:space-y-0">
          {/* Mobile: Stacked Layout */}
          <div className="block md:hidden space-y-3">
            {/* Category Select */}
            <div className="w-full space-y-2">
              <Label className="text-sm font-medium">
                Category
              </Label>
              <Select value={filters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger className="touch-target">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Bills">Bills</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Section */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Date Range
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {/* Start Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left touch-target min-w-0"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">
                        {filters.startDate ? format(filters.startDate, 'MMM d') : "Start"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.startDate || undefined}
                      onSelect={handleStartDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>

                {/* End Date */}
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left touch-target min-w-0"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span className="truncate text-sm">
                        {filters.endDate ? format(filters.endDate, 'MMM d') : "End"}
                      </span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={filters.endDate || undefined}
                      onSelect={handleEndDateChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Clear Filters Button */}
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full touch-target"
            >
              Clear Filters
            </Button>
          </div>

          {/* Desktop: Horizontal Layout */}
          <div className="hidden md:flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[180px]">
              <Select value={filters.category} onValueChange={handleCategoryChange}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  <SelectItem value="Groceries">Groceries</SelectItem>
                  <SelectItem value="Food">Food</SelectItem>
                  <SelectItem value="Travel">Travel</SelectItem>
                  <SelectItem value="Bills">Bills</SelectItem>
                  <SelectItem value="Others">Others</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[160px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left min-w-0">
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {filters.startDate ? format(filters.startDate, 'MMM d, yyyy') : "Start Date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate || undefined}
                    onSelect={handleStartDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex-1 min-w-[160px]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left min-w-0">
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {filters.endDate ? format(filters.endDate, 'MMM d, yyyy') : "End Date"}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate || undefined}
                    onSelect={handleEndDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button variant="ghost" onClick={clearFilters}>Clear</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FilterPanel);
