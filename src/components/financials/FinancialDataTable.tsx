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
              
              if (current.period === "TTM" && metric.id === "revenueGrowth") {
                return calculateTTMGrowth(current, annualData);
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