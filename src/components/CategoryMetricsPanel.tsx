import React, { useState } from 'react';

// Define metric categories and their associated metrics
export interface MetricCategory {
  id: string;
  name: string;
  icon: string; // Changed from React.ReactNode to string for Bootstrap icon classes
  metrics: Metric[];
}

export interface Metric {
  id: string;
  name: string;
  table: string; // Which table this metric belongs to (for API)
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
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter metrics based on search term
  const filteredMetrics = selectedCategory 
    ? categories
        .find(cat => cat.id === selectedCategory)
        ?.metrics.filter(metric => 
          metric.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : categories
        .flatMap(cat => cat.metrics)
        .filter(metric => 
          metric.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search metrics..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Categories list */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category.id}
            className={`flex flex-col items-center p-2 rounded-md ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-800'
                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
            }`}
            onClick={() => onCategorySelect && onCategorySelect(category.id)}
          >
            <div className="text-xl mb-1">
              <i className={category.icon}></i>
            </div>
            <div className="text-xs font-medium">{category.name}</div>
          </button>
        ))}
      </div>

      {/* Metrics list */}
      <div className="overflow-y-auto flex-grow bg-white rounded-lg border border-gray-200">
        <div className="divide-y divide-gray-100">
          {filteredMetrics && filteredMetrics.length > 0 ? (
            filteredMetrics.map((metric) => (
              <button
                key={metric.id}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                onClick={() => onMetricSelect(metric)}
              >
                {metric.name}
              </button>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'No metrics match your search' : 'Select a category'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};