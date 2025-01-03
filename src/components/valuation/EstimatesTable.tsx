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
  const currentYear = new Date().getFullYear();
  const relevantData = data
    .filter(item => {
      const year = parseInt(item.date.split('-')[0]);
      return year >= currentYear - 2 && year <= currentYear + 2;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  console.log('Filtered data for table:', relevantData);

  const getMetricValue = (item: any) => {
    switch (selectedMetric) {
      case 'revenue':
        return {
          actual: item.revenueEstimatedActual,
          consensus: item.revenueEstimated,
          high: item.revenueEstimatedHighEstimate,
          low: item.revenueEstimatedLowEstimate
        };
      case 'eps':
        return {
          actual: item.epsActual,
          consensus: item.epsEstimated,
          high: item.epsHighEstimate,
          low: item.epsLowEstimate
        };
      case 'ebitda':
        return {
          actual: item.ebitdaActual,
          consensus: item.ebitdaEstimated,
          high: item.ebitdaHighEstimate,
          low: item.ebitdaLowEstimate
        };
      case 'netIncome':
        return {
          actual: item.netIncomeActual,
          consensus: item.netIncomeEstimated,
          high: item.netIncomeHighEstimate,
          low: item.netIncomeLowEstimate
        };
      default:
        return { actual: null, consensus: null, high: null, low: null };
    }
  };

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
            const values = getMetricValue(estimate);
            return (
              <TableRow key={estimate.date}>
                <TableCell>{estimate.date}</TableCell>
                <TableCell className="text-right">
                  {values.actual ? formatValue(values.actual) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {values.consensus ? formatValue(values.consensus) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {values.high ? formatValue(values.high) : 'N/A'}
                </TableCell>
                <TableCell className="text-right">
                  {values.low ? formatValue(values.low) : 'N/A'}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};