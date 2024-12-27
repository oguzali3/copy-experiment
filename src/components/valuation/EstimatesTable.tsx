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
  const metrics = [
    { key: "mean", label: "Mean" },
    { key: "median", label: "Median" },
    { key: "actual", label: "Actual" },
    { key: "high", label: "High" },
    { key: "low", label: "Low" },
    { key: "stdDev", label: "Std Dev" },
    { key: "estimates", label: "# of Estimates" },
  ];

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            {data.map((period) => (
              <TableHead key={period.period} className="text-right">
                {period.period}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {metrics.map((metricRow) => (
            <TableRow key={metricRow.key}>
              <TableCell className="font-medium">{metricRow.label}</TableCell>
              {data.map((period) => (
                <TableCell key={period.period} className="text-right">
                  {formatValue(period[metricRow.key as keyof typeof period] as number)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export { estimatesData };