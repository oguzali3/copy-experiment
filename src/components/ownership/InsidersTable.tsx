import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

interface InsidersTableProps {
  ticker?: string;
}

interface InsiderTrade {
  symbol: string;
  filingDate: string;
  transactionDate: string;
  reportingName: string;
  typeOfOwner: string;
  transactionType: string;
  securitiesOwned: number;
  securitiesTransacted: number;
  price: number;
  acquistionOrDisposition: string;
}

export const InsidersTable = ({ ticker = "AAPL" }: InsidersTableProps) => {
  const { data: trades, isLoading, error } = useQuery({
    queryKey: ['insider-trades', ticker],
    queryFn: async () => {
      console.log('Fetching insider trades for:', ticker);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'insider-trades', symbol: ticker }
      });
      
      if (error) {
        console.error('Error fetching insider trades:', error);
        throw error;
      }
      
      console.log('Insider trades data received:', data);
      return data as InsiderTrade[];
    },
    enabled: !!ticker
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="p-6">
          <p className="text-center text-gray-500">Loading insider trades...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="p-6">
          <p className="text-center text-red-500">Error loading insider trades</p>
        </div>
      </div>
    );
  }

  if (!trades || trades.length === 0) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="p-6">
          <p className="text-center text-gray-500">No insider trades available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Insider</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Transaction Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Shares Traded</TableHead>
            <TableHead className="text-right">Price</TableHead>
            <TableHead className="text-right">Shares Owned</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{trade.reportingName}</TableCell>
              <TableCell>{trade.typeOfOwner}</TableCell>
              <TableCell>{new Date(trade.transactionDate).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {trade.acquistionOrDisposition === 'A' ? (
                    <ArrowUpIcon className="h-4 w-4 text-success" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-warning" />
                  )}
                  {trade.transactionType}
                </div>
              </TableCell>
              <TableCell className="text-right">{trade.securitiesTransacted.toLocaleString()}</TableCell>
              <TableCell className="text-right">${trade.price.toFixed(2)}</TableCell>
              <TableCell className="text-right">{trade.securitiesOwned.toLocaleString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};