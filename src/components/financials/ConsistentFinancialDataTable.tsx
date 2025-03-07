import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { INCOME_STATEMENT_METRICS, calculateMetricValue, getMetricDisplayName, formatValue } from "@/utils/metricDefinitions";
import { calculateTTMGrowth } from "@/utils/ttmGrowthCalculator";
import { parseNumber } from "./IncomeStatementUtils";

interface ConsistentFinancialDataTableProps {
  combinedData: any[];
  periods: string[];
  selectedMetrics: string[];
  onMetricToggle: (metricId: string) => void;
  annualData: any[];
}

export const ConsistentFinancialDataTable = ({
  combinedData,
  periods,
  selectedMetrics,
  onMetricToggle,
  annualData
}: ConsistentFinancialDataTableProps) => {
  const calculateCashGrowth = (current: any, previous: any) => {
    if (!current || !previous) return null;
    
    const currentCash = parseFloat(String(current.cashAndShortTermInvestments).replace(/[^0-9.-]+/g, ""));
    const previousCash = parseFloat(String(previous.cashAndShortTermInvestments).replace(/[^0-9.-]+/g, ""));
    
    if (!previousCash || previousCash === 0) return null;
    return ((currentCash / previousCash) - 1) * 100;
  };

  return (
    <ScrollArea className="w-full rounded-md">
      <div className="max-w-full overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] sticky left-0 z-20 bg-white"></TableHead>
              <TableHead className="w-[250px] sticky left-[50px] z-20 bg-gray-50 font-semibold">Metrics</TableHead>
              {periods.map((period, index) => (
                <TableHead key={`${period}-${index}`} className="text-right min-w-[120px]">{period}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {INCOME_STATEMENT_METRICS.map((metric) => {
              const values = combinedData.map((current, index) => {
                const previous = combinedData[index + 1];
                
                if (current.period === "TTM") {
                  // Special handling for shares metrics in TTM period
                  if (metric.id === 'weightedAverageShsOut' || metric.id === 'weightedAverageShsOutDil') {
                    const sharesInBillions = annualData[0][metric.id] / 1000000000;
                    return `${sharesInBillions.toFixed(2)}B`;
                  }
                  if (metric.id === 'sharesChange') {
                    const currentShares = annualData[0].weightedAverageShsOutDil / 1000000000;
                    const previousShares = annualData[1].weightedAverageShsOutDil / 1000000000;
                    return ((currentShares - previousShares) / Math.abs(previousShares)) * 100;
                  }
                  if (metric.id === "revenueGrowth") {
                    return calculateTTMGrowth(current, annualData);
                  }
                  if (metric.id === "cashGrowth") {
                    const currentCash = parseFloat(String(current.cashAndShortTermInvestments).replace(/[^0-9.-]+/g, ""));
                    const previousYearCash = parseFloat(String(annualData[1].cashAndShortTermInvestments).replace(/[^0-9.-]+/g, ""));
                    
                    if (!previousYearCash || previousYearCash === 0) return null;
                    return ((currentCash / previousYearCash) - 1) * 100;
                  }
                  if (metric.id === "netIncomeGrowth") {
                    const currentNetIncome = parseFloat(String(current.netIncome).replace(/[^0-9.-]+/g, ""));
                    const mostRecentAnnualNetIncome = parseFloat(String(annualData[0].netIncome).replace(/[^0-9.-]+/g, ""));
                    const previousAnnualNetIncome = parseFloat(String(annualData[1].netIncome).replace(/[^0-9.-]+/g, ""));

                    const netIncomeDiff = Math.abs(currentNetIncome - mostRecentAnnualNetIncome);
                    const tolerance = mostRecentAnnualNetIncome * 0.001;

                    if (netIncomeDiff <= tolerance) {
                      return ((mostRecentAnnualNetIncome - previousAnnualNetIncome) / Math.abs(previousAnnualNetIncome)) * 100;
                    }

                    return ((currentNetIncome - previousAnnualNetIncome) / Math.abs(previousAnnualNetIncome)) * 100;
                  }
                  if (metric.id === "epsGrowth") {
                    const currentEPS = parseFloat(String(current.eps).replace(/[^0-9.-]+/g, ""));
                    const mostRecentAnnualEPS = parseFloat(String(annualData[0].eps).replace(/[^0-9.-]+/g, ""));
                    const previousAnnualEPS = parseFloat(String(annualData[1].eps).replace(/[^0-9.-]+/g, ""));

                    const epsDiff = Math.abs(currentEPS - mostRecentAnnualEPS);
                    const tolerance = mostRecentAnnualEPS * 0.001;

                    if (epsDiff <= tolerance) {
                      return ((mostRecentAnnualEPS - previousAnnualEPS) / Math.abs(previousAnnualEPS)) * 100;
                    }

                    return ((currentEPS - previousAnnualEPS) / Math.abs(previousAnnualEPS)) * 100;
                  }
                  if (metric.id === "ebitdaGrowth") {
                    const currentEBITDA = parseFloat(String(current.ebitda).replace(/[^0-9.-]+/g, ""));
                    const mostRecentAnnualEBITDA = parseFloat(String(annualData[0].ebitda).replace(/[^0-9.-]+/g, ""));
                    const previousAnnualEBITDA = parseFloat(String(annualData[1].ebitda).replace(/[^0-9.-]+/g, ""));

                    const ebitdaDiff = Math.abs(currentEBITDA - mostRecentAnnualEBITDA);
                    const tolerance = mostRecentAnnualEBITDA * 0.001;

                    if (ebitdaDiff <= tolerance) {
                      return ((mostRecentAnnualEBITDA - previousAnnualEBITDA) / Math.abs(previousAnnualEBITDA)) * 100;
                    }

                    return ((currentEBITDA - previousAnnualEBITDA) / Math.abs(previousAnnualEBITDA)) * 100;
                  }
                }
                
                if (metric.id === 'cashGrowth') {
                  return calculateCashGrowth(current, previous);
                }
                
                return calculateMetricValue(metric, current, previous);
              });

              return (
                <TableRow key={metric.id}>
                  <TableCell className="w-[50px] sticky left-0 z-20 bg-white pr-0">
                    <Checkbox
                      id={`checkbox-${metric.id}`}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => onMetricToggle(metric.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium sticky left-[50px] z-20 bg-gray-50">
                    {getMetricDisplayName(metric.id)}
                  </TableCell>
                  {values.map((v, index) => {
                    let parsedValue = v;
                    if (metric.id === 'weightedAverageShsOut' || metric.id === 'weightedAverageShsOutDil') {
                      if (typeof v === 'string' && v.endsWith('B')) {
                        parsedValue = parseFloat(v);
                      } else {
                        const sharesInBillions = parseNumber(v) / 1000000000;
                        parsedValue = parseFloat(sharesInBillions.toFixed(2));
                      }
                    } else {
                      parsedValue = parseNumber(v);
                    }

                    const displayValue = (() => {
                      if (parsedValue === null) return 'N/A';
                      if (metric.id === 'weightedAverageShsOut' || metric.id === 'weightedAverageShsOutDil') {
                        return `${parsedValue.toFixed(2)}B`;
                      }
                      if (metric.id === 'cashGrowth' || metric.format === 'percentage') {
                        return `${parsedValue.toFixed(1)}%`;
                      }
                      return formatValue(parsedValue, metric.format);
                    })();

                    return (
                      <TableCell key={`value-${metric.id}-${index}`} className="text-right">
                        {displayValue}
                      </TableCell>
                    );
                  })}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </div>
    </ScrollArea>
  );
};