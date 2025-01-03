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

  console.log('Filtered data for table:', relevantData);

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
          {relevantData.map((estimate) => {
            const metricData = estimate[selectedMetric];
            console.log(`Data for period ${estimate.period}:`, metricData);
            
            return (
              <TableRow key={estimate.period}>
                <TableCell>{estimate.period}</TableCell>
                <TableCell className="text-right">
                  {metricData.actual !== null ? formatValue(metricData.actual) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {metricData.mean !== null ? formatValue(metricData.mean) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {metricData.high !== null ? formatValue(metricData.high) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {metricData.low !== null ? formatValue(metricData.low) : 'N/A'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};