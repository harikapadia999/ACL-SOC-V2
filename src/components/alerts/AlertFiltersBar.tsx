import React, { useState, useCallback } from 'react';
import { Search, Filter, Calendar, X, RefreshCw, Download } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';

interface AlertFiltersBarProps {
  onFilterChange: (filters: any) => void;
}

// Debounce utility function
function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  return useCallback(
    (...args: Parameters<T>) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      const newTimeoutId = setTimeout(() => {
        callback(...args);
      }, delay);

      setTimeoutId(newTimeoutId);
    },
    [callback, delay, timeoutId]
  );
}

export const AlertFiltersBar: React.FC<AlertFiltersBarProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    search: '',
    severity: '',
    verdict: '',
    source: '',
    status: '',
  });

  const [searchValue, setSearchValue] = useState('');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Debounced search handler (300ms delay)
  const debouncedSearch = useDebounce((value: string) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Count active filters
    const count = Object.values(newFilters).filter(v => v !== '').length;
    setActiveFiltersCount(count);
  }, 300);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
    
    // Count active filters
    const count = Object.values(newFilters).filter(v => v !== '').length;
    setActiveFiltersCount(count);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      search: '',
      severity: '',
      verdict: '',
      source: '',
      status: '',
    };
    setFilters(clearedFilters);
    setSearchValue('');
    onFilterChange(clearedFilters);
    setActiveFiltersCount(0);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Alert ID or description..."
            className="w-full pl-11 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            value={searchValue}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
          {searchValue && (
            <button
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {searchValue && (
          <p className="text-xs text-slate-500 mt-2">
            🔍 Searching... (debounced for performance)
          </p>
        )}
      </div>

      {/* Filters Row */}
      <div className="card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            <Select
              options={[
                { value: '', label: 'All Severities' },
                { value: 'critical', label: '🔴 Critical' },
                { value: 'high', label: '🟠 High' },
                { value: 'medium', label: '🟡 Medium' },
                { value: 'low', label: '🔵 Low' },
              ]}
              value={filters.severity}
              onChange={(e) => handleFilterChange('severity', e.target.value)}
              className="min-w-[160px]"
            />

            <Select
              options={[
                { value: '', label: 'All Verdicts' },
                { value: 'true_positive', label: 'True Positive' },
                { value: 'false_positive', label: 'False Positive' },
                { value: 'indeterminate', label: 'Indeterminate' },
              ]}
              value={filters.verdict}
              onChange={(e) => handleFilterChange('verdict', e.target.value)}
              className="min-w-[160px]"
            />

            <Select
              options={[
                { value: '', label: 'All Sources' },
                { value: 'Azure AD', label: 'Azure AD' },
                { value: 'EDR', label: 'EDR' },
                { value: 'Network Monitor', label: 'Network Monitor' },
                { value: 'Email Gateway', label: 'Email Gateway' },
                { value: 'Firewall', label: 'Firewall' },
                { value: 'Windows Security', label: 'Windows Security' },
                { value: 'DLP', label: 'DLP' },
              ]}
              value={filters.source}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="min-w-[160px]"
            />

            <Select
              options={[
                { value: '', label: 'All Status' },
                { value: 'active', label: '🟡 Active' },
                { value: 'triaged', label: '🟢 Triaged' },
                { value: 'closed', label: '⚫ Closed' },
              ]}
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="min-w-[140px]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {activeFiltersCount > 0 && (
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleClearFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear ({activeFiltersCount})
              </Button>
            )}
            
            <Button 
              variant="secondary" 
              size="sm"
              className="flex items-center gap-2"
              disabled
              title="Coming soon"
            >
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>

            <Button 
              variant="secondary" 
              size="sm"
              className="flex items-center gap-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            <Button 
              variant="secondary" 
              size="sm"
              className="flex items-center gap-2"
              disabled
              title="Coming soon"
            >
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-600 font-medium">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {filters.search && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                Search: "{filters.search}"
                <button 
                  onClick={() => handleSearchChange('')}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.severity && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                Severity: {filters.severity}
                <button 
                  onClick={() => handleFilterChange('severity', '')}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.verdict && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                Verdict: {filters.verdict.replace('_', ' ')}
                <button 
                  onClick={() => handleFilterChange('verdict', '')}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.source && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                Source: {filters.source}
                <button 
                  onClick={() => handleFilterChange('source', '')}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
            {filters.status && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 text-primary-700 rounded-md text-xs font-medium">
                Status: {filters.status}
                <button 
                  onClick={() => handleFilterChange('status', '')}
                  className="hover:text-primary-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
