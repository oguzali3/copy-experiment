import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { parseNumber } from "@/components/financials/BalanceSheetUtils";
import { useMemo } from "react";

export const useBalanceSheetData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  // Fetch balance sheet data
  const { data: balanceSheetRawData, isLoading: isBalanceSheetLoading, error: balanceSheetError } = useQuery({
    queryKey: ['balance-sheet', ticker, period],
    queryFn: () => fetchFinancialData('balance-sheet-statement', ticker, period),
    enabled: !!ticker,
    // Add stale time to reduce refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch income statement data for shares outstanding
  const { data: incomeStatementRawData, isLoading: isIncomeStatementLoading } = useQuery({
    queryKey: ['income-statement', ticker, period],
    queryFn: () => fetchFinancialData('income-statement', ticker, period),
    enabled: !!ticker,
    // Add stale time to reduce refetching
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const normalizeData = (data: any, dataType: string) => {
    if (!data) return [];
    
    // If data is already an array, return it
    if (Array.isArray(data)) return data;
    
    // If data has ticker.period structure
    if (typeof data === 'object' && data[ticker]) {
      if (data[ticker][period] && Array.isArray(data[ticker][period])) {
        return data[ticker][period];
      }
    }
    
    // If data has just period structure
    if (typeof data === 'object') {
      if (data[period] && Array.isArray(data[period])) {
        return data[period];
      }
      
      // Try to find any array property
      for (const key in data) {
        if (Array.isArray(data[key])) {
          return data[key];
        }
      }
    }
    
    console.warn(`Unable to normalize ${dataType} data`);
    return [];
  };

  // Use useMemo to prevent recalculation on every render
  const { filteredData, error } = useMemo(() => {
    // Normalize the data
    const balanceSheetData = normalizeData(balanceSheetRawData, 'balance sheet');
    const incomeStatementData = normalizeData(incomeStatementRawData, 'income statement');
    
    if (!balanceSheetData.length) {
      return { filteredData: [], error: balanceSheetError };
    }

    // Sort data, ensuring TTM comes first if it exists
    const sortedBalanceSheet = [...balanceSheetData]
      .sort((a: any, b: any) => {
        // TTM should come first
        if (a.period === 'TTM') return -1;
        if (b.period === 'TTM') return 1;
        // Then sort by date
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, period === 'quarter' ? 60 : 15);

    const sortedIncomeStatement = [...(incomeStatementData || [])]
      .sort((a: any, b: any) => {
        // TTM should come first
        if (a.period === 'TTM') return -1;
        if (b.period === 'TTM') return 1;
        // Then sort by date
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      })
      .slice(0, period === 'quarter' ? 60 : 15);

    // Combine balance sheet and income statement data by date or period
    const combinedData = sortedBalanceSheet.map((balanceSheet: any) => {
      // For TTM data, find TTM in income statement if available
      if (balanceSheet.period === 'TTM') {
        const ttmIncomeStatement = sortedIncomeStatement?.find(
          (income: any) => income.period === 'TTM'
        );
        
        if (ttmIncomeStatement) {
          return {
            ...balanceSheet,
            weightedAverageShsOutDil: ttmIncomeStatement?.weightedAverageShsOutDil
          };
        }
      }
      
      // For regular periods, match by date
      const matchingIncomeStatement = sortedIncomeStatement?.find(
        (income: any) => new Date(income.date).getTime() === new Date(balanceSheet.date).getTime()
      );
      
      return {
        ...balanceSheet,
        weightedAverageShsOutDil: matchingIncomeStatement?.weightedAverageShsOutDil
      };
    });

    return { filteredData: combinedData, error: null };
  }, [balanceSheetRawData, incomeStatementRawData, period, ticker, balanceSheetError]);

  const isLoading = isBalanceSheetLoading || isIncomeStatementLoading;

  return { filteredData, isLoading, error };
};