import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface EstimatesTableProps {
  data: any[];
  selectedMetric: string;
  formatValue: (value: number) => string;
}

export const EstimatesTable = ({ data, selectedMetric, formatValue }: EstimatesTableProps) => {
  // Filter and sort data to show only last 2 years actual and next 2 years estimates
  const relevantData = data
    .filter(item => {
      const year = parseInt(item.period.split('-')[0]);
      const currentYear = new Date().getFullYear();
      return year >= currentYear - 2 && year <= currentYear + 2;
    })
    .sort((a, b) => a.period.localeCompare(b.period));

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead className="text-right">Actual</TableHead>
            <TableHead className="text-right">Consensus</TableHead>
            <TableHead className="text-right">High</TableHead>
            <TableHead className="text-right">Low</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {relevantData.map((estimate) => (
            <TableRow key={estimate.period}>
              <TableCell>{estimate.period}</TableCell>
              <TableCell className="text-right">
                {formatValue(estimate[selectedMetric].actual || 0)}
              </TableCell>
              <TableCell className="text-right">
                {formatValue(estimate[selectedMetric].mean || 0)}
              </TableCell>
              <TableCell className="text-right">
                {formatValue(estimate[selectedMetric].high || 0)}
              </TableCell>
              <TableCell className="text-right">
                {formatValue(estimate[selectedMetric].low || 0)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};