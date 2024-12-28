import React, { useState } from "react";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SearchBar } from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import { UserCircle, Settings, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FilterSection } from "@/components/screening/FilterSection";
import { ScreenerCriteria } from "@/components/screening/ScreenerCriteria";
import { ScreenerResults } from "@/components/screening/ScreenerResults";
import { ScreeningMetric } from "@/types/screening";

const Screening = () => {
  const navigate = useNavigate();
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<ScreeningMetric[]>([]);
  const [excludeCountries, setExcludeCountries] = useState(false);
  const [excludeIndustries, setExcludeIndustries] = useState(false);
  const [excludeExchanges, setExcludeExchanges] = useState(false);

  const handleMetricAdd = (metric: ScreeningMetric) => {
    setSelectedMetrics(prev => [...prev, metric]);
  };

  const handleMetricRemove = (metricId: string) => {
    setSelectedMetrics(prev => prev.filter(m => m.id !== metricId));
  };

  const handleMetricRangeChange = (metricId: string, min: string, max: string) => {
    setSelectedMetrics(prev => prev.map(m => 
      m.id === metricId ? { ...m, min, max } : m
    ));
  };

  const handleReset = () => {
    setSelectedCountries([]);
    setSelectedIndustries([]);
    setSelectedExchanges([]);
    setSelectedMetrics([]);
  };

  const handleLogout = () => {
    // Add any logout logic here (clearing tokens, etc)
    navigate('/');
  };

  return (
    <div className="flex w-full">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <div className="bg-[#191d25] h-16 flex items-center px-6 gap-4">
          <SearchBar onStockSelect={() => {}} />
          <div className="flex items-center gap-2 ml-auto">
            <Button className="bg-[#077dfa] hover:bg-[#077dfa]/90 text-white">
              Upgrade
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white hover:bg-[#077dfa] w-12 h-16 flex flex-col items-center justify-center gap-1 [&_svg]:!text-white hover:[&_svg]:!text-white"
                >
                  <UserCircle className="h-9 w-9" />
                  <span className="text-xs text-white/80">Profile</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => navigate('/settings')}
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="flex items-center gap-2 cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <main className="flex-1 p-6 space-y-6 overflow-auto">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Stock Screener</h1>
              <Button
                variant="outline"
                className="text-sm"
                onClick={handleReset}
              >
                Reset Metrics
              </Button>
            </div>

            <div className="grid gap-6">
              <FilterSection
                title="Countries"
                selected={selectedCountries}
                onSelect={setSelectedCountries}
                excludeEnabled={excludeCountries}
                onExcludeChange={setExcludeCountries}
                type="countries"
              />

              <FilterSection
                title="Industries"
                selected={selectedIndustries}
                onSelect={setSelectedIndustries}
                excludeEnabled={excludeIndustries}
                onExcludeChange={setExcludeIndustries}
                type="industries"
              />

              <FilterSection
                title="Exchanges"
                selected={selectedExchanges}
                onSelect={setSelectedExchanges}
                excludeEnabled={excludeExchanges}
                onExcludeChange={setExcludeExchanges}
                type="exchanges"
              />

              <ScreenerCriteria
                selectedMetrics={selectedMetrics}
                onMetricAdd={handleMetricAdd}
                onMetricRemove={handleMetricRemove}
                onMetricRangeChange={handleMetricRangeChange}
              />

              <ScreenerResults metrics={selectedMetrics} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Screening;