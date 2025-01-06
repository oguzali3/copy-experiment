import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreeningTable } from "./ScreeningTable";
import { ScreeningMetric } from "@/types/screening";
import { supabase } from "@/integrations/supabase/client";
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
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const { toast } = useToast();

  const handleScreenerRun = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('fetch-screener-results', {
        body: {
          countries: excludeCountries ? [] : selectedCountries,
          industries: excludeIndustries ? [] : selectedIndustries,
          exchanges: excludeExchanges ? [] : selectedExchanges,
          metrics: metrics.map(m => ({
            id: m.id,
            min: m.min || undefined,
            max: m.max || undefined
          }))
        }
      });

      if (error) throw error;
      setResults(data || []);
      
      toast({
        title: "Screener Results",
        description: `Found ${data?.length || 0} matching stocks`,
      });
    } catch (error) {
      console.error('Error running screener:', error);
      toast({
        title: "Error",
        description: "Failed to run screener. Please try again.",
        variant: "destructive",
      });
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
          {isLoading ? "Running..." : "Run Screener"}
        </Button>
        <div className="text-sm text-gray-500">
          Screener Results: {results.length}
        </div>
      </div>
      <ScreeningTable metrics={metrics} results={results} />
    </div>
  );
};