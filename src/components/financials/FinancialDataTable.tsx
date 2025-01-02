import { Table, TableBody } from "@/components/ui/table";
import { IncomeStatementHeader } from "./IncomeStatementHeader";
import { IncomeStatementMetrics } from "./IncomeStatementMetrics";
import { INCOME_STATEMENT_METRICS, calculateMetricValue, getMetricDisplayName, formatValue } from "@/utils/metricDefinitions";
import { calculateTTMGrowth } from "@/utils/ttmGrowthCalculator";
import { parseNumber } from "./IncomeStatementUtils";

interface FinancialDataTableProps {
  combinedData: any[];
  periods: string[];
  selectedMetrics: string[];
  onMetricToggle: (metricId: string) => void;
  annualData: any[];
}

export const FinancialDataTable = ({
  combinedData,
  periods,
  selectedMetrics,
  onMetricToggle,
  annualData
}: FinancialDataTableProps) => {
  const calculateCashGrowth = (current: any, previous: any) => {
    if (!previous) return null;
    
    const currentCash = parseFloat(String(current.cashAndShortTermInvestments).replace(/[^0-9.-]+/g, ""));
    const previousCash = parseFloat(String(previous.cashAndShortTermInvestments).replace(/[^0-9.-]+/g, ""));
    
    if (previousCash === 0) return 0;
    return ((currentCash - previousCash) / Math.abs(previousCash)) * 100;
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <IncomeStatementHeader periods={periods} />
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
                  return ((currentCash - previousYearCash) / Math.abs(previousYearCash)) * 100;
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
              <IncomeStatementMetrics
                key={metric.id}
                metricId={metric.id}
                label={getMetricDisplayName(metric.id)}
                values={values.map(v => {
                  if (metric.id === 'weightedAverageShsOut' || metric.id === 'weightedAverageShsOutDil') {
                    if (typeof v === 'string' && v.endsWith('B')) {
                      return parseFloat(v);
                    }
                    const sharesInBillions = parseNumber(v) / 1000000000;
                    return parseFloat(sharesInBillions.toFixed(2));
                  }
                  return parseNumber(v);
                })}
                isSelected={selectedMetrics.includes(metric.id)}
                onToggle={onMetricToggle}
                formatValue={(value, format) => {
                  if (metric.id === 'weightedAverageShsOut' || metric.id === 'weightedAverageShsOutDil') {
                    return `${value.toFixed(2)}B`;
                  }
                  return formatValue(value, format);
                }}
                isGrowthMetric={metric.format === 'percentage' || metric.id === 'cashGrowth'}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};