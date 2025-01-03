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
  const [currentPage, setCurrentPage] = useState(0);

  const { data: screeningData, isLoading, refetch } = useQuery({
    queryKey: ['screening-results', currentPage],
    queryFn: async () => {
      const screeningCriteria = {
        metrics,
        countries: excludeCountries ? [] : selectedCountries,
        industries: excludeIndustries ? [] : selectedIndustries,
        exchanges: excludeExchanges ? [] : selectedExchanges,
      };

      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'screening',
          screeningCriteria,
          page: currentPage
        }
      });

      if (error) throw error;
      return data || { data: [], page: 0, hasMore: false };
    },
    enabled: false
  });

  const handleRunScreener = async () => {
    setIsScreening(true);
    setCurrentPage(0);
    await refetch();
    setIsScreening(false);
  };

  const handleLoadMore = async () => {
    setCurrentPage(prev => prev + 1);
    await refetch();
  };

  const filteredResults = screeningData?.data || [];
  const hasMore = screeningData?.hasMore || false;

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
          Results: {filteredResults.length}
        </div>
      </div>

      <ScreeningTable metrics={metrics} data={filteredResults} />

      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More Results'
            )}
          </Button>
        </div>
      )}
    </div>
  );
};