import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MetricDefinition } from "@/utils/metricDefinitions";

interface IncomeStatementHeaderProps {
  metrics: MetricDefinition[];
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export const IncomeStatementHeader = ({ 
  metrics,
  selectedMetrics,
  onMetricsChange
}: IncomeStatementHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]"></TableHead>
        <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
        {selectedMetrics.map((period) => (
          <TableHead key={period} className="text-right min-w-[120px]">
            {period}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};