import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreeningTable } from "./ScreeningTable";
import { ScreeningMetric } from "@/types/screening";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const [currentPage, setCurrentPage] = useState(0);
  const { toast } = useToast();

  const { data: screeningData, isLoading, refetch } = useQuery({
    queryKey: ['screening-results', currentPage, metrics, selectedCountries, selectedIndustries, selectedExchanges],
    queryFn: async () => {
      const screeningCriteria = {
        metrics: metrics.map(m => ({
          id: m.id,
          min: m.min,
          max: m.max
        })),
        countries: excludeCountries ? [] : selectedCountries,
        industries: excludeIndustries ? [] : selectedIndustries,
        exchanges: excludeExchanges ? [] : selectedExchanges,
        page: currentPage
      };

      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { 
          endpoint: 'screening',
          screeningCriteria
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch screening results. Please try again.",
          variant: "destructive"
        });
        throw error;
      }

      return data || { data: [], page: 0, hasMore: false };
    },
    enabled: false
  });

  const handleRunScreener = async () => {
    setCurrentPage(0);
    await refetch();
  };

  const handleLoadMore = async () => {
    setCurrentPage(prev => prev + 1);
    await refetch();
  };

  const results = screeningData?.data || [];
  const hasMore = screeningData?.hasMore || false;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          onClick={handleRunScreener}
          disabled={isLoading}
          className="bg-[#077dfa] hover:bg-[#077dfa]/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Screener...
            </>
          ) : (
            'Run Screener'
          )}
        </Button>
        <div className="text-sm text-gray-500">
          Results: {results.length}
        </div>
      </div>

      {results.length > 0 && (
        <ScreeningTable metrics={metrics} data={results} />
      )}

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
                Loading More...
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