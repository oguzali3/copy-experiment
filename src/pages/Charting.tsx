import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";
import { MetricsSearch } from "@/components/MetricsSearch";
import { CompanySearch } from "@/components/CompanySearch";
import { useState } from "react";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { StockChart } from "@/components/StockChart";
import { financialData } from "@/data/financialData";

const Charting = () => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [sliderValue, setSliderValue] = useState([0, 4]);

  const timePeriods = ["1D", "5D", "1M", "6M", "1Y"];

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

  // Transform financial data for the chart if both company and metrics are selected
  const getChartData = () => {
    if (!selectedCompany?.ticker || selectedMetrics.length === 0) return null;
    
    const companyData = financialData[selectedCompany.ticker]?.annual || [];
    return companyData.map(period => ({
      period: period.period,
      value: parseFloat(period[selectedMetrics[0] as keyof typeof period] || '0')
    }));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4 flex-shrink-0">
          <SearchBar onStockSelect={handleCompanySelect} />
          <div className="flex items-center gap-2 ml-auto">
            <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
              Upgrade
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-white hover:bg-[#077dfa] w-12 h-16 flex flex-col items-center justify-center gap-1 [&_svg]:!text-white hover:[&_svg]:!text-white"
            >
              <UserCircle className="h-9 w-9" />
              <span className="text-xs text-white/80">Profile</span>
            </Button>
          </div>
        </div>

        <main className="flex-1 p-6 space-y-6 overflow-y-auto bg-gray-50">
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
                    <TimeRangePanel
                      startDate="Jan 2024"
                      endDate="Mar 2024"
                      sliderValue={sliderValue}
                      onSliderChange={handleSliderChange}
                      timePeriods={timePeriods}
                    />
                    <div className="h-[500px]">
                      <StockChart ticker={selectedCompany?.ticker} />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Charting;