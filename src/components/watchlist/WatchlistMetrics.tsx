// src/components/watchlist/WatchlistMetrics.tsx
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MetricInfo {
  id: string;
  name: string;
  description: string;
}

interface MetricCategory {
  category: string;
  metrics: MetricInfo[];
}

interface WatchlistMetricsProps {
  selectedMetrics: string[];
  onMetricSelect: (metricId: string) => void;
  onRemoveMetric: (metricId: string) => void;
  availableMetrics: MetricInfo[];
  categorizedMetrics?: MetricCategory[]; // Optional prop for categorized metrics
  isDisabled?: boolean; // New prop to disable interactions during operations
}

export const WatchlistMetrics = ({
  selectedMetrics,
  onMetricSelect,
  onRemoveMetric,
  availableMetrics,
  categorizedMetrics,
  isDisabled = false
}: WatchlistMetricsProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Get a metric by its ID from either available or categorized metrics
  const getMetricById = (id: string): MetricInfo | undefined => {
    return availableMetrics.find(m => m.id === id);
  };

  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-700">Watchlist Columns</span>
        {selectedMetrics.map((metricId) => {
          const metric = getMetricById(metricId);
          return (
            <Badge key={metricId} variant="secondary" className="bg-gray-100">
              {metric?.name || metricId}
              <button
                onClick={() => onRemoveMetric(metricId)}
                className={`ml-2 ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'hover:text-red-500'}`}
                disabled={isDisabled}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
      
      {/* Search input for metrics */}
      <div className="relative">
        <Input
          className="pl-9"
          placeholder="Search metrics..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value.toLowerCase())}
          disabled={isDisabled}
        />
        <Search className={`h-4 w-4 absolute left-3 top-3 ${isDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
      </div>
      
      {/* Categorized dropdown when categories are available */}
      {categorizedMetrics && categorizedMetrics.length > 0 ? (
        <Select onValueChange={onMetricSelect} disabled={isDisabled}>
          <SelectTrigger className={isDisabled ? 'opacity-70 cursor-not-allowed' : ''}>
            <SelectValue placeholder="Add metric..." />
          </SelectTrigger>
          <SelectContent className="max-h-96 overflow-y-auto">
            {categorizedMetrics.map((category) => {
              // Filter metrics based on search term
              const filteredMetrics = category.metrics.filter(
                m => 
                  !selectedMetrics.includes(m.id) && 
                  (m.name.toLowerCase().includes(searchTerm) || 
                  m.description.toLowerCase().includes(searchTerm))
              );
              
              // Skip empty categories after filtering
              if (filteredMetrics.length === 0) return null;
              
              return (
                <SelectGroup key={category.category}>
                  <SelectLabel className="font-semibold text-sm">{category.category}</SelectLabel>
                  {filteredMetrics.map((metric) => (
                    <SelectItem
                      key={metric.id}
                      value={metric.id}
                    >
                      <div className="flex flex-col py-1">
                        <span className="font-medium">{metric.name}</span>
                        <span className="text-xs text-gray-500">{metric.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectGroup>
              );
            })}
          </SelectContent>
        </Select>
      ) : (
        /* Fallback to flat list when categories aren't available */
        <Select onValueChange={onMetricSelect} disabled={isDisabled}>
          <SelectTrigger className={isDisabled ? 'opacity-70 cursor-not-allowed' : ''}>
            <SelectValue placeholder="Add metric..." />
          </SelectTrigger>
          <SelectContent className="max-h-96 overflow-y-auto">
            {availableMetrics
              .filter(
                m => 
                  !selectedMetrics.includes(m.id) && 
                  (m.name.toLowerCase().includes(searchTerm) || 
                  m.description.toLowerCase().includes(searchTerm))
              )
              .map((metric) => (
                <SelectItem
                  key={metric.id}
                  value={metric.id}
                >
                  <div className="flex flex-col py-1">
                    <span className="font-medium">{metric.name}</span>
                    <span className="text-xs text-gray-500">{metric.description}</span>
                  </div>
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      )}
      
      {/* Display help text if no metrics are selected */}
      {selectedMetrics.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          Select metrics to display in your watchlist table. Metrics will appear as columns.
        </p>
      )}
    </div>
  );
};