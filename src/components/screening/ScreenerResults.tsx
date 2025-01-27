import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScreeningTable } from "./ScreeningTable";
import { ScreeningMetric } from "@/types/screening";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { buildScreeningQuery, transformGraphQLResponse } from "@/utils/graphqlUtils";

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
        description: "Please select at least one filtering criteria",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { query } = buildScreeningQuery(metrics);

      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const { data, errors } = await response.json();

      if (errors) {
        throw new Error(errors[0].message);
      }

      const transformedResults = transformGraphQLResponse(data);
      setResults(transformedResults);
      
      toast({
        title: "Screener Results",
        description: `Found ${transformedResults.length} matching stocks`,
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