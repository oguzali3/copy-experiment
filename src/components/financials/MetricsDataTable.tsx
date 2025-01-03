import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpIcon } from "lucide-react";

interface MetricsDataTableProps {
  data: any[];
  metrics: string[];
  ticker: string;
}

export const MetricsDataTable = ({ data, metrics, ticker }: MetricsDataTableProps) => {
  if (!data?.length || !metrics?.length) return null;

  // Format the value based on whether it's a currency or percentage
  const formatValue = (value: number) => {
    if (value > 1000000) {
      return `${(value / 1000000).toFixed(0)}M`;
    }
    return value.toFixed(2);
  };

  return (
    <div className="w-full overflow-x-auto border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-medium">Metric</TableHead>
            {data.map((item) => (
              <TableHead key={item.period} className="text-right font-medium">
                {item.period}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metric) => (
            <TableRow key={metric}>
              <TableCell className="font-medium">
                {ticker} - {metric}
              </TableCell>
              {data.map((item, index) => {
                const value = item[metric];
                const prevValue = data[index + 1]?.[metric];
                const isPositive = prevValue ? value > prevValue : false;

                return (
                  <TableCell key={item.period} className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {formatValue(value)}
                      {index === 0 && isPositive && (
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};