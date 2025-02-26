import { ResponsiveContainer, ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { getMetricColor, formatYAxis } from './chartUtils';
import { ChartTooltip } from './ChartTooltip';
import { DndContext, DragEndEvent, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableMetricItem } from './DraggableMetricItem';
import { getMetricDisplayName } from '@/utils/metricDefinitions';
import { ChartDownloadDialog, DownloadOptions } from './ChartDownloadDialog';
import { RefObject, useRef } from 'react';

interface MetricChartProps {
  data: any[];
  metrics: string[];
  ticker?: string;
  metricTypes: Record<string, 'bar' | 'line'>;
  onMetricTypeChange: (metric: string, type: 'bar' | 'line') => void;
  onMetricsReorder?: (metrics: string[]) => void;
}

export const MetricChart = ({ 
  data, 
  metrics, 
  ticker,
  metricTypes,
  onMetricTypeChange,
  onMetricsReorder
}: MetricChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  const handleDownload = async (options: DownloadOptions) => {
    if (!chartContainerRef.current) return;

    try {
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      tempDiv.style.width = `${options.width}px`;
      tempDiv.style.height = `${options.height}px`;
      tempDiv.style.backgroundColor = options.transparentBackground ? 'transparent' : options.backgroundColor;
      document.body.appendChild(tempDiv);

      const chartContent = chartRef.current?.querySelector('.recharts-wrapper');
      if (!chartContent) return;

      const clone = chartContent.cloneNode(true) as HTMLElement;
      clone.style.width = '100%';
      clone.style.height = '100%';
      
      clone.style.transform = 'none';
      clone.style.transition = 'none';
      
      const svg = clone.querySelector('svg');
      if (svg) {
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.setAttribute('preserveAspectRatio', 'none');
      }

      tempDiv.appendChild(clone);

      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: options.transparentBackground ? null : options.backgroundColor,
        scale: 2,
        logging: true,
        width: options.width,
        height: options.height,
        removeContainer: true,
      });

      document.body.removeChild(tempDiv);

      canvas.toBlob((blob) => {
        if (!blob) return;
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${ticker}-chart.${options.format.toLowerCase()}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, options.format === 'PNG' ? 'image/png' : 'image/jpeg');
    } catch (error) {
      console.error('Error downloading chart:', error);
    }
  };

  if (!data?.length || !metrics?.length) {
    return (
      <div className="w-full bg-white p-4 rounded-lg flex items-center justify-center h-[300px] border border-gray-200">
        <p className="text-gray-500">
          {!metrics?.length ? 'Select metrics to visualize' : 'No data available'}
        </p>
      </div>
    );
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = metrics.indexOf(active.id as string);
      const newIndex = metrics.indexOf(over.id as string);
      
      const newMetrics = [...metrics];
      newMetrics.splice(oldIndex, 1);
      newMetrics.splice(newIndex, 0, active.id as string);
      
      onMetricsReorder?.(newMetrics);
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (a.period === 'TTM') return 1;
    if (b.period === 'TTM') return -1;
    
    if (a.period.includes('Q') && b.period.includes('Q')) {
      const [aQ, aYear] = a.period.split(' ');
      const [bQ, bYear] = b.period.split(' ');
      
      if (aYear !== bYear) {
        return parseInt(aYear) - parseInt(bYear);
      }
      return parseInt(aQ.slice(1)) - parseInt(bQ.slice(1));
    }
    
    return parseInt(a.period) - parseInt(b.period);
  });

  return (
    <div className="space-y-4">
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="flex justify-between items-start">
          <SortableContext items={metrics} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {metrics.map((metric, index) => (
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
          <ChartDownloadDialog onDownload={handleDownload} previewRef={chartRef} />
        </div>
      </DndContext>

      <div className="bg-white p-4 rounded-lg border border-gray-200" ref={chartContainerRef}>
        <div className="h-[300px]" ref={chartRef}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={sortedData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="#E5E7EB"
                vertical={false}
                opacity={0.3}
              />
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={20}
                dy={5}
              />
              <YAxis 
                tickFormatter={formatYAxis}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#E5E7EB' }}
                tickLine={false}
                width={80}
              />
              <Tooltip 
                content={<ChartTooltip ticker={ticker} />}
                cursor={{ fill: 'rgba(243, 244, 246, 0.8)' }}
              />
              
              {metrics.map((metric, index) => {
                const color = getMetricColor(index);
                const displayName = getMetricDisplayName(metric);
                
                if (metricTypes[metric] === 'line') {
                  return (
                    <Line
                      key={metric}
                      type="linear"
                      dataKey={metric}
                      stroke={color}
                      name={displayName}
                      dot={false}
                      strokeWidth={2}
                    />
                  );
                }
                return (
                  <Bar
                    key={metric}
                    dataKey={metric}
                    fill={color}
                    name={displayName}
                    radius={[0, 0, 0, 0]}
                    maxBarSize={40}
                  />
                );
              })}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 border-t border-gray-200 pt-4">
          <div className="flex flex-col gap-2">
            {metrics.map((metric, index) => {
              const firstValue = sortedData[sortedData.length - 1][metric];
              const lastValue = sortedData[0][metric];
              const totalChange = ((lastValue - firstValue) / Math.abs(firstValue)) * 100;
              const periods = sortedData.length - 1;
              const cagr = periods > 0 ? 
                (Math.pow(lastValue / firstValue, 1 / periods) - 1) * 100 : 
                0;

              return (
                <div key={metric} className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getMetricColor(index) }}
                  />
                  <span className="text-gray-900 font-medium">
                    {ticker} - {getMetricDisplayName(metric)} {' '}
                    (Total Change: {totalChange.toFixed(2)}%) {' '}
                    {periods > 0 && `(CAGR: ${cagr.toFixed(2)}%)`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
