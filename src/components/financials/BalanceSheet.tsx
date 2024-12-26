import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BalanceSheetProps {
  timeFrame: "annual" | "quarterly" | "ttm";
}

export const BalanceSheet = ({ timeFrame }: BalanceSheetProps) => {
  const data = {
    annual: [
      { year: "2023", totalAssets: "110,716", totalLiabilities: "42,781", totalEquity: "67,935" },
      { year: "2022", totalAssets: "44,187", totalLiabilities: "15,892", totalEquity: "28,295" },
      { year: "2021", totalAssets: "44,187", totalLiabilities: "15,892", totalEquity: "28,295" },
      { year: "2020", totalAssets: "28,791", totalLiabilities: "10,418", totalEquity: "18,373" },
      { year: "2019", totalAssets: "17,315", totalLiabilities: "6,232", totalEquity: "11,083" }
    ],
    quarterly: [
      { year: "Q4 2023", totalAssets: "110,716", totalLiabilities: "42,781", totalEquity: "67,935" },
      { year: "Q3 2023", totalAssets: "102,483", totalLiabilities: "39,876", totalEquity: "62,607" },
      { year: "Q2 2023", totalAssets: "92,154", totalLiabilities: "35,891", totalEquity: "56,263" }
    ],
    ttm: [
      { year: "TTM", totalAssets: "110,716", totalLiabilities: "42,781", totalEquity: "67,935" }
    ],
  };

  const currentData = data[timeFrame];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Period</TableHead>
          <TableHead>Total Assets</TableHead>
          <TableHead>Total Liabilities</TableHead>
          <TableHead>Total Equity</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentData.map((row) => (
          <TableRow key={row.year}>
            <TableCell className="font-medium">{row.year}</TableCell>
            <TableCell>${row.totalAssets}</TableCell>
            <TableCell>${row.totalLiabilities}</TableCell>
            <TableCell>${row.totalEquity}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};