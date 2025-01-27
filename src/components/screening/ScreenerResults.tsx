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
  selectedIndustries: string[];
  selectedExchanges: string[];
  excludeCountries: boolean;
  excludeIndustries: boolean;
  excludeExchanges: boolean;
}

const RESULTS_PER_PAGE = 25;

export const ScreenerResults = ({ 
  metrics,
  selectedCountries,
  selectedIndustries,
  selectedExchanges,
  excludeCountries,
  excludeIndustries,
  excludeExchanges
}: ScreenerResultsProps) => {
  // Ref for scrolling to top of results
  const resultsRef = useRef<HTMLDivElement>(null);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [pageInfo, setPageInfo] = useState<{
    cursors: { [key: number]: string };
    currentCursor: string | null;
  }>({
    cursors: {},
    currentCursor: null
  });
  const { toast } = useToast();

  const handleScreenerRun = async (resetPagination = true, cursor: string | null = null) => {
    // Validate if any criteria is selected
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
      // Build and execute GraphQL query
      const { query } = buildScreeningQuery(metrics, {
        cursor: cursor || '',
        limit: RESULTS_PER_PAGE
      });

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

      // Process response data
      const { nodes, pageInfo: responsePageInfo } = data.screenCompanies;
      const transformedResults = transformGraphQLResponse(nodes);
      
      // Handle pagination state
      if (resetPagination) {
        setCurrentPage(1);
        setPageInfo({
          cursors: {
            1: '',
            2: responsePageInfo.endCursor
          },
          currentCursor: ''
        });
        setTotalResults(responsePageInfo.total);
      } else {
        setPageInfo(prev => ({
          cursors: {
            ...prev.cursors,
            [currentPage + 1]: responsePageInfo.endCursor
          },
          currentCursor: cursor || ''
        }));
      }
      
      // Update results and pagination state
      setResults(transformedResults);
      setHasNextPage(responsePageInfo.hasNextPage);

      // Show success toast
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
      // Reset states on error
      setResults([]);
      setTotalResults(0);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination handlers
  const handleNextPage = () => {
    if (hasNextPage && !isLoading) {
      const nextPage = currentPage + 1;
      const nextCursor = pageInfo.cursors[nextPage];
      
      setCurrentPage(nextPage);
      handleScreenerRun(false, nextCursor);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1 && !isLoading) {
      const prevPage = currentPage - 1;
      const prevCursor = pageInfo.cursors[prevPage];
      
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