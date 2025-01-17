import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { formatValue, parseNumber, metrics } from "./BalanceSheetUtils";

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

  const formatPeriod = (date: string) => {
    const dateObj = new Date(date);
    if (timeFrame === 'quarterly') {
      const quarter = Math.floor((dateObj.getMonth() + 3) / 3);
      const year = dateObj.getFullYear();
      const monthDay = dateObj.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      return {
        quarter: `Q${quarter} ${year}`,
        date: monthDay
      };
    }
    return {
      quarter: dateObj.getFullYear().toString(),
      date: ''
    };
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
                  const { quarter, date } = formatPeriod(row.date);
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