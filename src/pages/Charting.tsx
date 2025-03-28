import React, { useState } from "react";
import { CompanySearch } from "@/components/CompanySearch";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { MetricChart } from "@/components/financials/MetricChartforCharting";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryMetricsPanel, Metric } from"@/components/CategoryMetricsPanel";
import { metricCategories } from '@/data/metricCategories';
import { Button } from "@/components/ui/button";
import { X, BarChart3, LineChart, Cog, Eye, EyeOff, Move, Pencil, PencilOff } from "lucide-react";
import { useRef } from "react";
import { ChartExport } from "@/components/financials/ChartExport";
import { getMetricDisplayName } from "@/utils/metricDefinitions";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { 
  transformSingleMetricData, 
  mergeMetricsData, 
  transformToChartFormat,
  debugTransformation 
} from '@/utils/dataTransformer';

// API base URL
const API_BASE_URL = "http://localhost:4000/api/analysis";

// Settings Popover Component
const MetricSettingsPopover = ({ metric, settings, onSettingChange }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          title="Metric Settings"
        >
          <Cog size={16} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="space-y-2">
          <h4 className="font-medium text-sm">{metric.name} - Statistics</h4>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`avg-${metric.id}`} 
                checked={settings[metric.id]?.average || false} 
                onCheckedChange={(checked) => 
                  onSettingChange(metric.id, 'average', !!checked)
                }
              />
              <Label htmlFor={`avg-${metric.id}`} className="text-sm">Show Average</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`median-${metric.id}`} 
                checked={settings[metric.id]?.median || false} 
                onCheckedChange={(checked) => 
                  onSettingChange(metric.id, 'median', !!checked)
                }
              />
              <Label htmlFor={`median-${metric.id}`} className="text-sm">Show Median</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`min-${metric.id}`} 
                checked={settings[metric.id]?.min || false} 
                onCheckedChange={(checked) => 
                  onSettingChange(metric.id, 'min', !!checked)
                }
              />
              <Label htmlFor={`min-${metric.id}`} className="text-sm">Show Minimum</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox 
                id={`max-${metric.id}`} 
                checked={settings[metric.id]?.max || false} 
                onCheckedChange={(checked) => 
                  onSettingChange(metric.id, 'max', !!checked)
                }
              />
              <Label htmlFor={`max-${metric.id}`} className="text-sm">Show Maximum</Label>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// SelectedMetricsList Component
