
import React from 'react';
import { MetricChart } from './MetricChart';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableMetricItem } from './DraggableMetricItem';
import { ChartDownloadDialog } from './ChartDownloadDialog';

interface MetricsChartSectionProps {
  selectedMetrics: string[];
  data: any[];
  ticker: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
  onMetricsReorder?: (metrics: string[]) => void;
}

export const MetricsChartSection = ({
  selectedMetrics,
  data,
  ticker,
  metricTypes,
  onMetricTypeChange,
  onMetricsReorder,
}: MetricsChartSectionProps) => {
  if (selectedMetrics.length === 0) {
    return null;
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = selectedMetrics.indexOf(active.id as string);
      const newIndex = selectedMetrics.indexOf(over.id as string);
      
      const newMetrics = [...selectedMetrics];
      newMetrics.splice(oldIndex, 1);
      newMetrics.splice(newIndex, 0, active.id as string);
      
      onMetricsReorder?.(newMetrics);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 md:px-8 lg:px-12">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex justify-between items-start mb-4">
          <SortableContext items={selectedMetrics} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {selectedMetrics.map((metric, index) => (
                <DraggableMetricItem
                  key={metric}
                  metric={metric}
                  index={index}
                  type={metricTypes[metric]}
                  onTypeChange={(type) => onMetricTypeChange(metric, type)}
                />
              ))}
            </div>
          </SortableContext>
          <ChartDownloadDialog onDownload={() => {}} previewRef={{ current: null }} />
        </div>
        <MetricChart 
          data={data}
          metrics={selectedMetrics}
          ticker={ticker}
          metricTypes={metricTypes}
          onMetricTypeChange={onMetricTypeChange}
          onMetricsReorder={onMetricsReorder}
        />
      </DndContext>
    </div>
  );
};
