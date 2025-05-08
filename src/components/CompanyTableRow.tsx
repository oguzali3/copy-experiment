
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Area, AreaChart, ResponsiveContainer } from "recharts";

interface CompanyTableRowProps {
  company: {
    rank: number;
    name: string;
    ticker: string;
    marketCap: string;
    price: string;
    change: string;
    isPositive: boolean;
    logoUrl?: string;
    sparklineData?: Array<{ time: string, price: number }>;
  };
  index: number;
  onRemove: (ticker: string) => void;
}

export const CompanyTableRow = ({ company, index, onRemove }: CompanyTableRowProps) => {
  // Generate sparkline data with much more realistic patterns
  const sparkData = Array(50)
    .fill(0)
    .map((_, i) => {
      // Set base value (make it look like it's the actual stock price)
      const basePrice = parseFloat(company.price.replace(/[^0-9.]/g, '')) || 100;
      
      // More extreme volatility for zigzags
      const volatility = basePrice * 0.02; // 2% of base price for volatility
      
      // Make the line mostly flat with occasional movements
      // This creates the flat-line look with small movements seen in the screenshot
      
      // Determine pattern type (mostly flat with minor movements)
      const flatLine = basePrice + (Math.random() * 0.004 - 0.002) * basePrice;
      
      // Add a few key movement points (1-3 significant movements in the chart)
      const numKeyPoints = 3;
      const keyPointsPositions = Array(numKeyPoints).fill(0).map(() => Math.floor(Math.random() * 50));
      const isKeyPoint = keyPointsPositions.includes(i);
      
      // Create small movement for key points
      const keyPointMovement = isKeyPoint 
        ? (company.isPositive ? 1 : -1) * volatility * (0.5 + Math.random() * 0.5)
        : 0;
      
      // Add subtle noise throughout
      const noise = (Math.random() * 0.3 - 0.15) * volatility * 0.2;
      
      // For positive/negative trends, add slight slope
      const trendFactor = company.isPositive ? 0.01 : -0.01;
      const trendComponent = basePrice * trendFactor * i / 50;
      
      // Combine all factors
      let finalPrice = flatLine + keyPointMovement + noise + trendComponent;
      
      // If it's near the beginning or end, make sure it aligns with the trend
      if (i < 3 || i > 47) {
        finalPrice = basePrice + trendComponent + noise * 0.5;
      }
      
      return {
        time: `${i}:00`,
        price: finalPrice
      };
    });

  // Find min and max values for proper scaling
  const prices = sparkData.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice;
  
  // Create a normalized domain with some padding for better visualization
  const yDomain = [
    minPrice - (priceRange * 0.05), 
    maxPrice + (priceRange * 0.05)
  ];

  return (
    <tr className={cn(
      "border-b border-gray-100 dark:border-gray-800 text-xs", 
      index % 2 === 0 ? "bg-white dark:bg-[#2b2b35]" : "bg-gray-50 dark:bg-[#232328]"
    )}>
      <td className="pl-4 py-3">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-md flex items-center justify-center overflow-hidden mr-3 flex-shrink-0 bg-gray-100 dark:bg-transparent">
            {company.logoUrl ? (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="w-full h-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <span className="text-gray-600 dark:text-gray-400 font-semibold text-xs">
                {company.ticker.substring(0, 2)}
              </span>
            )}
          </div>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">{company.ticker}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">NasdaqGS:{company.ticker}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{company.name}</td>
      <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{company.marketCap}</td>
      <td className="px-4 py-3 text-right text-gray-900 dark:text-white font-medium">{company.price}</td>
      <td className="px-4 py-1 w-24">
        <div className="h-10">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={sparkData} 
              margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id={`colorPrice${company.ticker}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={company.isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0.2}/>
                  <stop offset="95%" stopColor={company.isPositive ? '#22c55e' : '#ef4444'} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke={company.isPositive ? '#22c55e' : '#ef4444'} 
                strokeWidth={1.5}
                fillOpacity={1}
                fill={`url(#colorPrice${company.ticker})`}
                isAnimationActive={false}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </td>
      <td className={`px-4 py-3 text-right font-medium ${company.isPositive ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'}`}>
        {company.change}
      </td>
      <td className="pr-4 py-3 text-right">
        <div className="flex items-center justify-end space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-gray-400 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onRemove(company.ticker)}
            className="h-6 w-6 text-gray-400 hover:text-red-600 dark:text-gray-500 dark:hover:text-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
};
