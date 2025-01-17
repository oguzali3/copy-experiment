import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { parseNumber } from "@/components/financials/BalanceSheetUtils";

export const useBalanceSheetData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  // Fetch balance sheet data
  const { data: balanceSheetData, isLoading: isBalanceSheetLoading, error: balanceSheetError } = useQuery({
    queryKey: ['balance-sheet', ticker, period],
    queryFn: () => fetchFinancialData('balance-sheet-statement', ticker, period),
    enabled: !!ticker,
  });

  // Fetch income statement data for shares outstanding
  const { data: incomeStatementData, isLoading: isIncomeStatementLoading } = useQuery({
    queryKey: ['income-statement', ticker, period],
    queryFn: () => fetchFinancialData('income-statement', ticker, period),
    enabled: !!ticker,
  });

  const processFinancialData = () => {
    if (!balanceSheetData || !Array.isArray(balanceSheetData) || balanceSheetData.length === 0) {
      return { combinedData: [], error: balanceSheetError };
    }

    // Get data sorted by date
    const sortedBalanceSheet = balanceSheetData
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, period === 'quarter' ? 20 : 10);

    const sortedIncomeStatement = incomeStatementData
      ?.sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, period === 'quarter' ? 20 : 10);

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