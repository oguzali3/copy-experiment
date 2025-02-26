import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";

export const useCashFlowData = (ticker: string, period: 'annual' | 'quarter' = 'annual') => {
  const { data: cashFlowRawData, isLoading, error } = useQuery({
    queryKey: ['cash-flow', ticker, period],
    queryFn: async () => {
      const data = await fetchFinancialData('cash-flow-statement', ticker, period);
      
      if (!data || !Array.isArray(data)) {
        console.log('No cash flow data received or invalid format');
        return { [ticker]: { [period]: [] } };
      }

      const transformedData = data.map(item => ({
        period: item.period === 'TTM' ? 'TTM' : new Date(item.date).getFullYear().toString(),
        netCashFromOperatingActivities: item.netCashFromOperatingActivities?.toString() || "0",
        netCashUsedForInvestingActivites: item.netCashUsedForInvestingActivites?.toString() || "0",
        netCashUsedProvidedByFinancingActivities: item.netCashUsedProvidedByFinancingActivities?.toString() || "0",
        freeCashFlow: item.freeCashFlow?.toString() || "0",
        netCashFlow: item.netCashFlow?.toString() || "0",
        capitalExpenditure: item.capitalExpenditure?.toString() || "0",
        cashAtEndOfPeriod: item.cashAtEndOfPeriod?.toString() || "0",
        cashAtBeginningOfPeriod: item.cashAtBeginningOfPeriod?.toString() || "0",
        operatingCashFlow: item.operatingCashFlow?.toString() || "0",
        investingCashFlow: item.investingCashFlow?.toString() || "0",
        financingCashFlow: item.financingCashFlow?.toString() || "0",
        depreciationAndAmortization: item.depreciationAndAmortization?.toString() || "0",
        stockBasedCompensation: item.stockBasedCompensation?.toString() || "0",
        otherNonCashItems: item.otherNonCashItems?.toString() || "0",
        changeInWorkingCapital: item.changeInWorkingCapital?.toString() || "0",
        accountsReceivables: item.accountsReceivables?.toString() || "0",
        accountsPayables: item.accountsPayables?.toString() || "0",
        otherWorkingCapital: item.otherWorkingCapital?.toString() || "0",
        acquisitionsNet: item.acquisitionsNet?.toString() || "0",
        purchasesOfInvestments: item.purchasesOfInvestments?.toString() || "0",
        salesMaturitiesOfInvestments: item.salesMaturitiesOfInvestments?.toString() || "0",
        debtRepayment: item.debtRepayment?.toString() || "0",
        commonStockIssued: item.commonStockIssued?.toString() || "0",
        commonStockRepurchased: item.commonStockRepurchased?.toString() || "0",
        dividendsPaid: item.dividendsPaid?.toString() || "0",
        otherFinancingActivites: item.otherFinancingActivites?.toString() || "0",
        effectOfForexChangesOnCash: item.effectOfForexChangesOnCash?.toString() || "0",
        netChangeInCash: item.netChangeInCash?.toString() || "0"
      }));

      return {
        [ticker]: {
          [period]: transformedData
        }
      };
    },
    enabled: !!ticker,
  });

  return { 
    cashFlowData: cashFlowRawData || { [ticker]: { [period]: [] } }, 
    isLoading, 
    error 
  };
};