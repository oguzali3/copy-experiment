import React, { useState, useEffect, useRef } from 'react';

// Define metric categories and their associated metrics
export interface MetricCategory {
  id: string;
  name: string;
  icon: string; 
  metrics: Metric[];
}

export interface Metric {
  id: string;
  name: string;
  table: string;
}

interface CategoryMetricsPanelProps {
  categories: MetricCategory[];
  onMetricSelect: (metric: Metric) => void;
  selectedCategory?: string;
  onCategorySelect?: (categoryId: string) => void;
}

export const CategoryMetricsPanel: React.FC<CategoryMetricsPanelProps> = ({
  categories,
  onMetricSelect,
  selectedCategory,
  onCategorySelect,
}) => {
  // Force remounting the component with a key when the state changes
  const [componentKey, setComponentKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [displayMode, setDisplayMode] = useState<'category' | 'search' | 'empty'>(
    selectedCategory ? 'category' : 'empty'
  );
  
  // Reference to the metrics container for direct DOM manipulation if needed
  const metricsContainerRef = useRef<HTMLDivElement>(null);
  
  // Get metrics to display based on current mode
  const getMetricsToDisplay = (): Metric[] => {
    if (displayMode === 'search' && searchTerm.trim() !== '') {
      // Search mode - show matching metrics
      return categories
        .flatMap(cat => cat.metrics)
        .filter(metric => 
          metric.name.toLowerCase().includes(searchTerm.trim().toLowerCase()));
    } 
    
    if (displayMode === 'category' && selectedCategory) {
      // Category mode - show metrics for selected category
      const categoryMetrics = categories.find(cat => cat.id === selectedCategory)?.metrics;
      return categoryMetrics || [];
    }
    
    // Empty mode - show no metrics
    return [];
  };
  
  // Force remount when critical state changes
  useEffect(() => {
    setComponentKey(prev => prev + 1);
  }, [displayMode, selectedCategory]);
  
  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      // If search is cleared, revert to category or empty mode
      setDisplayMode(selectedCategory ? 'category' : 'empty');
    } else {
      // Enter search mode
      setDisplayMode('search');
    }
  };
  
  // Handle search clear button
  const handleClearSearch = () => {
    setSearchTerm('');
    setDisplayMode(selectedCategory ? 'category' : 'empty');
    
    // Force a remount to clear any stale state
    setComponentKey(prev => prev + 1);
  };
  
  // Handle category selection
  const handleCategoryClick = (categoryId: string) => {
    // Clear search field
    setSearchTerm('');
    
    if (onCategorySelect) {
      // If clicking already selected category, deselect it
      if (selectedCategory === categoryId) {
        onCategorySelect('');
        setDisplayMode('empty');
      } else {
        onCategorySelect(categoryId);
        setDisplayMode('category');
      }
    }
    
    // Force a remount to clear any stale state
    setComponentKey(prev => prev + 1);
  };
  
  // Get metrics to display
  const metricsToDisplay = getMetricsToDisplay();

  return (
    <div className="flex flex-col h-full">
      {/* Search bar with clear button */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Search metrics..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md pr-8"
          value={searchTerm}
          onChange={handleSearchChange}
        />
        {searchTerm && (
          <button 
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={handleClearSearch}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* Categories list */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`flex flex-col items-center p-2 rounded-md ${
              selectedCategory === category.id && displayMode === 'category'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => handleCategoryClick(category.id)}
          >
            <div className="text-xl mb-1">
              <i className={category.icon}></i>
            </div>
            <div className="text-xs font-medium">{category.name}</div>
          </button>
        ))}
      </div>

      {/* Mode indicator */}
      {displayMode === 'search' && searchTerm.trim() !== '' && (
        <div className="bg-blue-50 px-3 py-2 text-sm text-blue-700 border-y border-blue-200 mb-1">
          Showing search results for: "{searchTerm.trim()}"
        </div>
      )}

      {/* Metrics list - with key to force re-rendering */}
      <div 
        className="overflow-y-auto flex-grow bg-white rounded-lg border border-gray-200"
        key={`metrics-container-${componentKey}`}
      >
        <div 
          ref={metricsContainerRef}
          className="divide-y divide-gray-100"
        >
          {metricsToDisplay.length > 0 ? (
            metricsToDisplay.map((metric) => (
              <button
                key={`${componentKey}-${metric.id}`}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => onMetricSelect(metric)}
              >
                {metric.name}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {displayMode === 'search' 
                ? 'No metrics match your search' 
                : displayMode === 'category' && selectedCategory
                  ? 'No metrics in this category'
                  : 'Select a category'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};