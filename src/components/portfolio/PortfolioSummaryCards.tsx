import { ArrowUpIcon, ArrowDownIcon, DollarSign, PieChart, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Stock } from "./types";

interface PortfolioSummaryCardsProps {
  totalValue: number;
  dayChange: number;  // Daily change in dollars
  dayChangePercent: number;  // Daily change in percentage
  stocks: Stock[];
}

export const PortfolioSummaryCards = ({ 
  totalValue,
  dayChange,
  dayChangePercent,
  stocks 
}: PortfolioSummaryCardsProps) => {
  // Ensure totalValue is a valid number
  const safeTotal = isNaN(totalValue) ? 0 : totalValue;
  
  // Calculate top 3 positions - with data validation
  const validStocks = stocks.filter(stock => 
    typeof stock.marketValue === 'number' && !isNaN(stock.marketValue)
  );
  
  const topPositions = [...validStocks]
    .sort((a, b) => b.marketValue - a.marketValue)
    .slice(0, 3);
  
  // Calculate sector weights (simplified - in a real app you'd have sector data per stock)
  // This is a placeholder implementation
  const sectorCount = {
    technology: 0,
    healthcare: 0,
    financial: 0,
    consumer: 0,
    other: 0
  };
  
  validStocks.forEach(stock => {
    // This is just for demonstration - you'd use actual sector data
    const firstLetter = stock.ticker.charAt(0).toLowerCase();
    if ('abcd'.includes(firstLetter)) sectorCount.technology += stock.marketValue;
    else if ('efgh'.includes(firstLetter)) sectorCount.healthcare += stock.marketValue;
    else if ('ijkl'.includes(firstLetter)) sectorCount.financial += stock.marketValue;
    else if ('mnop'.includes(firstLetter)) sectorCount.consumer += stock.marketValue;
    else sectorCount.other += stock.marketValue;
  });
  
  
  // Format currency
  const formatCurrency = (value: number) => {
    if (value === undefined || isNaN(value)) {
      return "$0.00";
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Value Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Value</p>
              <h3 className="text-2xl font-bold mt-1">{formatCurrency(safeTotal)}</h3>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Day Change Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Change</p>
              <div className="flex items-center mt-1">
                <h3 className={`text-2xl font-bold ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(Math.abs(dayChange))}
                </h3>
                <span className={`ml-2 flex items-center ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {dayChange >= 0 ? (
                    <ArrowUpIcon className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 mr-1" />
                  )}
                  {isNaN(dayChangePercent) ? '0.00' : Math.abs(dayChangePercent).toFixed(2)}%
                </span>
              </div>
            </div>
            <div className={`h-12 w-12 rounded-full ${dayChange >= 0 ? 'bg-green-100' : 'bg-red-100'} flex items-center justify-center`}>
              <TrendingUp className={`h-6 w-6 ${dayChange >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
          </div>
        </CardContent>
      </Card>
      
      
      
    </div>
  );
};