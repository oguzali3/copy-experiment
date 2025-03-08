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
    
    const currentCash = parseFloat(String(current.cashAndShortTermInvestments || '0').replace(/[^0-9.-]+/g, ""));
    const previousCash = parseFloat(String(previous?.cashAndShortTermInvestments || '0').replace(/[^0-9.-]+/g, ""));
    
    if (!previousCash || previousCash === 0) return null;
    return ((currentCash / previousCash) - 1) * 100;
  };

  // Safely calculate TTM metrics that reference annualData
  const calculateTTMMetric = (current: any, metricName: string) => {
    if (!current) return null;
    if (!annualData || annualData.length < 2) return null;

    // Safety check for accessing annualData
    const getAnnualValue = (index: number, field: string) => {
      try {
        if (annualData && annualData.length > index) {
          return parseFloat(String(annualData[index][field] || '0').replace(/[^0-9.-]+/g, ""));
        }
        return 0;
      } catch (error) {
        console.warn(`Error accessing annualData[${index}].${field}:`, error);
        return 0;
      }
    };

    try {
      switch (metricName) {
        case 'revenueGrowth':
          return calculateTTMGrowth(current, annualData);
          
        case 'cashGrowth': {
          const currentCash = parseFloat(String(current.cashAndShortTermInvestments || '0').replace(/[^0-9.-]+/g, ""));
          const previousYearCash = getAnnualValue(1, 'cashAndShortTermInvestments');
          
          if (!previousYearCash || previousYearCash === 0) return null;
          return ((currentCash / previousYearCash) - 1) * 100;
        }
        
        case 'netIncomeGrowth': {
          const currentNetIncome = parseFloat(String(current.netIncome || '0').replace(/[^0-9.-]+/g, ""));
          const mostRecentAnnualNetIncome = getAnnualValue(0, 'netIncome');
          const previousAnnualNetIncome = getAnnualValue(1, 'netIncome');

          if (!previousAnnualNetIncome) return null;

          const netIncomeDiff = Math.abs(currentNetIncome - mostRecentAnnualNetIncome);
          const tolerance = mostRecentAnnualNetIncome * 0.001;

          if (netIncomeDiff <= tolerance) {
            return ((mostRecentAnnualNetIncome - previousAnnualNetIncome) / Math.abs(previousAnnualNetIncome)) * 100;
          }

          return ((currentNetIncome - previousAnnualNetIncome) / Math.abs(previousAnnualNetIncome)) * 100;
        }
        
        case 'epsGrowth': {
          const currentEPS = parseFloat(String(current.eps || '0').replace(/[^0-9.-]+/g, ""));
          const mostRecentAnnualEPS = getAnnualValue(0, 'eps');
          const previousAnnualEPS = getAnnualValue(1, 'eps');

          if (!previousAnnualEPS) return null;

          const epsDiff = Math.abs(currentEPS - mostRecentAnnualEPS);
          const tolerance = mostRecentAnnualEPS * 0.001;

          if (epsDiff <= tolerance) {
            return ((mostRecentAnnualEPS - previousAnnualEPS) / Math.abs(previousAnnualEPS)) * 100;
          }

          return ((currentEPS - previousAnnualEPS) / Math.abs(previousAnnualEPS)) * 100;
        }
        
        case 'ebitdaGrowth': {
          const currentEBITDA = parseFloat(String(current.ebitda || '0').replace(/[^0-9.-]+/g, ""));
          const mostRecentAnnualEBITDA = getAnnualValue(0, 'ebitda');
          const previousAnnualEBITDA = getAnnualValue(1, 'ebitda');

          if (!previousAnnualEBITDA) return null;

          const ebitdaDiff = Math.abs(currentEBITDA - mostRecentAnnualEBITDA);
          const tolerance = mostRecentAnnualEBITDA * 0.001;

          if (ebitdaDiff <= tolerance) {
            return ((mostRecentAnnualEBITDA - previousAnnualEBITDA) / Math.abs(previousAnnualEBITDA)) * 100;
          }

          return ((currentEBITDA - previousAnnualEBITDA) / Math.abs(previousAnnualEBITDA)) * 100;
        }
        
        default:
          return null;
      }
    } catch (error) {
      console.error(`Error calculating ${metricName} for TTM:`, error);
      return null;
    }
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
                    // Check if annualData exists
                    if (annualData && annualData.length > 0) {
                      const sharesInBillions = annualData[0][metric.id] / 1000000000;
                      return `${sharesInBillions.toFixed(2)}B`;
                    } else {
                      // Use the TTM data directly
                      const sharesInBillions = current[metric.id] / 1000000000;
                      return `${sharesInBillions.toFixed(2)}B`;
                    }
                  }
                  if (metric.id === 'sharesChange') {
                    // Check if we have enough annual data
                    if (annualData && annualData.length >= 2) {
                      const currentShares = annualData[0].weightedAverageShsOutDil / 1000000000;
                      const previousShares = annualData[1].weightedAverageShsOutDil / 1000000000;
                      return ((currentShares - previousShares) / Math.abs(previousShares)) * 100;
                    }
                    return null; // Not enough data to calculate
                  }
                  
                  // Use the special TTM calculation function for metrics that need annual data
                  if (['revenueGrowth', 'cashGrowth', 'netIncomeGrowth', 'epsGrowth', 'ebitdaGrowth'].includes(metric.id)) {
                    return calculateTTMMetric(current, metric.id);
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