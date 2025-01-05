import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X } from "lucide-react";

interface WatchlistMetricsProps {
  selectedMetrics: string[];
  onMetricSelect: (metricId: string) => void;
  onRemoveMetric: (metricId: string) => void;
  availableMetrics: Array<{
    id: string;
    name: string;
    description: string;
  }>;
}

export const WatchlistMetrics = ({
  selectedMetrics,
  onMetricSelect,
  onRemoveMetric,
  availableMetrics,
}: WatchlistMetricsProps) => {
  return (
    <div className="border rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-gray-700">Watchlist Columns</span>
        {selectedMetrics.map((metricId) => {
          const metric = availableMetrics.find(m => m.id === metricId);
          return (
            <Badge key={metricId} variant="secondary" className="bg-gray-100">
              {metric?.name}
              <button
                onClick={() => onRemoveMetric(metricId)}
                className="ml-2 hover:text-red-500"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          );
        })}
      </div>
      <Select onValueChange={onMetricSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Add metric..." />
        </SelectTrigger>
        <SelectContent>
          {availableMetrics.map((metric) => (
            <SelectItem
              key={metric.id}
              value={metric.id}
              disabled={selectedMetrics.includes(metric.id)}
            >
              <div className="flex flex-col">
                <span>{metric.name}</span>
                <span className="text-xs text-gray-500">{metric.description}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};