const SelectedMetricsList = ({ 
  metrics, 
  ticker, 
  metricTypes, 
  onMetricTypeChange, 
  onRemoveMetric,
  onToggleVisibility,
  onToggleLabels,
  metricVisibility = {},
  metricLabels = {},
  metricSettings = {},
  onMetricSettingChange
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
                variant={metricTypes[metric.id] === 'bar' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onMetricTypeChange(metric.id, 'bar')}
                className="h-8 w-8"
                title="Bar Chart"
              >
                <BarChart3 size={16} />
              </Button>
              
              <Button
                variant={metricTypes[metric.id] === 'line' ? 'default' : 'outline'}
                size="icon"
                onClick={() => onMetricTypeChange(metric.id, 'line')}
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
              
              {/* Data Label Toggle (NEW) */}
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

const Charting = () => {
  // State for selected metrics and company
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [sliderValue, setSliderValue] = useState([0, 14]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("popular");
  
  // State for metric visibility
  const [metricVisibility, setMetricVisibility] = useState<Record<string, boolean>>({});
  
  // NEW: State for metric data labels
  const [metricLabels, setMetricLabels] = useState<Record<string, boolean>>({});
  
  // State for metric statistics settings
  const [metricSettings, setMetricSettings] = useState<Record<string, {
    average?: boolean;
    median?: boolean;
    min?: boolean;
    max?: boolean;
  }>>({});
  
  // State for API data
  const [metricData, setMetricData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [period, setPeriod] = useState<'annual' | 'quarter'>('annual');
  
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartTitle, setChartTitle] = useState<string>("");
  const timePeriods = [
    "2011", "2012", "2013", "2014", "2015", "2016", 
    "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"
  ];
  
  const handleMetricSelect = (metric: Metric) => {
    if (!selectedMetrics.some(m => m.id === metric.id)) {
      setSelectedMetrics(prev => [...prev, metric]);
      // Set default visibility to true for new metrics
      setMetricVisibility(prev => ({
        ...prev,
        [metric.id]: true
      }));
      // NEW: Set default label visibility to true for new metrics
      setMetricLabels(prev => ({
        ...prev,
        [metric.id]: true
      }));
      // Initialize settings for new metric
      setMetricSettings(prev => ({
        ...prev,
        [metric.id]: {
          average: false,
          median: false,
          min: false,
          max: false
        }
      }));
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    setSelectedMetrics(prev => prev.filter(m => m.id !== metricId));
    // Clean up all related state when removing a metric
    setMetricTypes(prev => {
      const newTypes = { ...prev };
      delete newTypes[metricId];
      return newTypes;
    });
    setMetricVisibility(prev => {
      const newVisibility = { ...prev };
      delete newVisibility[metricId];
      return newVisibility;
    });
    // NEW: Clean up label visibility
    setMetricLabels(prev => {
      const newLabels = { ...prev };
      delete newLabels[metricId];
      return newLabels;
    });
    setMetricSettings(prev => {
      const newSettings = { ...prev };
      delete newSettings[metricId];
      return newSettings;
    });
  };

  const handleCompanySelect = (company: any) => {
    setSelectedCompany(company);
  };

  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
  };

  const handleMetricTypeChange = (metric: string, type: 'bar' | 'line') => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  const handleToggleVisibility = (metricId: string) => {
    setMetricVisibility(prev => ({ 
      ...prev, 
      [metricId]: !prev[metricId] 
    }));
  };

  // NEW: Handler for toggling data labels
  const handleToggleLabels = (metricId: string) => {
    setMetricLabels(prev => ({
      ...prev,
      [metricId]: prev[metricId] === false // If false, make true, otherwise make false
    }));
  };

  const handleMetricSettingChange = (metricId: string, setting: string, value: boolean) => {
    setMetricSettings(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [setting]: value
      }
    }));
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handlePeriodChange = (newPeriod: 'annual' | 'quarter') => {
    setPeriod(newPeriod);
  };

  // Initialize chart type for new metrics
  React.useEffect(() => {
    const newMetricTypes = { ...metricTypes };
    selectedMetrics.forEach(metric => {
      if (!newMetricTypes[metric.id]) {
        newMetricTypes[metric.id] = metric.name.toLowerCase().includes('margin') ? 'line' : 'bar';
      }
    });
    setMetricTypes(newMetricTypes);
  }, [selectedMetrics]);

  const fetchMetricData = async () => {
    if (!selectedCompany?.ticker || selectedMetrics.length === 0) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch data for each selected metric
      const promises = selectedMetrics.map(async (metric) => {
        const mappedPeriod = period === 'quarter' ? 'quarter' : 'annual';
        // Add a limit parameter to ensure we get enough years of data
        const url = `${API_BASE_URL}/metric-data/${selectedCompany.ticker}?metric=${metric.id}&period=${mappedPeriod}&limit=15`;        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${metric.name}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
          metricId: metric.id,
          data
        };
      });
      
      const results = await Promise.all(promises);
      
      // Process and combine the data
      const processedData = [];
      
      // Get all unique periods across all metrics
      const allPeriods = new Set();
      results.forEach(result => {
        result.data.forEach(item => {
          // Extract the year from the date for consistent period format
          const year = new Date(item.date).getFullYear().toString();
          allPeriods.add(year);
        });
      });
      
      // Convert to array and sort chronologically
      const sortedPeriods = Array.from(allPeriods).sort();
      console.log('Sorted periods:', sortedPeriods);
      
      // Create data points for each period
      sortedPeriods.forEach(period => {
        const dataPoint = { period };
        const metrics = [];
        
        // Add metrics data for this period
        results.forEach(result => {
          const metricData = result.data.find(item => {
            const year = new Date(item.date).getFullYear().toString();
            return year === period;
          });
          
          if (metricData) {
            metrics.push({
              name: result.metricId,
              value: parseFloat(metricData.value) || 0
            });
          }
        });
        
        dataPoint.metrics = metrics;
        processedData.push(dataPoint);
      });
      
      console.log('Processed data:', processedData);
      setMetricData(processedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching metric data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchMetricData when company, metrics, or period changes
  React.useEffect(() => {
    if (selectedCompany?.ticker && selectedMetrics.length > 0) {
      fetchMetricData();
    }
  }, [selectedCompany, selectedMetrics, period]);

  // Transform financial data for the chart
  const getChartData = () => {
    if (!selectedCompany?.ticker || selectedMetrics.length === 0 || !metricData.length) {
      return null;
    }
    
    // Get the years we want to display
    const years = timePeriods.slice(sliderValue[0], sliderValue[1] + 1);
    console.log('Selected years:', years);
    
    // Filter data based on the selected time range
    console.log('Periods in data:', metricData.map(item => item.period));
    
    const filteredData = metricData.filter(item => {
      // This should match the period format in your data
      return years.includes(item.period);
    });
    
    console.log('Filtered data length:', filteredData.length);
    
    return filteredData;
  };

  // Get only visible metrics for chart
  const getVisibleMetrics = () => {
    return selectedMetrics
      .filter(metric => metricVisibility[metric.id] !== false)
      .map(metric => metric.id);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-medium mb-2 text-gray-600">Metrics</h2>
          <div className="bg-white p-4 rounded-lg shadow-sm h-[400px]">
            <CategoryMetricsPanel 
              categories={metricCategories}
              onMetricSelect={handleMetricSelect}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium mb-2 text-gray-600">Search Companies</h2>
          <CompanySearch onCompanySelect={handleCompanySelect} />
          
          {/* Period Selection */}
          <div className="mt-4">
            <h2 className="text-sm font-medium mb-2 text-gray-600">Period</h2>
            <div className="flex space-x-2">
              <Button 
                variant={period === 'annual' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('annual')}
                className="flex-1"
              >
                Annual
              </Button>
              <Button 
                variant={period === 'quarter' ? 'default' : 'outline'}
                onClick={() => handlePeriodChange('quarter')}
                className="flex-1"
              >
                Quarterly
              </Button>
            </div>
          </div>
          
          {/* Selected Metrics - Updated with label toggles */}
          {selectedMetrics.length > 0 && (
            <div className="mt-4">
              <h2 className="text-sm font-medium mb-2 text-gray-600">Selected Metrics</h2>
              <div className="bg-gray-50 rounded-lg p-3">
                <SelectedMetricsList
                  metrics={selectedMetrics}
                  ticker={selectedCompany?.ticker || ''}
                  metricTypes={metricTypes}
                  onMetricTypeChange={handleMetricTypeChange}
                  onRemoveMetric={handleRemoveMetric}
                  onToggleVisibility={handleToggleVisibility}
                  onToggleLabels={handleToggleLabels}
                  metricVisibility={metricVisibility}
                  metricLabels={metricLabels}
                  metricSettings={metricSettings}
                  onMetricSettingChange={handleMetricSettingChange}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm">
        {!selectedCompany && !selectedMetrics.length ? (
          <div className="text-center text-gray-500">
            <p>Select a company and metrics to start charting</p>
          </div>
        ) : (
          <div className="space-y-4">
            {selectedCompany && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-lg">{selectedCompany.logo}</span>
                <div>
                  <p className="font-medium">{selectedCompany.name}</p>
                  <p className="text-sm text-gray-500">{selectedCompany.ticker}</p>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="text-center py-4">
                <p className="text-gray-500">Loading data...</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-md">
                <p>{error}</p>
              </div>
            )}

            {selectedCompany && selectedMetrics.length > 0 && getChartData() && (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {getVisibleMetrics().length} of {selectedMetrics.length} metrics visible
                    </span>
                  </div>
                  <ChartExport 
                    chartRef={chartContainerRef}
                    fileName="financial-metrics"
                    companyName={selectedCompany.name}
                    metrics={selectedMetrics.map(m => m.name)}
                  />
                </div>
                
                <TimeRangePanel
                  startDate={`December 31, 20${19 + sliderValue[0]}`}
                  endDate={`December 31, 20${19 + sliderValue[1]}`}
                  sliderValue={sliderValue}
                  onSliderChange={handleSliderChange}
                  timePeriods={timePeriods}
                  timeFrame={period === 'quarter' ? 'quarterly' : 'annual'}
                />
                
                <div className="h-[800px]" ref={chartContainerRef}>
                  <MetricChart 
                    data={getChartData() || []}
                    metrics={getVisibleMetrics()}
                    ticker={selectedCompany.ticker}
                    metricTypes={metricTypes}
                    onMetricTypeChange={handleMetricTypeChange}
                    companyName={selectedCompany.name}
                    title={chartTitle || `${selectedCompany.name} (${selectedCompany.ticker})`}
                    metricSettings={metricSettings}
                    metricLabels={metricLabels} // NEW: Pass label visibility to chart
                  />
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Charting;