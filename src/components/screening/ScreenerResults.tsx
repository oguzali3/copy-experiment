import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreeningTable } from "./ScreeningTable";
import { ScreeningMetric } from "@/types/screening";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { categorizeFilters } from "@/utils/screening/filterUtils";

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
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleScreenerRun = async () => {
    // Check if at least one filter criteria is selected
    const hasMetrics = metrics.length > 0;
    const hasCountries = selectedCountries.length > 0;
    const hasIndustries = selectedIndustries.length > 0;
    const hasExchanges = selectedExchanges.length > 0;

    if (!hasMetrics && !hasCountries && !hasIndustries && !hasExchanges) {
      toast({
        title: "No criteria selected",
        description: "Please select at least one filtering criteria (countries, industries, exchanges, or metrics)",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Categorize filters into basic and advanced
      const { basicFilters, advancedFilters } = categorizeFilters(metrics);
      console.log('Categorized filters:', { basicFilters, advancedFilters });

      const { data, error } = await supabase.functions.invoke('fetch-advanced-screener', {
        body: {
          filters: {
            basicFilters,
            advancedFilters
          },
          countries: excludeCountries ? [] : selectedCountries,
          industries: excludeIndustries ? [] : selectedIndustries,
          exchanges: excludeExchanges ? [] : selectedExchanges,
        }
      });

      if (error) throw error;
      
      if (!data || !Array.isArray(data)) {
        throw new Error('Invalid response from screener');
      }

      setResults(data);
      
      toast({
        title: "Screener Results",
        description: `Found ${data.length} matching stocks`,
      });
    } catch (error) {
      console.error('Error running screener:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to run screener. Please try again.",
        variant: "destructive",
      });
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          className="bg-[#077dfa] hover:bg-[#077dfa]/90"
          onClick={handleScreenerRun}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            "Run Screener"
          )}
        </Button>
        <div className="text-sm text-gray-500">
          Screener Results: {results.length}
        </div>
      </div>
      <ScreeningTable metrics={metrics} results={results} />
    </div>
  );
};