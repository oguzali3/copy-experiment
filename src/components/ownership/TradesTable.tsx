import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TradesTableProps {
  ticker?: string;
}

// Mock data - in a real app, this would come from an API
const tradesData = {
  AAPL: [
    {
      insider: "Alice L. Jolla",
      title: "Corporate VP & Chief Accounting Officer",
      type: "Sale to Issuer",
      sharesTraded: "-617.4",
      percentTraded: "-0.000008",
      percentChange: "-0.87",
      endShares: "70.59K",
      price: "$447.27",
      value: "$276.15K",
      filingDate: "2024-12-16",
      transactionDate: "2024-12-16"
    },
    // Add more mock data as needed
  ],
  MSFT: [
    {
      insider: "Bradford L. Smith",
      title: "Vice Chair and President",
      type: "Sale",
      sharesTraded: "-1,235",
      percentTraded: "-0.00015",
      percentChange: "-1.23",
      endShares: "98.45K",
      price: "$389.45",
      value: "$481.12K",
      filingDate: "2024-12-15",
      transactionDate: "2024-12-15"
    },
    {
      insider: "Judson Althoff",
      title: "EVP & Chief Commercial Officer",
      type: "Purchase",
      sharesTraded: "+850",
      percentTraded: "+0.00012",
      percentChange: "+0.95",
      endShares: "89.72K",
      price: "$392.18",
      value: "$333.35K",
      filingDate: "2024-12-14",
      transactionDate: "2024-12-14"
    }
  ]
};

export const TradesTable = ({ ticker = "AAPL" }: TradesTableProps) => {
  const trades = tradesData[ticker as keyof typeof tradesData] || [];

  return (
    <div className="rounded-lg border bg-white">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[15%]">Insider</TableHead>
            <TableHead className="w-[15%]">Title</TableHead>
            <TableHead className="w-[10%]">Type</TableHead>
            <TableHead className="w-[8%] text-right">Shares Traded</TableHead>
            <TableHead className="w-[8%] text-right">% of Shares</TableHead>
            <TableHead className="w-[8%] text-right">% Chg. in Shares</TableHead>
            <TableHead className="w-[8%] text-right">End Shares</TableHead>
            <TableHead className="w-[8%] text-right">Price</TableHead>
            <TableHead className="w-[8%] text-right">Value</TableHead>
            <TableHead className="w-[6%]">Filing Date</TableHead>
            <TableHead className="w-[6%]">Transaction Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{trade.insider}</TableCell>
              <TableCell>{trade.title}</TableCell>
              <TableCell>{trade.type}</TableCell>
              <TableCell className="text-right">{trade.sharesTraded}</TableCell>
              <TableCell className="text-right">{trade.percentTraded}%</TableCell>
              <TableCell className="text-right">{trade.percentChange}%</TableCell>
              <TableCell className="text-right">{trade.endShares}</TableCell>
              <TableCell className="text-right">{trade.price}</TableCell>
              <TableCell className="text-right">{trade.value}</TableCell>
              <TableCell>{trade.filingDate}</TableCell>
              <TableCell>{trade.transactionDate}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};