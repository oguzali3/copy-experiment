import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface IncomeStatementHeaderProps {
  periods: string[];
}

export const IncomeStatementHeader = ({ periods }: IncomeStatementHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px]"></TableHead>
        <TableHead className="w-[250px] bg-gray-50 font-semibold">Metrics</TableHead>
        {periods.map((period) => (
          <TableHead key={period} className="text-right min-w-[120px]">
            {period}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};