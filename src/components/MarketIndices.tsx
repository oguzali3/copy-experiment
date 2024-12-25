import { Card } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const indices = [
  { name: "S&P 500", value: "4,783.45", change: "+1.23%", isPositive: true },
  { name: "NASDAQ", value: "15,123.45", change: "+1.85%", isPositive: true },
  { name: "Russell 2000", value: "1,989.78", change: "-0.45%", isPositive: false },
  { name: "Nikkei 225", value: "33,452.89", change: "+0.78%", isPositive: true },
  { name: "FTSE 100", value: "7,512.34", change: "-0.32%", isPositive: false },
  { name: "DAX", value: "16,752.23", change: "+0.91%", isPositive: true },
];

export const MarketIndices = () => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#111827]">Market Indices</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {indices.map((index) => (
          <Card key={index.name} className="p-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-[#111827]">{index.name}</h3>
                <p className="text-2xl font-bold mt-1">{index.value}</p>
              </div>
              <div className={`flex items-center ${index.isPositive ? 'text-success' : 'text-warning'}`}>
                {index.isPositive ? (
                  <ArrowUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                )}
                <span className="font-medium">{index.change}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};