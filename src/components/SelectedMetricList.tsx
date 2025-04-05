import React from "react";
import { 
  X, BarChart3, LineChart, Eye, EyeOff, Move, Pencil, PencilOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMetricDisplayName } from "@/utils/metricDefinitions";
import { MetricSettingsPopover } from "./MetricSettingsPopover";
import { ChartType } from "@/types/chartTypes";
import { Metric } from "@/components/CategoryMetricsPanel";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Custom stacked bar chart icon
const BarChartStacked = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="12" width="6" height="8" />
    <rect x="3" y="4" width="6" height="8" />
    <rect x="15" y="16" width="6" height="4" />
    <rect x="15" y="10" width="6" height="6" />
    <rect x="15" y="4" width="6" height="6" />
  </svg>
);

interface SortableMetricItemProps {
  metric: Metric;
  ticker: string;
  metricTypes: Record<string, ChartType>;
  metricVisibility: Record<string, boolean>;
  metricLabels: Record<string, boolean>;
  onMetricTypeChange: (metric: string, type: ChartType) => void;
  onRemoveMetric: (metricId: string) => void;
  onToggleVisibility: (metricId: string) => void;
  onToggleLabels: (metricId: string) => void;
  onMetricSettingChange: (metricId: string, setting: string, value: boolean) => void;
  metricSettings: Record<string, any>;
}

const SortableMetricItem: React.FC<SortableMetricItemProps> = ({
  metric,
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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: metric.id });

  const displayName = metric.name || getMetricDisplayName(metric.id);
  const isVisible = metricVisibility[metric.id] !== false;
  const showLabels = metricLabels[metric.id] !== false;
  const chartType = metricTypes[metric.id] || 'bar';

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.9 : 1,
    boxShadow: isDragging ? '0 5px 15px rgba(0, 0, 0, 0.1)' : 'none',
    backgroundColor: isDragging ? '#f0f9ff' : 'white',
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style}
      className="flex items-center justify-between py-3 px-4 border border-gray-200 rounded-md mb-2"
    >
      <div className="flex items-center gap-2 flex-grow">
        {/* Drag handle */}
        <div 
          {...attributes} 
          {...listeners}
          className="cursor-grab active:cursor-grabbing rounded-md p-1 hover:bg-gray-100"
        >
          <Move size={16} className={`${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
        <span className="font-medium text-gray-800">{displayName}</span>
      </div>

      <div className="flex items-center gap-1">
        {/* Chart Type Selector - Now with three options */}
        <Button
          variant={chartType === "bar" ? "default" : "outline"}
          size="icon"
          onClick={() => onMetricTypeChange(metric.id, "bar")}
          className="h-8 w-8"
          title="Bar Chart"
        >
          <BarChart3 size={16} />
        </Button>

        <Button
          variant={chartType === "stacked" ? "default" : "outline"}
          size="icon"
          onClick={() => onMetricTypeChange(metric.id, "stacked")}
          className="h-8 w-8"
          title="Stacked Bar Chart"
        >
          <BarChartStacked />
        </Button>

        <Button
          variant={chartType === "line" ? "default" : "outline"}
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
        
        {/* Data Label Toggle */}
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
};

interface SelectedMetricsListProps {
  metrics: Metric[];
  ticker: string;
  metricTypes: Record<string, ChartType>;
  metricVisibility: Record<string, boolean>;
  metricLabels: Record<string, boolean>;
  onMetricTypeChange: (metric: string, type: ChartType) => void;
  onRemoveMetric: (metricId: string) => void;
  onToggleVisibility: (metricId: string) => void;
  onToggleLabels: (metricId: string) => void;
  onMetricSettingChange: (metricId: string, setting: string, value: boolean) => void;
  metricSettings: Record<string, any>;
  onReorderMetrics?: (metrics: Metric[]) => void;
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
  metricSettings,
  onReorderMetrics = () => {}
}) => {
  if (!metrics.length) {
    return (
      <div className="text-center text-gray-500 p-4">
        No metrics selected. Please select metrics to visualize.
      </div>
    );
  }

  // Set up sensors for drag detection
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require the pointer to move 5px before activating
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle the end of a drag event
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = metrics.findIndex(metric => metric.id === active.id);
      const newIndex = metrics.findIndex(metric => metric.id === over.id);
      
      const newMetrics = arrayMove(metrics, oldIndex, newIndex);
      onReorderMetrics(newMetrics);
    }
  };

  return (
    <DndContext 
      sensors={sensors} 
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={metrics.map(metric => metric.id)} 
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-1">
          {metrics.map((metric) => (
            <SortableMetricItem
              key={metric.id}
              metric={metric}
              ticker={ticker}
              metricTypes={metricTypes}
              metricVisibility={metricVisibility}
              metricLabels={metricLabels}
              onMetricTypeChange={onMetricTypeChange}
              onRemoveMetric={onRemoveMetric}
              onToggleVisibility={onToggleVisibility}
              onToggleLabels={onToggleLabels}
              onMetricSettingChange={onMetricSettingChange}
              metricSettings={metricSettings}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SelectedMetricsList;