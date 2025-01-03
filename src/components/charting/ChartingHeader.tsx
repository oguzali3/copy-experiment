import React from 'react';
import { CompanySearch } from "@/components/CompanySearch";
import { MetricsSearch } from "@/components/MetricsSearch";

interface ChartingHeaderProps {
  onCompanySelect: (company: any) => void;
  onMetricSelect: (metricId: string) => void;
}

export const ChartingHeader = ({ onCompanySelect, onMetricSelect }: ChartingHeaderProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h2 className="text-sm font-medium mb-2 text-gray-600">Search Companies</h2>
        <CompanySearch onCompanySelect={onCompanySelect} />
      </div>
      <div>
        <h2 className="text-sm font-medium mb-2 text-gray-600">Search Metrics</h2>
        <MetricsSearch onMetricSelect={onMetricSelect} />
      </div>
    </div>
  );
};