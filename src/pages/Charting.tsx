import React, { useState, useEffect, useRef } from "react";
import { CompanySearch } from "@/components/CompanySearch";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { MetricChart } from "@/components/financials/MetricChartforCharting";
import { CategoryMetricsPanel, Metric } from"@/components/CategoryMetricsPanel";
import { metricCategories } from '@/data/metricCategories';
import { Button } from "@/components/ui/button";
import { ChartExport } from "@/components/financials/ChartExport";
import { getMetricDisplayName } from "@/utils/metricDefinitions";
import { X, BarChart3, LineChart, Cog, Eye, EyeOff, Move, Pencil, PencilOff } from "lucide-react";
import SelectedMetricsList from "@/components/SelectedMetricList";

// API base URL
const API_BASE_URL = "http://localhost:4000/api/analysis";

/**
 * Extract time periods from API response data
 */
const extractTimePeriods = (data, periodType) => {
  if (!data || data.length === 0) {
    return [];
  }

  // Extract all unique dates from the data
  const dates = data.map(item => new Date(item.date));
  
  // Sort dates chronologically (oldest to newest)
  dates.sort((a, b) => a.getTime() - b.getTime());
  
  // Create a set to store unique formatted periods (in case there are duplicates)
  const uniquePeriods = new Set();
  
  // Format the dates based on period type and add to set
  dates.forEach(date => {
    if (periodType === 'annual') {
      // For annual data, just return the year
      uniquePeriods.add(date.getFullYear().toString());
    } else {
      // Get the correct month (not adding 1 to getMonth() since we use toLocaleString)
      const month = date.toLocaleString('default', { month: 'short' });
      const year = date.getFullYear().toString().slice(-2); // Last two digits of year
      uniquePeriods.add(`${month} ${year}`);
    }
  });
  
  // Convert the set to an array and sort
  let periodArray = Array.from(uniquePeriods);
  
  if (periodType === 'annual') {
    // For annual periods, sort numerically
    periodArray.sort((a, b) => parseInt(a) - parseInt(b));
  } else {
    // For quarterly periods, sort by year and month
    periodArray.sort((a, b) => {
      const [monthA, yearA] = a.split(' ');
      const [monthB, yearB] = b.split(' ');
      
      // Compare years first
      const yearDiff = parseInt(yearA) - parseInt(yearB);
      if (yearDiff !== 0) return yearDiff;
      
      // If years are the same, compare months
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months.indexOf(monthA) - months.indexOf(monthB);
    });
  }
  
  return periodArray;
};

/**
 * Format a date string to a period identifier
 */
const getPeriodIdentifier = (dateString, periodType) => {
  const date = new Date(dateString);
  if (periodType === 'annual') {
    return date.getFullYear().toString();
  } else {
    const month = date.toLocaleString('default', { month: 'short' });
    const year = date.getFullYear().toString().slice(-2);
    return `${month} ${year}`;
  }
};

/**
 * Get default time periods when no data is available
 */
const getDefaultTimePeriods = (periodType) => {
  const currentYear = new Date().getFullYear();
  
  if (periodType === 'annual') {
    // Generate last 14 years by default for annual
    return Array.from({ length: 14 }, (_, i) => (currentYear - 13 + i).toString());
  } else {
    // Generate last 16 quarters (4 years) for quarterly
    const quarters = [];
    const months = ['Mar', 'Jun', 'Sep', 'Dec'];
    
    for (let i = 0; i < 16; i++) {
      const yearOffset = Math.floor(i / 4);
      const quarterIndex = i % 4;
      const year = (currentYear - 3 + yearOffset).toString().slice(-2);
      quarters.push(`${months[quarterIndex]} ${year}`);
    }
    
    return quarters;
  }
};

const Charting = () => {
  // State for selected metrics and company
  const [selectedMetrics, setSelectedMetrics] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [metricTypes, setMetricTypes] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("popular");
  
  // State for metric visibility and labels
  const [metricVisibility, setMetricVisibility] = useState({});
  const [metricLabels, setMetricLabels] = useState({});
  
  // State for metric statistics settings
  const [metricSettings, setMetricSettings] = useState({});
  
  // State for API data
  const [metricData, setMetricData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('annual');
  
  // Dynamic time periods
  const [timePeriods, setTimePeriods] = useState(getDefaultTimePeriods('annual'));
  // Use computed default for slider value
  const [sliderValue, setSliderValue] = useState([0, getDefaultTimePeriods('annual').length - 1]);
  
  const chartContainerRef = useRef(null);
  const [chartTitle, setChartTitle] = useState("");
  
  // Debug flag to help troubleshooting
  const [debug, setDebug] = useState(false);
  
  const handleMetricSelect = (metric) => {
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

  const handleRemoveMetric = (metricId) => {
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

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
  };

  const handleSliderChange = (value) => {
    setSliderValue(value);
  };

  const handleMetricTypeChange = (metric, type) => {
    setMetricTypes(prev => ({
      ...prev,
      [metric]: type
    }));
  };

  const handleToggleVisibility = (metricId) => {
    setMetricVisibility(prev => ({ 
      ...prev, 
      [metricId]: !prev[metricId] 
    }));
  };

  const handleToggleLabels = (metricId) => {
    setMetricLabels(prev => ({
      ...prev,
      [metricId]: !prev[metricId]
    }));
  };

  const handleMetricSettingChange = (metricId, setting, value) => {
    setMetricSettings(prev => ({
      ...prev,
      [metricId]: {
        ...prev[metricId],
        [setting]: value
      }
    }));
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
  };

  const handlePeriodChange = (newPeriod) => {
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
      let extractedPeriods = [];
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
      const processedData = [];
      
      // Create data points for each period
      extractedPeriods.forEach(periodId => {
        const dataPoint = { period: periodId };
        const metrics = [];
        
        // Add metrics data for this period
        results.forEach(result => {
          const metricData = result.data.find(item => {
            // Get period identifier from date
            const itemPeriodId = getPeriodIdentifier(item.date, period);
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
    } catch (err) {
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

            {selectedCompany && selectedMetrics.length > 0 && (
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
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Charting;