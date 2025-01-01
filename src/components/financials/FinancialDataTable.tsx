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
  return (
    <div className="overflow-x-auto">
      <Table>
        <IncomeStatementHeader periods={periods} />
        <TableBody>
          {INCOME_STATEMENT_METRICS.map((metric) => {
            const values = combinedData.map((current, index) => {
              const previous = combinedData[index + 1];
              
              if (current.period === "TTM") {
                if (metric.id === "revenueGrowth") {
                  return calculateTTMGrowth(current, annualData);
                }
                if (metric.id === "netIncomeGrowth") {
                  // Handle TTM net income growth similar to revenue growth
                  const currentNetIncome = parseFloat(String(current.netIncome).replace(/[^0-9.-]+/g, ""));
                  const mostRecentAnnualNetIncome = parseFloat(String(annualData[0].netIncome).replace(/[^0-9.-]+/g, ""));
                  const previousAnnualNetIncome = parseFloat(String(annualData[1].netIncome).replace(/[^0-9.-]+/g, ""));

                  // Check if TTM matches most recent fiscal year (within 0.1% tolerance)
                  const netIncomeDiff = Math.abs(currentNetIncome - mostRecentAnnualNetIncome);
                  const tolerance = mostRecentAnnualNetIncome * 0.001; // 0.1% tolerance

                  if (netIncomeDiff <= tolerance) {
                    // Use fiscal year growth rate
                    return ((mostRecentAnnualNetIncome - previousAnnualNetIncome) / Math.abs(previousAnnualNetIncome)) * 100;
                  }

                  // Calculate TTM growth against previous year
                  return ((currentNetIncome - previousAnnualNetIncome) / Math.abs(previousAnnualNetIncome)) * 100;
                }
                if (metric.id === "epsGrowth") {
                  // Handle TTM EPS growth similar to revenue growth
                  const currentEPS = parseFloat(String(current.eps).replace(/[^0-9.-]+/g, ""));
                  const mostRecentAnnualEPS = parseFloat(String(annualData[0].eps).replace(/[^0-9.-]+/g, ""));
                  const previousAnnualEPS = parseFloat(String(annualData[1].eps).replace(/[^0-9.-]+/g, ""));

                  // Check if TTM matches most recent fiscal year (within 0.1% tolerance)
                  const epsDiff = Math.abs(currentEPS - mostRecentAnnualEPS);
                  const tolerance = mostRecentAnnualEPS * 0.001; // 0.1% tolerance

                  if (epsDiff <= tolerance) {
                    // Use fiscal year growth rate
                    return ((mostRecentAnnualEPS - previousAnnualEPS) / Math.abs(previousAnnualEPS)) * 100;
                  }

                  // Calculate TTM growth against previous year
                  return ((currentEPS - previousAnnualEPS) / Math.abs(previousAnnualEPS)) * 100;
                }
                if (metric.id === "ebitdaGrowth") {
                  // Handle TTM EBITDA growth similar to other growth metrics
                  const currentEBITDA = parseFloat(String(current.ebitda).replace(/[^0-9.-]+/g, ""));
                  const mostRecentAnnualEBITDA = parseFloat(String(annualData[0].ebitda).replace(/[^0-9.-]+/g, ""));
                  const previousAnnualEBITDA = parseFloat(String(annualData[1].ebitda).replace(/[^0-9.-]+/g, ""));

                  // Check if TTM matches most recent fiscal year (within 0.1% tolerance)
                  const ebitdaDiff = Math.abs(currentEBITDA - mostRecentAnnualEBITDA);
                  const tolerance = mostRecentAnnualEBITDA * 0.001; // 0.1% tolerance

                  if (ebitdaDiff <= tolerance) {
                    // Use fiscal year growth rate
                    return ((mostRecentAnnualEBITDA - previousAnnualEBITDA) / Math.abs(previousAnnualEBITDA)) * 100;
                  }

                  // Calculate TTM growth against previous year
                  return ((currentEBITDA - previousAnnualEBITDA) / Math.abs(previousAnnualEBITDA)) * 100;
                }
              }
              
              return calculateMetricValue(metric, current, previous);
            });

            return (
              <IncomeStatementMetrics
                key={metric.id}
                metricId={metric.id}
                label={getMetricDisplayName(metric.id)}
                values={values.map(v => parseNumber(v))}
                isSelected={selectedMetrics.includes(metric.id)}
                onToggle={onMetricToggle}
                formatValue={formatValue}
                isGrowthMetric={metric.format === 'percentage'}
              />
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};