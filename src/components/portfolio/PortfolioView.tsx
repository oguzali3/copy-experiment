import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Portfolio } from "./PortfolioContent";
import { PieChart, LineChart, Plus, Settings, Trash2 } from "lucide-react";
import { PortfolioAllocationChart } from "./PortfolioAllocationChart";
import { PortfolioPerformanceChart } from "./PortfolioPerformanceChart";
import { PortfolioTable } from "./PortfolioTable";

interface PortfolioViewProps {
  portfolio: Portfolio;
  onAddPortfolio: () => void;
  onDeletePortfolio: (id: string) => void;
  onUpdatePortfolio: (portfolio: Portfolio) => void;
}

export const PortfolioView = ({
  portfolio,
  onAddPortfolio,
  onDeletePortfolio,
  onUpdatePortfolio,
}: PortfolioViewProps) => {
  const [timeframe, setTimeframe] = useState("5D");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{portfolio.name}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={onAddPortfolio}>
            <Plus className="mr-2 h-4 w-4" />
            New Portfolio
          </Button>
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button 
            variant="destructive"
            onClick={() => onDeletePortfolio(portfolio.id)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Portfolio Allocation</h2>
          </div>
          <PortfolioAllocationChart stocks={portfolio.stocks} />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="h-5 w-5 text-gray-500" />
            <h2 className="text-lg font-medium">Portfolio Performance</h2>
          </div>
          <div className="flex gap-2 mb-4">
            {["5D", "1M", "3M", "6M", "1Y", "5Y", "MAX"].map((period) => (
              <Button
                key={period}
                variant={timeframe === period ? "default" : "outline"}
                onClick={() => setTimeframe(period)}
                size="sm"
              >
                {period}
              </Button>
            ))}
          </div>
          <PortfolioPerformanceChart timeframe={timeframe} />
        </div>
      </div>

      <PortfolioTable stocks={portfolio.stocks} />
    </div>
  );
};