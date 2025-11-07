
import React from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
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

  return (
    <div className="bg-secondary/50 p-3 md:p-4 rounded-lg space-y-3 md:space-y-0">
      {/* Mobile: Stacked Layout */}
      <div className="block md:hidden space-y-3">
        {/* Category Select */}
        <div className="w-full">
          <label className="text-xs font-medium text-gray-600 mb-1.5 block">
            Category
          </label>
          <Select value={filters.category} onValueChange={handleCategoryChange}>
            <SelectTrigger className="h-11 rounded-xl border-gray-300 touch-target">
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
          <label className="text-xs font-medium text-gray-600 block">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            {/* Start Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-11 rounded-xl border-gray-300 px-3 hover:bg-gray-50 touch-target"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500" />
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {/* End Date */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-11 rounded-xl border-gray-300 px-3 hover:bg-gray-50 touch-target"
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0 text-gray-500" />
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
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Clear Filters Button */}
        <Button 
          variant="outline" 
          onClick={clearFilters} 
          className="w-full h-11 rounded-xl border-gray-300 hover:bg-gray-50 font-medium text-gray-700 touch-target"
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
              <Button variant="outline" className={cn("w-full justify-start text-left")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.startDate ? format(filters.startDate, 'MMM d, yyyy') : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.startDate || undefined}
                onSelect={handleStartDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1 min-w-[160px]">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-full justify-start text-left")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {filters.endDate ? format(filters.endDate, 'MMM d, yyyy') : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={filters.endDate || undefined}
                onSelect={handleEndDateChange}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>

        <Button variant="ghost" onClick={clearFilters} className="flex-0">Clear</Button>
      </div>
    </div>
  );
};

export default FilterPanel;
