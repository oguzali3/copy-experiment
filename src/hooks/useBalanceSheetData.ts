import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { parseNumber } from "@/components/financials/BalanceSheetUtils";

export const useBalanceSheetData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  // Fetch balance sheet data
  const { data: balanceSheetRawData, isLoading: isBalanceSheetLoading, error: balanceSheetError } = useQuery({
    queryKey: ['balance-sheet', ticker, period],
    queryFn: () => fetchFinancialData('balance-sheet-statement', ticker, period),
    enabled: !!ticker,
  });

  // Fetch income statement data for shares outstanding
  const { data: incomeStatementRawData, isLoading: isIncomeStatementLoading } = useQuery({
    queryKey: ['income-statement', ticker, period],
    queryFn: () => fetchFinancialData('income-statement', ticker, period),
    enabled: !!ticker,
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
    
    console.warn(`Unable to normalize ${dataType} data:`, data);
    return [];
  };

  const processFinancialData = () => {
    // Normalize the data
    const balanceSheetData = normalizeData(balanceSheetRawData, 'balance sheet');
    const incomeStatementData = normalizeData(incomeStatementRawData, 'income statement');
    
    if (!balanceSheetData.length) {
      return { combinedData: [], error: balanceSheetError };
    }

    // Sort data by date
    const sortedBalanceSheet = [...balanceSheetData]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, period === 'quarter' ? 60 : 15);

    const sortedIncomeStatement = [...(incomeStatementData || [])]
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, period === 'quarter' ? 60 : 15);

    // Combine balance sheet and income statement data by date
    const combinedData = sortedBalanceSheet.map((balanceSheet: any) => {
      const matchingIncomeStatement = sortedIncomeStatement?.find(
        (income: any) => new Date(income.date).getTime() === new Date(balanceSheet.date).getTime()
      );
      return {
        ...balanceSheet,
        weightedAverageShsOutDil: matchingIncomeStatement?.weightedAverageShsOutDil
      };
    });

    return { filteredData: combinedData, error: null };
  };

  const isLoading = isBalanceSheetLoading || isIncomeStatementLoading;
  const { filteredData, error } = processFinancialData();

  return { filteredData, isLoading, error };
};