import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface IncomeStatementProps {
  timeFrame: "annual" | "quarterly" | "ttm";
}

export const IncomeStatement = ({ timeFrame }: IncomeStatementProps) => {
  const data = {
    annual: [
      { year: "2023", revenue: "60,922", grossProfit: "44,301", operatingIncome: "32,972", netIncome: "29,760" },
      { year: "2022", revenue: "26,974", grossProfit: "15,356", operatingIncome: "5,577", netIncome: "4,368" },
      { year: "2021", revenue: "26,914", grossProfit: "17,475", operatingIncome: "10,041", netIncome: "9,752" },
    ],
    quarterly: [
      { year: "Q4 2023", revenue: "22,103", grossProfit: "16,158", operatingIncome: "12,287", netIncome: "10,452" },
      { year: "Q3 2023", revenue: "18,120", grossProfit: "13,290", operatingIncome: "9,891", netIncome: "8,987" },
      { year: "Q2 2023", revenue: "13,507", grossProfit: "9,557", operatingIncome: "6,832", netIncome: "6,188" },
    ],
    ttm: [
      { year: "TTM", revenue: "113,269", grossProfit: "85,926", operatingIncome: "71,033", netIncome: "63,074" },
    ],
  };

  const currentData = data[timeFrame];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Period</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Gross Profit</TableHead>
          <TableHead>Operating Income</TableHead>
          <TableHead>Net Income</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentData.map((row) => (
          <TableRow key={row.year}>
            <TableCell className="font-medium">{row.year}</TableCell>
            <TableCell>${row.revenue}</TableCell>
            <TableCell>${row.grossProfit}</TableCell>
            <TableCell>${row.operatingIncome}</TableCell>
            <TableCell>${row.netIncome}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};