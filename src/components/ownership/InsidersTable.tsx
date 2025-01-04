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

interface InsidersTableProps {
  ticker?: string;
}

interface InsiderData {
  typeOfOwner: string;
  transactionDate: string;
  owner: string;
}

export const InsidersTable = ({ ticker = "AAPL" }: InsidersTableProps) => {
  const { data: insiders, isLoading, error } = useQuery({
    queryKey: ['insider-roster', ticker],
    queryFn: async () => {
      console.log('Fetching insider roster for:', ticker);
      const { data, error } = await supabase.functions.invoke('fetch-financial-data', {
        body: { endpoint: 'insider-roster', symbol: ticker }
      });
      
      if (error) {
        console.error('Error fetching insider roster:', error);
        throw error;
      }
      
      console.log('Insider roster data received:', data);
      return data as InsiderData[];
    },
    enabled: !!ticker
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="p-6">
          <p className="text-center text-gray-500">Loading insider data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="p-6">
          <p className="text-center text-red-500">Error loading insider data</p>
        </div>
      </div>
    );
  }

  if (!insiders || insiders.length === 0) {
    return (
      <div className="rounded-lg border bg-white">
        <div className="p-6">
          <p className="text-center text-gray-500">No insider data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Owner</TableHead>
            <TableHead className="w-[40%]">Position</TableHead>
            <TableHead className="w-[20%]">Last Transaction</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insiders.map((insider, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{insider.owner}</TableCell>
              <TableCell>{insider.typeOfOwner}</TableCell>
              <TableCell>{new Date(insider.transactionDate).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};