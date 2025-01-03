import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreeningTable } from "./ScreeningTable";
import { ScreeningMetric } from "@/types/screening";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface ScreenerResultsProps {
  metrics: ScreeningMetric[];
  selectedCountries: string[];
  selectedIndustries: string[];
  selectedExchanges: string[];
  excludeCountries: boolean;
  excludeIndustries: boolean;
  excludeExchanges: boolean;
}

export const ScreenerResults = ({ 
  metrics,
  selectedCountries,
  selectedIndustries,
  selectedExchanges,
  excludeCountries,
  excludeIndustries,
  excludeExchanges
}: ScreenerResultsProps) => {
  const [isScreening, setIsScreening] = useState(false);

  const { data: screeningData, isLoading, refetch } = useQuery({
    queryKey: ['screening-results'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'screening' }
      });

      if (error) throw error;
      return data || []; // Ensure we always return an array
    },
    enabled: false
  });

  const handleRunScreener = async () => {
    setIsScreening(true);
    await refetch();
    setIsScreening(false);
  };

  const filterResults = (data: any[] = []) => {
    return data.filter(company => {
      if (!company) return false;

      // Filter by country
      const countryMatch = selectedCountries.length === 0 || 
        (excludeCountries 
          ? !selectedCountries.includes(company.country)
          : selectedCountries.includes(company.country));

      // Filter by industry
      const industryMatch = selectedIndustries.length === 0 ||
        (excludeIndustries
          ? !selectedIndustries.includes(company.sector)
          : selectedIndustries.includes(company.sector));

      // Filter by exchange
      const exchangeMatch = selectedExchanges.length === 0 ||
        (excludeExchanges
          ? !selectedExchanges.includes(company.exchange)
          : selectedExchanges.includes(company.exchange));

      // Filter by metrics
      const metricsMatch = metrics.every(metric => {
        const value = company[metric.id];
        if (value === undefined || value === null) return false;
        
        const min = metric.min ? parseFloat(metric.min) : -Infinity;
        const max = metric.max ? parseFloat(metric.max) : Infinity;
        
        const numericValue = typeof value === 'string' ? parseFloat(value) : value;
        return !isNaN(numericValue) && numericValue >= min && numericValue <= max;
      });

      return countryMatch && industryMatch && exchangeMatch && metricsMatch;
    });
  };

  const filteredResults = screeningData ? filterResults(screeningData) : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          onClick={handleRunScreener}
          disabled={isScreening || isLoading}
          className="bg-[#077dfa] hover:bg-[#077dfa]/90"
        >
          {isScreening || isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Screener...
            </>
          ) : (
            'Run Screener'
          )}
        </Button>
        <div className="text-sm text-gray-500">
          Screener Results: {filteredResults.length}
        </div>
      </div>
      <ScreeningTable metrics={metrics} data={filteredResults} />
    </div>
  );
};