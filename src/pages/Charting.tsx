import React, { useState, useEffect, useRef } from "react";
import { CompanySearch } from "@/components/CompanySearch";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { MetricChart } from "@/components/financials/MetricChartforCharting";
import { FinancialDataTable } from "@/components/FinancialDataTable";
import { CategoryMetricsPanel, Metric } from"@/components/CategoryMetricsPanel";
import { metricCategories } from '@/data/metricCategories';
import { Button } from "@/components/ui/button";
import { ChartExport } from "@/components/financials/ChartExport";
import { getMetricDisplayName } from "@/utils/metricDefinitions";
import { ChartType } from '@/types/chartTypes';
import { X, BarChart3, LineChart, Cog, Eye, EyeOff, Move, Pencil, PencilOff } from "lucide-react";
import SelectedMetricsList from "@/components/SelectedMetricList";

// Import updated time utilities
import { 
  extractTimePeriods, 
  getDefaultTimePeriods, 
  getPeriodIdentifier 
} from '@/utils/timeUtils';

// API base URL
const API_BASE_URL = "http://localhost:4000/api/analysis";

const Charting = () => {
  // State for selected metrics and company
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [metricTypes, setMetricTypes] = useState<Record<string, ChartType>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("popular");
  
  // State for metric visibility
  const [metricVisibility, setMetricVisibility] = useState<Record<string, boolean>>({});
  
  // State for metric data labels
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
  
  // Dynamic time periods
  const [timePeriods, setTimePeriods] = useState<string[]>(getDefaultTimePeriods('annual'));
  // Use computed default for slider value
  const [sliderValue, setSliderValue] = useState<[number, number]>([0, getDefaultTimePeriods('annual').length - 1]);
  
  // Refs for chart and table
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const fullExportRef = useRef<HTMLDivElement>(null);
  
  const [chartTitle, setChartTitle] = useState<string>("");
  
  // Debug flag to help troubleshooting
  const [debug, setDebug] = useState<boolean>(false);
  
  const handleMetricSelect = (metric: Metric) => {
    if (!selectedMetrics.some(m => m.id === metric.id)) {
      setSelectedMetrics(prev => [...prev, metric]);
      // Set default visibility to true for new metrics
      setMetricVisibility(prev => ({
        ...prev,
        [metric.id]: true
      }));
      // Set default label visibility to true for new metrics
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

  const handleSliderChange = (value: [number, number]) => {
    setSliderValue(value);
  };

  const handleMetricTypeChange = (metric: string, type: ChartType) => {
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

  const handleToggleLabels = (metricId: string) => {
    setMetricLabels(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
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
    // Clear existing data when switching period types
    setMetricData([]);
    setPeriod(newPeriod);
    
    // Reset time periods to defaults for the new period type
    const defaultPeriods = getDefaultTimePeriods(newPeriod);
    setTimePeriods(defaultPeriods);
    
    // Reset slider to show all periods
    setSliderValue([0, defaultPeriods.length - 1]);
  };

  // Initialize chart type for new metrics
  useEffect(() => {
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
        
        if (debug) {
          console.log(`Fetched data for ${metric.id}:`, data);
        }
        
        return {
          metricId: metric.id,
          data
        };
      });
      
      const results = await Promise.all(promises);
      
      // Debug log all results
      if (debug) {
        console.log('All fetched results:', results);
      }
      
      // Extract time periods from the first result that has data
      let extractedPeriods: string[] = [];
      for (const result of results) {
        if (result.data && result.data.length > 0) {
          // Extract and set the time periods dynamically
          extractedPeriods = extractTimePeriods(result.data, period);
          if (extractedPeriods.length > 0) {
            if (debug) {
              console.log(`Extracted ${extractedPeriods.length} ${period} periods:`, extractedPeriods);
            }
            setTimePeriods(extractedPeriods);
            // Reset slider to show all periods when data changes
            setSliderValue([0, Math.max(0, extractedPeriods.length - 1)]);
            break;
          }
        }
      }
      
      // If no time periods could be extracted, use default
      if (extractedPeriods.length === 0) {
        extractedPeriods = getDefaultTimePeriods(period);
        setTimePeriods(extractedPeriods);
        setSliderValue([0, extractedPeriods.length - 1]);
      }
      
      // Process and combine the data
      const processedData: any[] = [];
      
      // Create data points for each period
      extractedPeriods.forEach(periodId => {
        const dataPoint: any = { period: periodId };
        const metrics: any[] = [];
        
        // Add metrics data for this period
        results.forEach(result => {
          const metricData = result.data.find((item: any) => {
            // Special case for TTM
            if (item.period === 'TTM' && periodId === 'TTM') {
              return true;
            }
            
            // Get period identifier from date
            const itemPeriodId = getPeriodIdentifier(item.date, period, item.period);
            return itemPeriodId === periodId;
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
      
      if (debug) {
        console.log('Processed data:', processedData);
      }
      
      setMetricData(processedData);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      console.error('Error fetching metric data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Call fetchMetricData when company, metrics, or period changes
  useEffect(() => {
    if (selectedCompany?.ticker && selectedMetrics.length > 0) {
      fetchMetricData();
    }
  }, [selectedCompany, selectedMetrics, period]);

  // Transform financial data for the chart
  const getChartData = () => {
    if (!selectedCompany?.ticker || selectedMetrics.length === 0 || !metricData.length) {
      return null;
    }
    
    // Get the periods we want to display based on slider
    const selectedPeriods = timePeriods.slice(sliderValue[0], sliderValue[1] + 1);
    
    if (debug) {
      console.log('Selected periods:', selectedPeriods);
    }
    
    // Filter data based on the selected time range
    const filteredData = metricData.filter(item => {
      return selectedPeriods.includes(item.period);
    });
    
    if (debug) {
      console.log('Filtered data:', filteredData);
    }
    
    return filteredData;
  };

  // Get only visible metrics for chart
  const getVisibleMetrics = () => {
    return selectedMetrics
      .filter(metric => metricVisibility[metric.id] !== false)
      .map(metric => metric.id);
  };
  
  // Get metrics that should be stacked
  const getStackedMetrics = () => {
    return selectedMetrics
      .filter(metric => 
        metricVisibility[metric.id] !== false && 
        metricTypes[metric.id] === 'stacked'
      )
      .map(metric => metric.id);
  };
  
  // Check if we have metrics that should be stacked
  const hasStackedMetrics = () => {
    const stackedMetrics = getStackedMetrics();
    // Only consider stacking when there are multiple metrics set to "stacked"
    return stackedMetrics.length >= 2;
  };

  // Get all data for the table (we want to show more historical data in the table)
  const getTableData = () => {
    if (!metricData.length) return null;
    
    // For annual data: last 9 years + TTM (if available)
    // For quarterly data: last 10 quarters
    const maxPeriods = period === 'annual' ? 10 : 10; // Adjust count as needed

    // First sort data chronologically (oldest to newest)
    let allData = [...metricData];
    
    const hasTTM = allData.some(item => item.period === 'TTM');
    
    // Special handling for TTM - remove it temporarily for sorting
    let ttmData = null;
    if (hasTTM) {
      ttmData = allData.find(item => item.period === 'TTM');
      allData = allData.filter(item => item.period !== 'TTM');
    }
    
    // Sort the non-TTM data
    allData.sort((a, b) => {
      if (period === 'annual') {
        // For annual data, sort by year
        return parseInt(a.period) - parseInt(b.period);
      } else {
        // For quarterly data, try to split the period into month and year
        try {
          const [monthA, yearA] = a.period.split(' ');
          const [monthB, yearB] = b.period.split(' ');
          
          // Compare years first
          const yearDiff = parseInt(yearA) - parseInt(yearB);
          if (yearDiff !== 0) return yearDiff;
          
          // If years are the same, compare months
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(monthA) - months.indexOf(monthB);
        } catch (e) {
          // Fallback to string comparison
          return a.period.localeCompare(b.period);
        }
      }
    });
    
    // Take at most the last N periods (excluding TTM)
    const limitedData = allData.slice(-maxPeriods);
    
    // Add TTM back at the end if it exists
    if (ttmData) {
      limitedData.push(ttmData);
    }
    
    return limitedData;
  };

  // Toggle debug mode (for troubleshooting)
  const toggleDebug = () => {
    setDebug(!debug);
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
          
          {/* Selected Metrics */}
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
              
              {/* Stacked metrics info message */}
              {getStackedMetrics().length === 1 && (
                <div className="mt-2 text-xs text-amber-600 px-1">
                  Select at least one more metric as "stacked" to enable stacked bar chart
                </div>
              )}
            </div>
          )}
          
          {/* Debug toggle (hidden in UI) */}
          <div className="mt-4 text-right">
            <button 
              onClick={toggleDebug} 
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              {debug ? "Disable Debug" : "Enable Debug"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm" ref={fullExportRef}>
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

            {selectedCompany && selectedMetrics.length > 0 && (
              <>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">
                      {getVisibleMetrics().length} of {selectedMetrics.length} metrics visible
                    </span>
                    {hasStackedMetrics() && (
                      <span className="text-sm text-green-600">
                        {getStackedMetrics().length} metrics stacked
                      </span>
                    )}
                  </div>
                  <ChartExport 
                    chartRef={fullExportRef}
                    fileName="financial-metrics-with-table"
                    companyName={selectedCompany.name}
                    metrics={selectedMetrics.map(m => m.name)}
                  />
                </div>
                
                <TimeRangePanel
                  sliderValue={sliderValue}
                  onSliderChange={handleSliderChange}
                  timePeriods={timePeriods}
                  timeFrame={period === 'quarter' ? 'quarterly' : 'annual'}
                />
                
                {/* Debug info */}
                {debug && (
                  <div className="bg-gray-100 p-4 rounded-md mb-4 text-xs font-mono">
                    <h4 className="font-bold mb-2">Debug Info:</h4>
                    <p>Period type: {period}</p>
                    <p>Time periods: {timePeriods.join(', ')}</p>
                    <p>Slider value: [{sliderValue.join(', ')}]</p>
                    <p>Selected time range: {timePeriods.slice(sliderValue[0], sliderValue[1] + 1).join(', ')}</p>
                    <p>Data points: {metricData.length}</p>
                    <p>Visible metrics: {getVisibleMetrics().join(', ')}</p>
                    <p>Stacked metrics: {getStackedMetrics().join(', ')}</p>
                    <p>Has stackable metrics: {hasStackedMetrics() ? 'Yes' : 'No'}</p>
                    {getChartData() && <p>Chart data points: {getChartData().length}</p>}
                  </div>
                )}
                
                <div className="h-[800px]" ref={chartContainerRef}>
                  {getChartData() && getChartData().length > 0 ? (
                    <MetricChart 
                      data={getChartData()}
                      metrics={getVisibleMetrics()}
                      ticker={selectedCompany.ticker}
                      metricTypes={metricTypes}
                      stackedMetrics={hasStackedMetrics() ? getStackedMetrics() : []}
                      onMetricTypeChange={handleMetricTypeChange}
                      companyName={selectedCompany.name}
                      title={chartTitle || `${selectedCompany.name} (${selectedCompany.ticker})`}
                      metricSettings={metricSettings}
                      metricLabels={metricLabels}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No data available for the selected time period.</p>
                    </div>
                  )}
                </div>
                
                {/* Financial Data Table - Show last 9 years + TTM or last 10 quarters */}
                {getTableData() && getTableData().length > 0 && (
                  <FinancialDataTable
                    data={getTableData()}
                    metrics={getVisibleMetrics()}
                    metricVisibility={metricVisibility}
                    company={selectedCompany.name}
                  />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Charting;