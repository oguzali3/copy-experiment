import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { BalanceSheetHeader } from "./BalanceSheetHeader";
import { formatValue, parseNumber, metrics } from "./BalanceSheetUtils";

interface BalanceSheetTableProps {
  filteredData: any[];
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
}

export const BalanceSheetTable = ({ 
  filteredData, 
  selectedMetrics, 
  onMetricsChange 
}: BalanceSheetTableProps) => {
  const handleMetricToggle = (metricId: string) => {
    const newMetrics = selectedMetrics.includes(metricId)
      ? selectedMetrics.filter(id => id !== metricId)
      : [...selectedMetrics, metricId];
    onMetricsChange(newMetrics);
  };

  return (
    <div className="bg-white rounded-lg border">
      <ScrollArea className="w-full rounded-md">
        <div className="max-w-full overflow-auto">
          <Table>
            <BalanceSheetHeader filteredData={filteredData} />
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
                  {filteredData.map((row: any) => (
                    <TableCell key={`${row.date}-${metric.id}`} className="text-right">
                      {metric.type === "calculated" 
                        ? formatValue(metric.calculate(row))
                        : formatValue(parseNumber(row[metric.id]))}
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