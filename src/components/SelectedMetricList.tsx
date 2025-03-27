import React from 'react';
import { getMetricDisplayName } from '@/utils/metricDefinitions';
import { BarChart3, LineChart, Cog, Eye, EyeOff, X, Move } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SelectedMetricsListProps {
  metrics: string[];
  ticker: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
  onRemoveMetric: (metric: string) => void;
  onToggleVisibility?: (metric: string) => void;
  metricVisibility?: Record<string, boolean>;
}

export const SelectedMetricsList: React.FC<SelectedMetricsListProps> = ({
  metrics,
  ticker,
  metricTypes,
  onMetricTypeChange,
  onRemoveMetric,
  onToggleVisibility,
  metricVisibility = {}
}) => {
  if (!metrics.length) {
    return (
      <div className="text-center text-gray-500 p-4">
        No metrics selected. Please select metrics to visualize.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {metrics.map((metric) => {
        const displayName = getMetricDisplayName(metric);
        const isVisible = metricVisibility[metric] !== false; // Default to visible

        return (
          <div 
            key={metric} 
            className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-md bg-white"
          >
            <div className="flex items-center gap-2 flex-grow">
              <Move size={16} className="text-gray-400 cursor-grab" />
              <span className="font-medium text-gray-800">{displayName}</span>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Chart Type Selector */}
              <Button
                variant={metricTypes[metric] === 'bar' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onMetricTypeChange(metric, 'bar')}
                className="h-8 w-8"
                title="Bar Chart"
              >
                <BarChart3 size={16} />
              </Button>
              
              <Button
                variant={metricTypes[metric] === 'line' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onMetricTypeChange(metric, 'line')}
                className="h-8 w-8"
                title="Line Chart"
              >
                <LineChart size={16} />
              </Button>
              
              {/* Settings Button (Optional) */}
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                title="Metric Settings"
              >
                <Cog size={16} />
              </Button>
              
              {/* Visibility Toggle (Optional) */}
              {onToggleVisibility && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onToggleVisibility(metric)}
                  className="h-8 w-8"
                  title={isVisible ? "Hide Metric" : "Show Metric"}
                >
                  {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
                </Button>
              )}
              
              {/* Remove Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onRemoveMetric(metric)}
                className="h-8 w-8 text-gray-500 hover:text-red-500"
                title="Remove Metric"
              >
                <X size={16} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SelectedMetricsList;