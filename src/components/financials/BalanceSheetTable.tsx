import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatValue, parseNumber, metrics } from "./BalanceSheetUtils";
import { formatPeriod } from "@/utils/formatPeriod";

interface BalanceSheetTableProps {
  filteredData: any[];
  selectedMetrics: string[];
  onMetricsChange: (metrics: string[]) => void;
  timeFrame: "annual" | "quarterly" | "ttm";
}

export const BalanceSheetTable = ({ 
  filteredData, 
  selectedMetrics, 
  onMetricsChange,
  timeFrame
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
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] sticky left-0 z-20 bg-white"></TableHead>
                <TableHead className="w-[250px] sticky left-[50px] z-20 bg-gray-50 font-semibold">Metrics</TableHead>
                {filteredData.map((row, index) => {
                  const { quarter, date } = formatPeriod(row.date, row.period, timeFrame);
                  // Ensure the header key is unique by combining multiple values
                  return (
                    <TableHead 
                      key={`header-${index}-${row.date || ''}-${row.period || ''}`} 
                      className="text-right min-w-[120px]"
                    >
                      <div>{quarter}</div>
                      {date && <div className="text-xs text-gray-500">{date}</div>}
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric, metricIndex) => (
                <TableRow key={`metric-row-${metric.id}-${metricIndex}`}>
                  <TableCell className="w-[50px] sticky left-0 z-20 bg-white pr-0">
                    <Checkbox
                      id={`checkbox-${metric.id}-${metricIndex}`}
                      checked={selectedMetrics.includes(metric.id)}
                      onCheckedChange={() => handleMetricToggle(metric.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium sticky left-[50px] z-20 bg-gray-50">
                    {metric.label}
                  </TableCell>
                  {filteredData.map((row: any, rowIndex: number) => {
                    // Create a unique key combining multiple identifiers
                    const cellKey = `cell-${metric.id}-${rowIndex}-${row.date || ''}-${row.period || ''}`;
                    
                    return (
                      <TableCell 
                        key={cellKey} 
                        className="text-right"
                      >
                        {metric.type === "calculated" 
                          ? formatValue(metric.calculate(row))
                          : formatValue(parseNumber(row[metric.id]))}
                      </TableCell>
                    );
                  })}
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