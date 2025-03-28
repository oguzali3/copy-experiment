import React from "react";
import { 
  X, BarChart3, LineChart, Eye, EyeOff, Move, Pencil, PencilOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMetricDisplayName } from "@/utils/metricDefinitions";
import { MetricSettingsPopover } from "./MetricSettingsPopover";

interface SelectedMetricsListProps {
  metrics: any[]; // Array of metric objects
  ticker: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  metricVisibility: Record<string, boolean>;
  metricLabels: Record<string, boolean>; // Added for label visibility
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
  onRemoveMetric: (metricId: string) => void;
  onToggleVisibility: (metricId: string) => void;
  onToggleLabels: (metricId: string) => void; // New handler for toggling labels
  onMetricSettingChange: (metricId: string, setting: string, value: boolean) => void;
  metricSettings: Record<string, any>;
}

const SelectedMetricsList: React.FC<SelectedMetricsListProps> = ({
  metrics,
  ticker,
  metricTypes,
  metricVisibility,
  metricLabels,
  onMetricTypeChange,
  onRemoveMetric,
  onToggleVisibility,
  onToggleLabels,
  onMetricSettingChange,
  metricSettings
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
        const displayName = metric.name || getMetricDisplayName(metric.id);
        const isVisible = metricVisibility[metric.id] !== false; // Default to visible
        const showLabels = metricLabels[metric.id] !== false; // Default to showing labels

        return (
          <div
            key={metric.id}
            className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-md bg-white"
          >
            <div className="flex items-center gap-2 flex-grow">
              <Move size={16} className="text-gray-400 cursor-grab" />
              <span className="font-medium text-gray-800">{displayName}</span>
            </div>

            <div className="flex items-center gap-1">
              {/* Chart Type Selector */}
              <Button
                variant={metricTypes[metric.id] === "bar" ? "default" : "outline"}
                size="icon"
                onClick={() => onMetricTypeChange(metric.id, "bar")}
                className="h-8 w-8"
                title="Bar Chart"
              >
                <BarChart3 size={16} />
              </Button>

              <Button
                variant={metricTypes[metric.id] === "line" ? "default" : "outline"}
                size="icon"
                onClick={() => onMetricTypeChange(metric.id, "line")}
                className="h-8 w-8"
                title="Line Chart"
              >
                <LineChart size={16} />
              </Button>

              {/* Settings Button with Popover */}
              <MetricSettingsPopover
                metric={metric}
                settings={metricSettings}
                onSettingChange={onMetricSettingChange}
              />
              
              {/* Data Label Toggle NEW */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onToggleLabels(metric.id)}
                className="h-8 w-8"
                title={showLabels ? "Hide Data Labels" : "Show Data Labels"}
              >
                {showLabels ? <Pencil size={16} /> : <PencilOff size={16} />}
              </Button>

              {/* Visibility Toggle */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onToggleVisibility(metric.id)}
                className="h-8 w-8"
                title={isVisible ? "Hide Metric" : "Show Metric"}
              >
                {isVisible ? <Eye size={16} /> : <EyeOff size={16} />}
              </Button>

              {/* Remove Button */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => onRemoveMetric(metric.id)}
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