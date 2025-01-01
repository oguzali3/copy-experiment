import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ValuationMetric } from "./types";

interface ValuationMetricsTableProps {
  metrics: ValuationMetric[];
  selectedMetrics: string[];
  handleMetricSelect: (metricName: string) => void;
}

export const ValuationMetricsTable = ({
  metrics,
  selectedMetrics,
  handleMetricSelect
}: ValuationMetricsTableProps) => {
  return (
    <div className="bg-white rounded-lg border">
      <ScrollArea className="w-full rounded-md">
        <div className="max-w-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px] sticky left-0 z-20 bg-white"></TableHead>
                <TableHead className="w-[250px] sticky left-[50px] z-20 bg-gray-50 font-semibold">Metrics</TableHead>
                {["2019", "2020", "2021", "2022", "2023", "2024"].map((year) => (
                  <TableHead key={year} className="text-right min-w-[120px]">{year}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {metrics.map((metric) => (
                <TableRow key={metric.name}>
                  <TableCell className="w-[50px] sticky left-0 z-20 bg-white pr-0">
                    <Checkbox
                      id={`checkbox-${metric.name}`}
                      checked={selectedMetrics.includes(metric.name)}
                      onCheckedChange={() => handleMetricSelect(metric.name)}
                    />
                  </TableCell>
                  <TableCell className="font-medium sticky left-[50px] z-20 bg-gray-50">{metric.name}</TableCell>
                  {["2019", "2020", "2021", "2022", "2023", "2024"].map((year) => (
                    <TableCell key={year} className="text-right">
                      {metric.historicalData[year]}
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