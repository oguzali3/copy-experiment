import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatPeriod } from "@/utils/formatPeriod";

interface CashFlowTableProps {
  data: any[];
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  timeFrame: "annual" | "quarterly" | "ttm";
}

export const CashFlowTable = ({ 
  data, 
  selectedMetrics, 
  onMetricsChange,
  timeFrame
}: CashFlowTableProps) => {
  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  // Using our new utility function

  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'N/A';
    
    const numValue = typeof value === 'number' ? value : parseFloat(String(value).replace(/[^0-9.-]/g, ""));
    
    if (isNaN(numValue)) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(numValue);
  };

  const metrics = [
    { id: "netIncome", label: "Net Income" },
    { id: "depreciationAndAmortization", label: "Depreciation & Amortization" },
    { id: "deferredIncomeTax", label: "Deferred Income Tax" },
    { id: "stockBasedCompensation", label: "Stock Based Compensation" },
    { id: "changeInWorkingCapital", label: "Change in Working Capital" },
    { id: "accountsReceivables", label: "Accounts Receivables" },
    { id: "inventory", label: "Inventory" },
    { id: "accountsPayables", label: "Accounts Payables" },
    { id: "otherWorkingCapital", label: "Other Working Capital" },
    { id: "otherNonCashItems", label: "Other Non-Cash Items" },
    { id: "netCashProvidedByOperatingActivities", label: "Net Cash from Operating Activities" },
    { id: "investmentsInPropertyPlantAndEquipment", label: "Investments in PP&E" },
    { id: "acquisitionsNet", label: "Acquisitions (Net)" },
    { id: "purchasesOfInvestments", label: "Purchases of Investments" },
    { id: "salesMaturitiesOfInvestments", label: "Sales/Maturities of Investments" },
    { id: "otherInvestingActivites", label: "Other Investing Activities" },
    { id: "netCashUsedForInvestingActivites", label: "Net Cash from Investing Activities" },
    { id: "debtRepayment", label: "Debt Repayment" },
    { id: "commonStockIssued", label: "Common Stock Issued" },
    { id: "commonStockRepurchased", label: "Common Stock Repurchased" },
    { id: "dividendsPaid", label: "Dividends Paid" },
    { id: "otherFinancingActivites", label: "Other Financing Activities" },
    { id: "netCashUsedProvidedByFinancingActivities", label: "Net Cash from Financing Activities" },
    { id: "effectOfForexChangesOnCash", label: "Effect of Forex on Cash" },
    { id: "netChangeInCash", label: "Net Change in Cash" },
    { id: "cashAtEndOfPeriod", label: "Cash at End of Period" },
    { id: "cashAtBeginningOfPeriod", label: "Cash at Beginning of Period" },
    { id: "operatingCashFlow", label: "Operating Cash Flow" },
    { id: "capitalExpenditure", label: "Capital Expenditure" },
    { id: "freeCashFlow", label: "Free Cash Flow" }
  ];

  return (
    <div className="bg-white rounded-lg border">
      <ScrollArea className="w-full rounded-md">
        <div className="max-w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] sticky left-0 z-20 bg-white"></TableHead>
                <TableHead className="w-[250px] sticky left-[50px] z-20 bg-gray-50 font-semibold">Metrics</TableHead>
                {data.map((row, index) => {
                  const { quarter, date } = formatPeriod(row.date, row.period, timeFrame);
                  return (
                    <TableHead key={`${row.date}-${index}`} className="text-right min-w-[120px]">
                      <div>{quarter}</div>
                      {date && <div className="text-xs text-gray-500">{date}</div>}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.id}>
                  <TableCell className="w-[50px] sticky left-0 z-20 bg-white pr-0">
                    <Checkbox
                      id={`checkbox-${metric.id}`}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => handleMetricToggle(metric.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium sticky left-[50px] z-20 bg-gray-50">
                    {metric.label}
                  </TableCell>
                  {data.map((row, index) => (
                    <TableCell key={`${row.date}-${metric.id}-${index}`} className="text-right">
                      {formatValue(row[metric.id])}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};