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
      { year: "2020", operatingCashFlow: "4,694", investingCashFlow: "-3,892", financingCashFlow: "-2,654", freeCashFlow: "4,694" },
      { year: "2019", operatingCashFlow: "4,272", investingCashFlow: "-2,987", financingCashFlow: "-1,876", freeCashFlow: "4,272" }
    ],
    quarterly: [
      { year: "Q4 2023", operatingCashFlow: "8,761", investingCashFlow: "-5,234", financingCashFlow: "-2,987", freeCashFlow: "8,761" },
      { year: "Q3 2023", operatingCashFlow: "7,892", investingCashFlow: "-4,567", financingCashFlow: "-2,345", freeCashFlow: "7,892" },
      { year: "Q2 2023", operatingCashFlow: "6,234", investingCashFlow: "-3,876", financingCashFlow: "-1,987", freeCashFlow: "6,234" }
    ],
    ttm: [
      { year: "TTM", operatingCashFlow: "56,546", investingCashFlow: "-32,456", financingCashFlow: "-18,234", freeCashFlow: "56,546" }
    ],
  };

  const currentData = data[timeFrame];

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
            {currentData.map((row) => (
              <TableHead key={row.year} className="text-right min-w-[120px]">{row.year}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Operating Cash Flow</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-operating`} className="text-right">${row.operatingCashFlow}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Investing Cash Flow</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-investing`} className="text-right">${row.investingCashFlow}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Financing Cash Flow</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-financing`} className="text-right">${row.financingCashFlow}</TableCell>
            ))}
          </TableRow>
          <TableRow>
            <TableCell className="font-medium bg-gray-50">Free Cash Flow</TableCell>
            {currentData.map((row) => (
              <TableCell key={`${row.year}-free`} className="text-right">${row.freeCashFlow}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
};