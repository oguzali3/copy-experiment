import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EstimatesTableProps {
  metric: string;
}

// Mock data structure
const estimatesData = {
  revenue: [
    {
      period: "Jun '23 (A)",
      mean: 211207.09,
      median: 211177,
      actual: 211915,
      high: 213888,
      low: 207787,
      stdDev: 786.23,
      estimates: 47,
    },
    {
      period: "Jun '24 (A)",
      mean: 245008.1,
      median: 244778.5,
      actual: 245122,
      high: 248470,
      low: 244395,
      stdDev: 722.97,
      estimates: 52,
    },
    {
      period: "Jun '25 (E)",
      mean: 278643.7,
      median: 278485,
      actual: null,
      high: 285100,
      low: 275319,
      stdDev: 1925.93,
      estimates: 51,
    },
  ],
  eps: [
    {
      period: "Jun '23 (A)",
      mean: 2.11,
      median: 2.10,
      actual: 2.12,
      high: 2.15,
      low: 2.08,
      stdDev: 0.02,
      estimates: 45,
    },
    {
      period: "Jun '24 (A)",
      mean: 2.45,
      median: 2.44,
      actual: 2.45,
      high: 2.48,
      low: 2.44,
      stdDev: 0.01,
      estimates: 50,
    },
    {
      period: "Jun '25 (E)",
      mean: 2.78,
      median: 2.78,
      actual: null,
      high: 2.85,
      low: 2.75,
      stdDev: 0.03,
      estimates: 48,
    },
  ],
  // Add more metrics as needed
};

const formatValue = (value: number | null) => {
  if (value === null) return "-";
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const EstimatesTable = ({ metric }: EstimatesTableProps) => {
  const data = estimatesData[metric as keyof typeof estimatesData] || [];

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Mean</TableHead>
            <TableHead className="text-right">Median</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            <TableHead className="text-right">High</TableHead>
            <TableHead className="text-right">Low</TableHead>
            <TableHead className="text-right">Std Dev</TableHead>
            <TableHead className="text-right"># of Estimates</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.period}>
              <TableCell className="font-medium">{row.period}</TableCell>
              <TableCell className="text-right">{formatValue(row.mean)}</TableCell>
              <TableCell className="text-right">{formatValue(row.median)}</TableCell>
              <TableCell className="text-right">{formatValue(row.actual)}</TableCell>
              <TableCell className="text-right">{formatValue(row.high)}</TableCell>
              <TableCell className="text-right">{formatValue(row.low)}</TableCell>
              <TableCell className="text-right">{formatValue(row.stdDev)}</TableCell>
              <TableCell className="text-right">{row.estimates}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};