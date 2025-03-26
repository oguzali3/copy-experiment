import React, { useState } from "react";
import { CompanySearch } from "@/components/CompanySearch";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { MetricChart } from "@/components/financials/MetricChartforCharting";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CategoryMetricsPanel, Metric } from"@/components/CategoryMetricsPanel";
import { metricCategories } from '@/data/metricCategories';
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useRef } from "react";
import { ChartExport } from "@/components/financials/ChartExport";

import { 
  transformSingleMetricData, 
  mergeMetricsData, 
  transformToChartFormat,
  debugTransformation 
} from '@/utils/dataTransformer';

// API base URL
const API_BASE_URL = "http://localhost:4000/api/analysis";

const Charting = () => {
  // State for selected metrics and company
  const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [sliderValue, setSliderValue] = useState([0, 14]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});
  const [selectedCategory, setSelectedCategory] = useState<string>("popular");
  
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
    }
  };

  const handleRemoveMetric = (metricId: string) => {
    setSelectedMetrics(prev => prev.filter(m => m.id !== metricId));
    setMetricTypes(prev => {
      const newTypes = { ...prev };
      delete newTypes[metricId];
      return newTypes;
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
    // NOTE: Log the periods to see what format they're in
    console.log('Periods in data:', metricData.map(item => item.period));
    
    const filteredData = metricData.filter(item => {
      // This should match the period format in your data
      return years.includes(item.period);
    });
    
    console.log('Filtered data length:', filteredData.length);
    console.log('First filtered data item:', filteredData[0]);
    
    return filteredData;
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
              <div className="flex flex-wrap gap-2">
                {selectedMetrics.map((metric) => (
                  <div key={metric.id} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                    {metric.name}
                    <button 
                      className="ml-1 text-blue-600 hover:text-blue-800"
                      onClick={() => handleRemoveMetric(metric.id)}
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
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
                  {selectedMetrics.length === 1 && (
                    <Select 
                      value={metricTypes[selectedMetrics[0].id]} 
                      onValueChange={(value: "bar" | "line") => handleMetricTypeChange(selectedMetrics[0].id, value)}
                    >
                      <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Chart Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bar">Bar Chart</SelectItem>
                        <SelectItem value="line">Line Chart</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
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
                />
                
                {/* Add the ref to this div */}
                <div className="h-[500px]" ref={chartContainerRef}>
                  <MetricChart 
                    data={getChartData() || []}
                    metrics={selectedMetrics.map(m => m.id)}
                    ticker={selectedCompany.ticker}
                    metricTypes={metricTypes}
                    onMetricTypeChange={handleMetricTypeChange}
                    companyName={selectedCompany.name}
                    title={chartTitle || `${selectedCompany.name} (${selectedCompany.ticker})`}

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