import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";

interface KeyMetricsTableProps {
  data: any[];
  ticker: string;
  selectedMetrics: string[];
  onMetricToggle: (metricId: string) => void;
  timeFrame?: "annual" | "quarterly" | "ttm";
}

export const KeyMetricsTable = ({ 
  data, 
  ticker, 
  selectedMetrics,
  onMetricToggle,
  timeFrame = "annual"
}: KeyMetricsTableProps) => {
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
  const formatValue = (value: any, type: 'percentage' | 'currency' | 'ratio' | 'number' = 'number') => {
    if (value === null || value === undefined || isNaN(value)) return 'N/A';
    
    switch (type) {
      case 'percentage':
        return `${parseFloat(value).toFixed(2)}%`;
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          notation: parseFloat(value) > 1000000 ? 'compact' : 'standard',
          maximumFractionDigits: 2
        }).format(parseFloat(value));
      case 'ratio':
        return parseFloat(value).toFixed(2) + 'x';
      default:
        return parseFloat(value).toFixed(2);
    }
  };

  // Define metric categories and their fields using your exact database field names
  const metricCategories = [
    {
      name: 'Per Share Metrics',
      metrics: [
        { field: 'revenuePerShare', label: 'Revenue Per Share', type: 'currency' },
        { field: 'netIncomePerShare', label: 'Net Income Per Share', type: 'currency' },
        { field: 'operatingCashFlowPerShare', label: 'Operating Cash Flow Per Share', type: 'currency' },
        { field: 'freeCashFlowPerShare', label: 'Free Cash Flow Per Share', type: 'currency' },
        { field: 'cashPerShare', label: 'Cash Per Share', type: 'currency' },
        { field: 'bookValuePerShare', label: 'Book Value Per Share', type: 'currency' },
        { field: 'tangibleBookValuePerShare', label: 'Tangible Book Value Per Share', type: 'currency' },
        { field: 'shareholdersEquityPerShare', label: 'Shareholders Equity Per Share', type: 'currency' },
        { field: 'interestDebtPerShare', label: 'Interest Debt Per Share', type: 'currency' },
        { field: 'capexPerShare', label: 'Capital Expenditure Per Share', type: 'currency' }
      ]
    },
    {
      name: 'Valuation Metrics',
      metrics: [
        { field: 'marketCap', label: 'Market Cap', type: 'currency' },
        { field: 'enterpriseValue', label: 'Enterprise Value', type: 'currency' },
        { field: 'peRatio', label: 'PE Ratio', type: 'ratio' },
        { field: 'priceToSalesRatio', label: 'Price to Sales Ratio', type: 'ratio' },
        { field: 'pocfratio', label: 'Price to Operating Cash Flow Ratio', type: 'ratio' },
        { field: 'pfcfRatio', label: 'Price to Free Cash Flow Ratio', type: 'ratio' },
        { field: 'pbRatio', label: 'Price to Book Ratio', type: 'ratio' },
        { field: 'ptbRatio', label: 'Price to Tangible Book Ratio', type: 'ratio' },
        { field: 'evToSales', label: 'Enterprise Value to Sales', type: 'ratio' },
        { field: 'enterpriseValueOverEBITDA', label: 'Enterprise Value to EBITDA', type: 'ratio' },
        { field: 'evToOperatingCashFlow', label: 'Enterprise Value to Operating Cash Flow', type: 'ratio' },
        { field: 'earningsYield', label: 'Earnings Yield', type: 'percentage' },
        { field: 'freeCashFlowYield', label: 'Free Cash Flow Yield', type: 'percentage' }
      ]
    },
    {
      name: 'Financial Strength Metrics',
      metrics: [
        { field: 'debtToEquity', label: 'Debt to Equity', type: 'ratio' },
        { field: 'debtToAssets', label: 'Debt to Assets', type: 'ratio' },
        { field: 'netDebtToEBITDA', label: 'Net Debt to EBITDA', type: 'ratio' },
        { field: 'currentRatio', label: 'Current Ratio', type: 'ratio' },
        { field: 'interestCoverage', label: 'Interest Coverage', type: 'ratio' },
        { field: 'incomeQuality', label: 'Income Quality', type: 'ratio' }
      ]
    },
    {
      name: 'Efficiency Metrics',
      metrics: [
        { field: 'roic', label: 'Return on Invested Capital (ROIC)', type: 'percentage' },
        { field: 'roe', label: 'Return on Equity (ROE)', type: 'percentage' },
        { field: 'returnOnTangibleAssets', label: 'Return on Tangible Assets', type: 'percentage' },
        { field: 'salesGeneralAndAdministrativeToRevenue', label: 'SG&A to Revenue', type: 'percentage' },
        { field: 'researchAndDdevelopementToRevenue', label: 'R&D to Revenue', type: 'percentage' },
        { field: 'intangiblesToTotalAssets', label: 'Intangibles to Total Assets', type: 'percentage' },
        { field: 'capexToOperatingCashFlow', label: 'CAPEX to Operating Cash Flow', type: 'percentage' },
        { field: 'capexToRevenue', label: 'CAPEX to Revenue', type: 'percentage' },
        { field: 'capexToDepreciation', label: 'CAPEX to Depreciation', type: 'ratio' },
        { field: 'stockBasedCompensationToRevenue', label: 'Stock-Based Compensation to Revenue', type: 'percentage' }
      ]
    },
    {
      name: 'Operational Metrics',
      metrics: [
        { field: 'daysSalesOutstanding', label: 'Days Sales Outstanding', type: 'number' },
        { field: 'daysPayablesOutstanding', label: 'Days Payables Outstanding', type: 'number' },
        { field: 'daysOfInventoryOnHand', label: 'Days of Inventory on Hand', type: 'number' },
        { field: 'receivablesTurnover', label: 'Receivables Turnover', type: 'number' },
        { field: 'payablesTurnover', label: 'Payables Turnover', type: 'number' },
        { field: 'inventoryTurnover', label: 'Inventory Turnover', type: 'number' }
      ]
    },
    {
      name: 'Asset Metrics',
      metrics: [
        { field: 'grahamNumber', label: 'Graham Number', type: 'currency' },
        { field: 'grahamNetNet', label: 'Graham Net-Net', type: 'currency' },
        { field: 'workingCapital', label: 'Working Capital', type: 'currency' },
        { field: 'tangibleAssetValue', label: 'Tangible Asset Value', type: 'currency' },
        { field: 'netCurrentAssetValue', label: 'Net Current Asset Value', type: 'currency' },
        { field: 'investedCapital', label: 'Invested Capital', type: 'currency' },
        { field: 'averageReceivables', label: 'Average Receivables', type: 'currency' },
        { field: 'averagePayables', label: 'Average Payables', type: 'currency' },
        { field: 'averageInventory', label: 'Average Inventory', type: 'currency' }
      ]
    },
    {
      name: 'Dividend Metrics',
      metrics: [
        { field: 'dividendYield', label: 'Dividend Yield', type: 'percentage' },
        { field: 'payoutRatio', label: 'Payout Ratio', type: 'percentage' }
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
                <TableHead className="w-[250px] sticky left-[50px] z-20 bg-gray-50 font-semibold">Metric</TableHead>
                {formattedPeriods.map((period, index) => (
                  <TableHead key={`${period.quarter}-${index}`} className="text-right min-w-[120px]">
                    <div>{period.quarter}</div>
                    {period.date && <div className="text-xs text-gray-500">{period.date}</div>}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metricCategories.map((category) => (
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
                  
                  {/* Metrics in this category */}
                  {category.metrics.map((metric) => (
                    <TableRow key={metric.field}>
                      <TableCell className="w-[50px] sticky left-0 z-20 bg-white pr-0">
                        <Checkbox
                          id={`checkbox-${metric.field}`}
                          checked={selectedMetrics.includes(metric.field)}
                          onCheckedChange={() => onMetricToggle(metric.field)}
                        />
                      </TableCell>
                      <TableCell className="font-medium sticky left-[50px] z-20 bg-white">
                        {metric.label}
                      </TableCell>
                      {data.map((item, index) => (
                        <TableCell key={`${metric.field}-${index}`} className="text-right">
                          {formatValue(item[metric.field], metric.type)}
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