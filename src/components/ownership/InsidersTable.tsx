import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InsidersTableProps {
  ticker?: string;
}

// Mock data - in a real app, this would come from an API
const insidersData = {
  AAPL: [
    {
      name: "Tim Cook",
      title: "Chief Executive Officer",
      date: "2024-02-15",
      shares: "859,614",
      percentOwned: "0.01156",
      marketValue: "$365.51M"
    },
    {
      name: "Luca Maestri",
      title: "Chief Financial Officer",
      date: "2024-02-10",
      shares: "458,321",
      percentOwned: "0.00416",
      marketValue: "$194.88M"
    },
    // Add more mock data as needed
  ],
  MSFT: [
    {
      name: "Satya Nadella",
      title: "Chief Executive Officer",
      date: "2024-02-15",
      shares: "859,614",
      percentOwned: "0.01156",
      marketValue: "$365.51M"
    },
    // Add more mock data as needed
  ]
};

export const InsidersTable = ({ ticker = "AAPL" }: InsidersTableProps) => {
  const insiders = insidersData[ticker as keyof typeof insidersData] || [];

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[25%]">Insider</TableHead>
            <TableHead className="w-[25%]">Title</TableHead>
            <TableHead className="w-[15%]">Date</TableHead>
            <TableHead className="w-[10%] text-right">Shares</TableHead>
            <TableHead className="w-[10%] text-right">% Owned</TableHead>
            <TableHead className="w-[15%] text-right">Market Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {insiders.map((insider, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{insider.name}</TableCell>
              <TableCell>{insider.title}</TableCell>
              <TableCell>{insider.date}</TableCell>
              <TableCell className="text-right">{insider.shares}</TableCell>
              <TableCell className="text-right">{insider.percentOwned}%</TableCell>
              <TableCell className="text-right">{insider.marketValue}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};