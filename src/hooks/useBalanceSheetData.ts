import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { parseNumber } from "@/components/financials/BalanceSheetUtils";

export const useBalanceSheetData = (ticker: string) => {
  // Fetch balance sheet data
  const { data: balanceSheetData, isLoading: isBalanceSheetLoading, error: balanceSheetError } = useQuery({
    queryKey: ['balance-sheet', ticker],
    queryFn: () => fetchFinancialData('balance-sheet', ticker),
    enabled: !!ticker,
  });

  // Fetch income statement data for shares outstanding
  const { data: incomeStatementData, isLoading: isIncomeStatementLoading } = useQuery({
    queryKey: ['income-statement', ticker],
    queryFn: () => fetchFinancialData('income-statement', ticker),
    enabled: !!ticker,
  });

  const processFinancialData = () => {
    if (!balanceSheetData || !Array.isArray(balanceSheetData) || balanceSheetData.length === 0) {
      return { combinedData: [], error: balanceSheetError };
    }

    // Get annual data sorted by date
    const annualBalanceSheet = balanceSheetData
      .filter((item: any) => item.period === 'FY')
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    const annualIncomeStatement = incomeStatementData
      ?.filter((item: any) => item.period === 'FY')
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);

    // Combine balance sheet and income statement data by date
    const combinedData = annualBalanceSheet.map((balanceSheet: any) => {
      const matchingIncomeStatement = annualIncomeStatement?.find(
        (income: any) => new Date(income.date).getFullYear() === new Date(balanceSheet.date).getFullYear()
      );
      return {
        ...balanceSheet,
        weightedAverageShsOutDil: matchingIncomeStatement?.weightedAverageShsOutDil
      };
    });

    // Get TTM data
    const ttmBalanceSheet = balanceSheetData.find((item: any) => item.period === 'TTM');
    const ttmIncomeStatement = incomeStatementData?.find((item: any) => item.period === 'TTM');

    // If TTM values match the most recent annual values, use the annual values
    const mostRecentAnnual = combinedData[0];
    const shouldUseMostRecentAnnual = 
      ttmBalanceSheet && 
      mostRecentAnnual && 
      Math.abs(parseNumber(ttmBalanceSheet.totalStockholdersEquity) - parseNumber(mostRecentAnnual.totalStockholdersEquity)) < 0.01;

    // Add TTM data if available
    const filteredData = ttmBalanceSheet && ttmIncomeStatement
      ? [{ 
          ...ttmBalanceSheet,
          weightedAverageShsOutDil: shouldUseMostRecentAnnual 
            ? mostRecentAnnual.weightedAverageShsOutDil 
            : ttmIncomeStatement.weightedAverageShsOutDil,
          date: ttmBalanceSheet.date,
          period: 'TTM'
        }, 
        ...combinedData
      ] 
      : combinedData;

    return { filteredData, error: null };
  };

  const isLoading = isBalanceSheetLoading || isIncomeStatementLoading;
  const { filteredData, error } = processFinancialData();

  return { filteredData, isLoading, error };
};