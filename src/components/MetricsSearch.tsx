import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, XCircleIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Metric } from './CategoryMetricsPanel';
// In your components
import { metricCategories } from '@/data/metricCategories';
// Flatten all metrics from all categories for search
const allMetrics = metricCategories.flatMap(category => category.metrics);

interface MetricsSearchProps {
  onMetricSelect: (metric: Metric) => void;
}

export const MetricsSearch: React.FC<MetricsSearchProps> = ({ onMetricSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMetrics, setFilteredMetrics] = useState<Metric[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter metrics when search term changes
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMetrics([]);
      return;
    }

    const filtered = allMetrics
      .filter(metric => 
        metric.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .slice(0, 10); // Limit to top 10 results

    setFilteredMetrics(filtered);
  }, [searchTerm]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle metric selection
  const handleMetricClick = (metric: Metric) => {
    onMetricSelect(metric);
    setSearchTerm('');
    setIsOpen(false);
  };

  // Clear search
  const handleClear = () => {
    setSearchTerm('');
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for metrics..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          onClick={() => setIsOpen(true)}
          className="w-full pl-10 pr-10"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </div>
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={handleClear}
          >
            <XCircleIcon className="w-5 h-5 text-gray-400" />
          </Button>
        )}
      </div>

      {/* Results dropdown */}
      {isOpen && filteredMetrics.length > 0 && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-y-auto"
        >
          <div className="divide-y divide-gray-100">
            {filteredMetrics.map((metric) => (
              <button
                key={metric.id}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors"
                onClick={() => handleMetricClick(metric)}
              >
                <div className="font-medium">{metric.name}</div>
                <div className="text-xs text-gray-500">
                  {metricCategories.find(cat => 
                    cat.metrics.some(m => m.id === metric.id)
                  )?.name || ''}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};