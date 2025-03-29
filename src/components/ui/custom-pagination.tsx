// src/components/ui/custom-pagination.tsx
import React from 'react';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from '@/components/ui/pagination';

interface CustomPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

export const CustomPagination: React.FC<CustomPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1,
}) => {
  // Generate page numbers to display
  const generatePaginationItems = () => {
    // Always show first and last page
    const firstPage = 1;
    const lastPage = totalPages;
    
    // Calculate range of pages to show around current page
    const leftSiblingIndex = Math.max(currentPage - siblingCount, firstPage);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, lastPage);
    
    // Determine if we need to show ellipses
    const showLeftDots = leftSiblingIndex > firstPage + 1;
    const showRightDots = rightSiblingIndex < lastPage - 1;
    
    // Generate the array of page numbers to show
    const pageNumbers = [];
    
    // Add first page
    if (totalPages > 1) {
      pageNumbers.push(firstPage);
    }
    
    // Add left ellipsis if needed
    if (showLeftDots) {
      pageNumbers.push(-1); // -1 is a placeholder for ellipsis
    }
    
    // Add sibling pages
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== firstPage && i !== lastPage) {
        pageNumbers.push(i);
      }
    }
    
    // Add right ellipsis if needed
    if (showRightDots) {
      pageNumbers.push(-2); // -2 is a placeholder for ellipsis
    }
    
    // Add last page
    if (totalPages > 1) {
      pageNumbers.push(lastPage);
    }
    
    return pageNumbers;
  };
  
  // Don't show pagination if there's only one page
  if (totalPages <= 1) {
    return null;
  }
  
  const paginationItems = generatePaginationItems();
  
  return (
    <Pagination>
      <PaginationContent>
        {/* Previous button */}
        <PaginationItem>
          <PaginationPrevious 
            onClick={() => onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
            href="#"
          />
        </PaginationItem>
        
        {/* Page numbers */}
        {paginationItems.map((pageNumber, index) => {
          // Render ellipsis
          if (pageNumber < 0) {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }
          
          // Render page number
          return (
            <PaginationItem key={pageNumber}>
              <PaginationLink 
                isActive={pageNumber === currentPage}
                onClick={() => onPageChange(pageNumber)}
                href="#"
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          );
        })}
        
        {/* Next button */}
        <PaginationItem>
          <PaginationNext 
            onClick={() => onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
            href="#"
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};