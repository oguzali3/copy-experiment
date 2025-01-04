import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface HoldersTableProps {
  ticker?: string;
}

interface InstitutionalHolder {
  investorName: string;
  date: string;
  ownership: number;
  sharesNumber: number;
  marketValue: number;
  changeInSharesNumber: number;
  changeInSharesNumberPercentage: number;
  holdingPeriod: number;
}

export const HoldersTable = ({ ticker = "AAPL" }: HoldersTableProps) => {
  const { data: holders, isLoading, error } = useQuery({
    queryKey: ['institutional-holders', ticker],
    queryFn: async () => {
      console.log('Fetching institutional holders for:', ticker);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'institutional-holders', symbol: ticker }
      });

      if (error) {
        console.error('Error fetching institutional holders:', error);
        throw error;
      }
      console.log('Institutional holders data received:', data);
      return data;
    },
    enabled: !!ticker
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-gray-500">Loading institutional holders data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-48">
        <p className="text-red-500">Error loading institutional holders data</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Institution</TableHead>
            <TableHead className="w-[12%]">Date</TableHead>
            <TableHead className="w-[10%] text-right">% Owned</TableHead>
            <TableHead className="w-[13%] text-right">Market Value</TableHead>
            <TableHead className="w-[10%] text-right">Shares</TableHead>
            <TableHead className="w-[10%] text-right">Chg. Shares</TableHead>
            <TableHead className="w-[10%] text-right">Chg. Shares %</TableHead>
            <TableHead className="w-[10%] text-right">Holding Period</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {holders?.map((holder: InstitutionalHolder, index: number) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{holder.investorName}</TableCell>
              <TableCell>{new Date(holder.date).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">{holder.ownership.toFixed(2)}%</TableCell>
              <TableCell className="text-right">${(holder.marketValue / 1e9).toFixed(2)}B</TableCell>
              <TableCell className="text-right">{(holder.sharesNumber / 1e6).toFixed(2)}M</TableCell>
              <TableCell className="text-right">{(holder.changeInSharesNumber / 1e6).toFixed(2)}M</TableCell>
              <TableCell className="text-right">
                <div className={`flex items-center justify-end ${holder.changeInSharesNumberPercentage > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {holder.changeInSharesNumberPercentage > 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {Math.abs(holder.changeInSharesNumberPercentage).toFixed(2)}%
                </div>
              </TableCell>
              <TableCell className="text-right">{holder.holdingPeriod} quarters</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};