import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface FinancialRatiosTableProps {
  data: any[];
  ticker: string;
  selectedMetrics: string[];
  onMetricToggle: (metricId: string) => void;
  timeFrame?: "annual" | "quarterly" | "ttm";
}

export const FinancialRatiosTable = ({ 
  data, 
  ticker,
  selectedMetrics,
  onMetricToggle,
  timeFrame = "annual"
}: FinancialRatiosTableProps) => {
  // Format the period (year or quarter) from date
  const formatPeriod = (date: string) => {
    const dateObj = new Date(date);
    
    // For quarterly data, display quarter and date
    if (timeFrame === 'quarterly') {
      const month = dateObj.getMonth();
      const quarter = Math.floor(month / 3) + 1;
      const year = dateObj.getFullYear();
      
      // Format the date nicely (e.g., Dec 31, 2023)
      const formattedDate = dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric'
      });
      
      return {
        quarter: `Q${quarter} ${year}`,
        date: formattedDate
      };
    }
    
    // For annual data, just use the year
    return {
      quarter: dateObj.getFullYear().toString(),
      date: ''
    };
  };

  // Format value based on type
  const formatValue = (value: any, isPercentage: boolean = false) => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    
    if (isPercentage) {
      return `${parseFloat(value).toFixed(2)}%`;
    }
    
    return parseFloat(value).toFixed(2);
  };

  // Define ratio categories and their fields
  const ratioCategories = [
    {
      name: 'Liquidity Ratios',
      ratios: [
        { field: 'currentRatio', label: 'Current Ratio' },
        { field: 'quickRatio', label: 'Quick Ratio' },
        { field: 'cashRatio', label: 'Cash Ratio' }
      ]
    },
    {
      name: 'Efficiency Ratios',
      ratios: [
        { field: 'daysOfSalesOutstanding', label: 'Days of Sales Outstanding' },
        { field: 'daysOfInventoryOutstanding', label: 'Days of Inventory Outstanding' },
        { field: 'operatingCycle', label: 'Operating Cycle' },
        { field: 'daysOfPayablesOutstanding', label: 'Days of Payables Outstanding' },
        { field: 'cashConversionCycle', label: 'Cash Conversion Cycle' },
        { field: 'receivablesTurnover', label: 'Receivables Turnover' },
        { field: 'payablesTurnover', label: 'Payables Turnover' },
        { field: 'inventoryTurnover', label: 'Inventory Turnover' },
        { field: 'fixedAssetTurnover', label: 'Fixed Asset Turnover' },
        { field: 'assetTurnover', label: 'Asset Turnover' }
      ]
    },
    {
      name: 'Profitability Ratios',
      ratios: [
        { field: 'grossProfitMargin', label: 'Gross Profit Margin', isPercentage: true },
        { field: 'operatingProfitMargin', label: 'Operating Profit Margin', isPercentage: true },
        { field: 'pretaxProfitMargin', label: 'Pretax Profit Margin', isPercentage: true },
        { field: 'netProfitMargin', label: 'Net Profit Margin', isPercentage: true },
        { field: 'effectiveTaxRate', label: 'Effective Tax Rate', isPercentage: true },
        { field: 'returnOnAssets', label: 'Return on Assets (ROA)', isPercentage: true },
        { field: 'returnOnEquity', label: 'Return on Equity (ROE)', isPercentage: true },
        { field: 'returnOnCapitalEmployed', label: 'Return on Capital Employed (ROCE)', isPercentage: true },
        { field: 'ebitPerRevenue', label: 'EBIT / Revenue', isPercentage: true }
      ]
    },
    {
      name: 'Solvency Ratios',
      ratios: [
        { field: 'debtRatio', label: 'Debt Ratio' },
        { field: 'debtEquityRatio', label: 'Debt to Equity Ratio' },
        { field: 'longTermDebtToCapitalization', label: 'Long Term Debt to Capitalization' },
        { field: 'totalDebtToCapitalization', label: 'Total Debt to Capitalization' },
        { field: 'interestCoverage', label: 'Interest Coverage' },
        { field: 'cashFlowToDebtRatio', label: 'Cash Flow to Debt Ratio' },
        { field: 'companyEquityMultiplier', label: 'Equity Multiplier' }
      ]
    },
    {
      name: 'Cash Flow Indicators',
      ratios: [
        { field: 'operatingCashFlowPerShare', label: 'Operating Cash Flow Per Share' },
        { field: 'freeCashFlowPerShare', label: 'Free Cash Flow Per Share' },
        { field: 'cashPerShare', label: 'Cash Per Share' },
        { field: 'operatingCashFlowSalesRatio', label: 'Operating Cash Flow / Sales Ratio' },
        { field: 'freeCashFlowOperatingCashFlowRatio', label: 'FCF / Operating Cash Flow Ratio' },
        { field: 'cashFlowCoverageRatios', label: 'Cash Flow Coverage Ratio' },
        { field: 'shortTermCoverageRatios', label: 'Short Term Coverage Ratio' },
        { field: 'capitalExpenditureCoverageRatio', label: 'Capital Expenditure Coverage Ratio' }
      ]
    },
    {
      name: 'Dividend Indicators',
      ratios: [
        { field: 'dividendYield', label: 'Dividend Yield', isPercentage: true },
        { field: 'dividendPayoutRatio', label: 'Dividend Payout Ratio', isPercentage: true },
        { field: 'dividendPaidAndCapexCoverageRatio', label: 'Dividend Paid & CAPEX Coverage Ratio' }
      ]
    },
    {
      name: 'Valuation Ratios',
      ratios: [
        { field: 'priceBookValueRatio', label: 'Price to Book Value Ratio' },
        { field: 'priceToBookRatio', label: 'Price to Book Ratio' },
        { field: 'priceToSalesRatio', label: 'Price to Sales Ratio' },
        { field: 'priceEarningsRatio', label: 'Price to Earnings Ratio (P/E)' },
        { field: 'priceToFreeCashFlowsRatio', label: 'Price to Free Cash Flows Ratio' },
        { field: 'priceToOperatingCashFlowsRatio', label: 'Price to Operating Cash Flows Ratio' },
        { field: 'priceCashFlowRatio', label: 'Price to Cash Flow Ratio' },
        { field: 'priceEarningsToGrowthRatio', label: 'PEG Ratio' },
        { field: 'priceSalesRatio', label: 'Price to Sales Ratio' },
        { field: 'enterpriseValueMultiple', label: 'Enterprise Value Multiple' },
        { field: 'priceFairValue', label: 'Price to Fair Value Ratio' }
      ]
    }
  ];

  // Format the periods with proper quarter and date display
  const formattedPeriods = data.map(item => formatPeriod(item.date));

  return (
    <div className="bg-white rounded-lg border">
      <ScrollArea className="w-full rounded-md">
        <div className="max-w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] sticky left-0 z-20 bg-white"></TableHead>
                <TableHead className="w-[250px] sticky left-[50px] z-20 bg-gray-50 font-semibold">Ratio</TableHead>
                {formattedPeriods.map((period, index) => (
                  <TableHead key={`${period.quarter}-${index}`} className="text-right min-w-[120px]">
                    <div>{period.quarter}</div>
                    {period.date && <div className="text-xs text-gray-500">{period.date}</div>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {ratioCategories.map((category) => (
                <React.Fragment key={category.name}>
                  {/* Category Header */}
                  <TableRow className="bg-gray-100">
                    <TableCell 
                      colSpan={formattedPeriods.length + 2} 
                      className="font-bold text-gray-700 py-2 sticky left-0 z-20"
                    >
                      {category.name}
                    </TableCell>
                  </TableRow>
                  
                  {/* Ratios in this category */}
                  {category.ratios.map((ratio) => (
                    <TableRow key={ratio.field}>
                      <TableCell className="w-[50px] sticky left-0 z-20 bg-white pr-0">
                        <Checkbox
                          id={`checkbox-${ratio.field}`}
                          checked={selectedMetrics.includes(ratio.field)}
                          onCheckedChange={() => onMetricToggle(ratio.field)}
                        />
                      </TableCell>
                      <TableCell className="font-medium sticky left-[50px] z-20 bg-white">
                        {ratio.label}
                      </TableCell>
                      {data.map((item, index) => (
                        <TableCell key={`${ratio.field}-${index}`} className="text-right">
                          {formatValue(item[ratio.field], ratio.isPercentage)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};