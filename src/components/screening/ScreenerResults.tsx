import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScreeningTable } from "./ScreeningTable";
import { ScreeningMetric } from "@/types/screening";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";
import { buildScreeningQuery, transformGraphQLResponse } from "@/utils/graphqlUtils";
import PaginationControls from "./PaginationControls";

interface ScreenerResultsProps {
  metrics: ScreeningMetric[];
  selectedCountries: string[];
  selectedExchanges: string[];
  excludeCountries: boolean;
  excludeExchanges: boolean;
}

const RESULTS_PER_PAGE = 25;

export const ScreenerResults = ({ 
  metrics,
  selectedCountries,
  selectedExchanges,
  excludeCountries,
  excludeExchanges
}: ScreenerResultsProps) => {
  const resultsRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [cursorHistory, setCursorHistory] = useState<string[]>(['']);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const { toast } = useToast();

  const handleScreenerRun = async (resetPagination = true, cursor: string | null = null) => {
    const hasMetrics = metrics.length > 0;
    const hasCountries = selectedCountries.length > 0;
    const hasExchanges = selectedExchanges.length > 0;

    if (!hasMetrics && !hasCountries && !hasExchanges) {
      toast({
        title: "No criteria selected",
        description: "Please select at least one filtering criteria",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { query } = buildScreeningQuery(
        metrics, 
        {
          cursor: cursor || '',
          limit: RESULTS_PER_PAGE
        },
        selectedCountries,
        excludeCountries,
        selectedExchanges,
        excludeExchanges
      );

      const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;

      // Optional fallback for development
      if (!graphqlUrl) {
        console.warn("GraphQL URL not found in environment variables, using default");
      }

      const response = await fetch(graphqlUrl, {
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

      const { nodes, pageInfo: responsePageInfo } = data.screenCompanies;
      const transformedResults = transformGraphQLResponse(nodes);
      
      if (resetPagination) {
        setCurrentPage(1);
        setCursorHistory(['']);
      } else {
        if (cursor === cursorHistory[currentPage - 2]) {
          setCursorHistory(prev => prev.slice(0, currentPage - 1));
        } else {
          setCursorHistory(prev => [...prev, cursor || '']);
        }
      }

      setResults(transformedResults);
      setHasNextPage(responsePageInfo.hasNextPage);
      setNextCursor(responsePageInfo.endCursor);
      
      if (resetPagination) {
        setTotalResults(responsePageInfo.total);
      }

      toast({
        title: "Screener Results",
        description: `Found ${responsePageInfo.total} matching stocks`,
      });
    } catch (error) {
      console.error('Error running screener:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to run screener. Please try again.",
        variant: "destructive",
      });
      setResults([]);
      setTotalResults(0);
      setHasNextPage(false);
      setNextCursor(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextPage = () => {
    if (hasNextPage && !isLoading && nextCursor) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      handleScreenerRun(false, nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isLoading) {
      const prevPage = currentPage - 1;
      const prevCursor = cursorHistory[prevPage - 1];
      setCurrentPage(prevPage);
      handleScreenerRun(false, prevCursor);
    }
  };

  return (
    <div className="space-y-4">
      <div ref={resultsRef} className="flex items-center justify-between">
        <Button 
          className="bg-[#077dfa] hover:bg-[#077dfa]/90"
          onClick={() => handleScreenerRun(true)}
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
          Total Results: {totalResults}
        </div>
      </div>
      <ScreeningTable metrics={metrics} results={results} />
      {results.length > 0 && (
        <PaginationControls
          currentPage={currentPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          totalResults={totalResults}
          resultsPerPage={RESULTS_PER_PAGE}
          onNextPage={handleNextPage}
          onPreviousPage={handlePreviousPage}
          resultsRef={resultsRef}
        />
      )}
    </div>
  );
};