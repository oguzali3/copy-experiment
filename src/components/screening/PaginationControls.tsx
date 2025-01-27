import React, { RefObject } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  hasNextPage: boolean;
  isLoading: boolean;
  totalResults: number;
  resultsPerPage: number;
  onNextPage: () => void;
  onPreviousPage: () => void;
  resultsRef: RefObject<HTMLDivElement>;
}

const PaginationControls = ({
  currentPage,
  hasNextPage,
  isLoading,
  totalResults,
  resultsPerPage,
  onNextPage,
  onPreviousPage,
  resultsRef
}: PaginationControlsProps) => {
  // Calculate range for current page
  const startRange = ((currentPage - 1) * resultsPerPage) + 1;
  const endRange = Math.min(currentPage * resultsPerPage, totalResults);

  // Scroll handler
  const scrollToResults = () => {
    if (resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  };

  // Pagination handlers with scroll
  const handleNextPage = () => {
    if (!isLoading && hasNextPage) {
      scrollToResults();
      onNextPage();
    }
  };

  const handlePreviousPage = () => {
    if (!isLoading && currentPage > 1) {
      scrollToResults();
      onPreviousPage();
    }
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      {/* Mobile pagination controls */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          onClick={handlePreviousPage}
          disabled={currentPage === 1 || isLoading}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          onClick={handleNextPage}
          disabled={!hasNextPage || isLoading}
        >
          Next
        </Button>
      </div>

      {/* Desktop pagination controls */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        {/* Results range display */}
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startRange}</span> to{' '}
            <span className="font-medium">{endRange}</span> of{' '}
            <span className="font-medium">{totalResults}</span> results
          </p>
        </div>

        {/* Navigation controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handlePreviousPage}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="text-sm text-gray-700">
            Page {currentPage}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
            onClick={handleNextPage}
            disabled={!hasNextPage || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaginationControls;