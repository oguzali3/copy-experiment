import { TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { formatValue, getMetricFormat } from "@/utils/metricDefinitions";

interface IncomeStatementMetricsProps {
  metricId: string;
  label: string;
  values: number[];
  isSelected: boolean;
  onToggle: (metricId: string) => void;
  isGrowthMetric?: boolean;
}

export const IncomeStatementMetrics = ({
  metricId,
  label,
  values,
  isSelected,
  onToggle,
  isGrowthMetric
}: IncomeStatementMetricsProps) => {
  const format = getMetricFormat(metricId);

  return (
    <TableRow>
      <TableCell className="w-[50px] pr-0">
        <Checkbox
          id={`checkbox-${metricId}`}
          checked={isSelected}
          onCheckedChange={() => onToggle(metricId)}
        />
      </TableCell>
      <TableCell className="font-medium bg-gray-50">
        {label}
      </TableCell>
      {values.map((value, index) => (
        <TableCell key={index} className="text-right">
          {formatValue(value, format)}
        </TableCell>
      ))}
    </TableRow>
  );
};