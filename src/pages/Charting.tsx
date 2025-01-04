import React, { useState } from "react";
import { MetricsSearch } from "@/components/MetricsSearch";
import { CompanySearch } from "@/components/CompanySearch";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { MetricChart } from "@/components/financials/MetricChart";
import { financialData } from "@/data/financialData";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Charting = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [sliderValue, setSliderValue] = useState([0, 4]);
  const [metricTypes, setMetricTypes] = useState<Record<string, 'bar' | 'line'>>({});

  const timePeriods = ["2019", "2020", "2021", "2022", "2023"];

  const handleMetricSelect = (metricId: string) => {
    if (!selectedMetrics.includes(metricId)) {
      setSelectedMetrics(prev => [...prev, metricId]);
    }
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

  // Initialize chart type for new metrics
  React.useEffect(() => {
    const newMetricTypes = { ...metricTypes };
    selectedMetrics.forEach(metric => {
      if (!newMetricTypes[metric]) {
        newMetricTypes[metric] = metric.toLowerCase().includes('margin') ? 'line' : 'bar';
      }
    });
    setMetricTypes(newMetricTypes);
  }, [selectedMetrics]);

  // Transform financial data for the chart if both company and metrics are selected
  const getChartData = () => {
    if (!selectedCompany?.ticker || selectedMetrics.length === 0) return null;
    
    const companyData = financialData[selectedCompany.ticker]?.annual || [];
    
    // Filter data based on the selected time range
    const filteredData = companyData
      .filter(item => {
        const year = parseInt(item.period);
        return year >= 2019 + sliderValue[0] && year <= 2019 + sliderValue[1];
      })
      .map(period => ({
        period: period.period,
        metrics: selectedMetrics.map(metricId => ({
          name: metricId,
          value: parseFloat(period[metricId as keyof typeof period]?.replace(/,/g, '') || '0')
        }))
      }));

    return filteredData;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-sm font-medium mb-2 text-gray-600">Search Metrics</h2>
          <MetricsSearch onMetricSelect={handleMetricSelect} />
        </div>
        <div>
          <h2 className="text-sm font-medium mb-2 text-gray-600">Search Companies</h2>
          <CompanySearch onCompanySelect={handleCompanySelect} />
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
            
            {selectedMetrics.length > 0 && (
              <div className="flex gap-2">
                {selectedMetrics.map((metric, index) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {metric}
                  </div>
                ))}
              </div>
            )}

            {selectedCompany && selectedMetrics.length > 0 && getChartData() && (
              <>
                <div className="flex justify-between items-center">
                  <Select value={metricTypes[selectedMetrics[0]]} onValueChange={(value: "bar" | "line") => handleMetricTypeChange(selectedMetrics[0], value)}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Chart Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="line">Line Chart</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <TimeRangePanel
                  startDate={`December 31, 20${19 + sliderValue[0]}`}
                  endDate={`December 31, 20${19 + sliderValue[1]}`}
                  sliderValue={sliderValue}
                  onSliderChange={handleSliderChange}
                  timePeriods={timePeriods}
                />
                <div className="h-[500px]">
                  <MetricChart 
                    data={getChartData() || []}
                    metrics={selectedMetrics}
                    ticker={selectedCompany.ticker}
                    metricTypes={metricTypes}
                    onMetricTypeChange={handleMetricTypeChange}
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