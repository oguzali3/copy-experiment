import React, { useState } from "react";
import { FilterSection } from "@/components/screening/FilterSection";
import { ScreenerCriteria } from "@/components/screening/ScreenerCriteria";
import { ScreenerResults } from "@/components/screening/ScreenerResults";
import { ScreeningMetric } from "@/types/screening";
import { Button } from "@/components/ui/button";

const Screening = () => {
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<ScreeningMetric[]>([]);
  const [excludeCountries, setExcludeCountries] = useState(false);
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
    setSelectedExchanges([]);
    setSelectedMetrics([]);
    setExcludeCountries(false);
    setExcludeExchanges(false);
  };

  return (
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

        <ScreenerResults 
          metrics={selectedMetrics}
          selectedCountries={selectedCountries}
          selectedExchanges={selectedExchanges}
          excludeCountries={excludeCountries}
          excludeExchanges={excludeExchanges}
        />
      </div>
    </div>
  );
};

export default Screening;