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
  if (!Array.isArray(data)) {
    console.log('Data is not an array:', data);
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-center text-gray-500">No data available</p>
      </div>
    );
  }

  // Filter and sort data to show only last 2 years actual and next 2 years estimates
  const currentYear = new Date().getFullYear();
  const relevantData = data
    .filter(item => {
      if (!item?.date) {
        console.log('Item missing date:', item);
        return false;
      }
      try {
        const year = parseInt(item.date.split('-')[0]);
        return year >= currentYear - 2 && year <= currentYear + 2;
      } catch (error) {
        console.error('Error parsing date:', error);
        return false;
      }
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  console.log('Filtered data for table:', relevantData);

  const getMetricValue = (item: any) => {
    if (!item) return { actual: null, consensus: null, high: null, low: null };
    
    switch (selectedMetric) {
      case 'revenue':
        return {
          actual: item.estimatedRevenueAvg,
          consensus: item.estimatedRevenueAvg,
          high: item.estimatedRevenueHigh,
          low: item.estimatedRevenueLow
        };
      case 'eps':
        return {
          actual: item.estimatedEpsAvg,
          consensus: item.estimatedEpsAvg,
          high: item.estimatedEpsHigh,
          low: item.estimatedEpsLow
        };
      case 'ebitda':
        return {
          actual: item.estimatedEbitdaAvg,
          consensus: item.estimatedEbitdaAvg,
          high: item.estimatedEbitdaHigh,
          low: item.estimatedEbitdaLow
        };
      case 'netIncome':
        return {
          actual: item.estimatedNetIncomeAvg,
          consensus: item.estimatedNetIncomeAvg,
          high: item.estimatedNetIncomeHigh,
          low: item.estimatedNetIncomeLow
        };
      default:
        return { actual: null, consensus: null, high: null, low: null };
    }
  };

  if (relevantData.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-center text-gray-500">No data available for the selected time period</p>
      </div>
    );
  }

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