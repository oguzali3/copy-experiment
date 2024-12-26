import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface CashFlowProps {
  timeFrame: "annual" | "quarterly" | "ttm";
}

export const CashFlow = ({ timeFrame }: CashFlowProps) => {
  const data = {
    annual: [
      { year: "2023", operatingCashFlow: "27,021", investingCashFlow: "-15,783", financingCashFlow: "-8,762", freeCashFlow: "27,021" },
      { year: "2022", operatingCashFlow: "3,808", investingCashFlow: "-7,225", financingCashFlow: "-10,413", freeCashFlow: "3,808" },
      { year: "2021", operatingCashFlow: "8,132", investingCashFlow: "-4,485", financingCashFlow: "-3,128", freeCashFlow: "8,132" },
    ],
    quarterly: [
      { year: "Q4 2023", operatingCashFlow: "8,761", investingCashFlow: "-5,234", financingCashFlow: "-2,987", freeCashFlow: "8,761" },
      { year: "Q3 2023", operatingCashFlow: "7,892", investingCashFlow: "-4,567", financingCashFlow: "-2,345", freeCashFlow: "7,892" },
      { year: "Q2 2023", operatingCashFlow: "6,234", investingCashFlow: "-3,876", financingCashFlow: "-1,987", freeCashFlow: "6,234" },
    ],
    ttm: [
      { year: "TTM", operatingCashFlow: "56,546", investingCashFlow: "-32,456", financingCashFlow: "-18,234", freeCashFlow: "56,546" },
    ],
  };

  const currentData = data[timeFrame];

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[150px]">Period</TableHead>
          <TableHead>Operating Cash Flow</TableHead>
          <TableHead>Investing Cash Flow</TableHead>
          <TableHead>Financing Cash Flow</TableHead>
          <TableHead>Free Cash Flow</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {currentData.map((row) => (
          <TableRow key={row.year}>
            <TableCell className="font-medium">{row.year}</TableCell>
            <TableCell>${row.operatingCashFlow}</TableCell>
            <TableCell>${row.investingCashFlow}</TableCell>
            <TableCell>${row.financingCashFlow}</TableCell>
            <TableCell>${row.freeCashFlow}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};