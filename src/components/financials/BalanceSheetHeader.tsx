import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface BalanceSheetHeaderProps {
  filteredData: any[];
}

export const BalanceSheetHeader = ({ filteredData }: BalanceSheetHeaderProps) => {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px] sticky left-0 z-20 bg-white"></TableHead>
        <TableHead className="w-[250px] sticky left-[50px] z-20 bg-gray-50 font-semibold">
          Metrics
        </TableHead>
        {filteredData.map((row: any) => (
          <TableHead key={row.date} className="text-right min-w-[120px]">
            {row.period === 'TTM' ? 'TTM' : new Date(row.date).getFullYear().toString()}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
};