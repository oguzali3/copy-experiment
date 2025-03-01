import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Stock } from './types';

interface PortfolioAllocationChartProps {
  stocks: Stock[];
}

interface ChartDataItem {
  name: string;
  value: number;
  fullName: string;
  amount: number;
}

const COLORS = [
  '#2563eb', // Blue
  '#f97316', // Orange
  '#7c3aed', // Purple
  '#10b981', // Green
  '#ef4444', // Red
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#14b8a6', // Teal
];

export const PortfolioAllocationChart = ({ stocks }: PortfolioAllocationChartProps) => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [fallbackToTable, setFallbackToTable] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    
    try {
      // Debug log the incoming stocks
      console.log('Raw portfolio stocks:', stocks);
      
      // Convert string values to numbers and filter out invalid stocks
      const validStocks = stocks
        .map(stock => ({
          ...stock,
          marketValue: typeof stock.marketValue === 'string' ? parseFloat(stock.marketValue) : stock.marketValue,
          percentOfPortfolio: typeof stock.percentOfPortfolio === 'string' ? parseFloat(stock.percentOfPortfolio) : stock.percentOfPortfolio
        }))
        .filter(stock => {
          const marketValue = typeof stock.marketValue === 'number' ? stock.marketValue : 0;
          return !isNaN(marketValue) && marketValue > 0;
        });
      
      console.log('Processed valid stocks:', validStocks);
      
      // Calculate total portfolio value
      const totalValue = validStocks.reduce((sum, stock) => {
        const marketValue = typeof stock.marketValue === 'number' ? stock.marketValue : 0;
        return sum + marketValue;
      }, 0);
      
      console.log('Total portfolio value:', totalValue);
      
      // Prepare chart data
      const data: ChartDataItem[] = [];
      
      // Single stock case - set to 100%
      if (validStocks.length === 1) {
        const stock = validStocks[0];
        data.push({
          name: stock.ticker,
          value: 100,
          fullName: stock.name,
          amount: typeof stock.marketValue === 'number' ? stock.marketValue : 0
        });
      }
      // Multiple stocks case - calculate percentages
      else if (totalValue > 0) {
        validStocks.forEach(stock => {
          const marketValue = typeof stock.marketValue === 'number' ? stock.marketValue : 0;
          const percentage = (marketValue / totalValue) * 100;
          
          if (!isNaN(percentage) && isFinite(percentage)) {
            data.push({
              name: stock.ticker,
              value: percentage,
              fullName: stock.name,
              amount: marketValue
            });
          }
        });
      }
      
      console.log('Prepared chart data:', data);
      setChartData(data);
      setFallbackToTable(false);
    } catch (error) {
      console.error('Error preparing chart data:', error);
      setFallbackToTable(true);
    }
  }, [stocks]);

  // If there are no valid stocks with positive market value, show an empty state
  if (chartData.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p>No allocation data to display</p>
          <p className="text-sm">Add positions with shares and prices to see allocation.</p>
        </div>
      </div>
    );
  }

  // If we encountered an error, fall back to a table view
  if (fallbackToTable) {
    return <AllocationTable stocks={stocks} />;
  }

  // Render the pie chart
  return (
    <div className="h-[300px] w-full">
      {hasMounted && (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${entry.name}-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip 
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: string, props: any) => {
                if (!props || !props.payload) return [value, name];
                
                const entry = props.payload;
                const formattedValue = typeof value === 'number' ? value.toFixed(2) : value;
                
                return [
                  `$${entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} (${formattedValue}%)`,
                  entry.fullName
                ];
              }}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                padding: '0.5rem'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

// Fallback table component in case the chart fails
const AllocationTable = ({ stocks }: PortfolioAllocationChartProps) => {
  // Convert string values to numbers and filter out invalid stocks
  const validStocks = stocks
    .map(stock => ({
      ...stock,
      marketValue: typeof stock.marketValue === 'string' ? parseFloat(stock.marketValue) : stock.marketValue,
      percentOfPortfolio: typeof stock.percentOfPortfolio === 'string' ? parseFloat(stock.percentOfPortfolio) : stock.percentOfPortfolio
    }))
    .filter(stock => {
      const marketValue = typeof stock.marketValue === 'number' ? stock.marketValue : 0;
      return !isNaN(marketValue) && marketValue > 0;
    });
  
  // Sort stocks by market value (descending)
  const sortedStocks = [...validStocks].sort((a, b) => {
    const marketValueA = typeof a.marketValue === 'number' ? a.marketValue : 0;
    const marketValueB = typeof b.marketValue === 'number' ? b.marketValue : 0;
    return marketValueB - marketValueA;
  });
  
  // Calculate total portfolio value
  const totalValue = sortedStocks.reduce((sum, stock) => {
    const marketValue = typeof stock.marketValue === 'number' ? stock.marketValue : 0;
    return sum + marketValue;
  }, 0);
  
  // Calculate percentages based on market values
  const stocksWithPercentages = sortedStocks.map(stock => {
    const marketValue = typeof stock.marketValue === 'number' ? stock.marketValue : 0;
    const percentage = totalValue > 0 ? (marketValue / totalValue) * 100 : 0;
    
    return {
      ...stock,
      percentage: !isNaN(percentage) && isFinite(percentage) ? percentage : 0
    };
  });

  return (
    <div className="h-[300px] overflow-auto">
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left py-2">Stock</th>
            <th className="text-right py-2">Allocation</th>
            <th className="text-right py-2">Market Value</th>
          </tr>
        </thead>
        <tbody>
          {stocksWithPercentages.map((stock, index) => (
            <tr key={stock.ticker} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
              <td className="py-2">
                <div className="flex items-center">
                  <div 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    className="w-3 h-3 rounded-full mr-2"
                  ></div>
                  <div>
                    <div className="font-medium">{stock.ticker}</div>
                    <div className="text-xs text-gray-500">{stock.name}</div>
                  </div>
                </div>
              </td>
              <td className="text-right py-2">
                <div className="relative w-full bg-gray-200 h-4 rounded-full overflow-hidden">
                  <div 
                    style={{ 
                      width: `${Math.max(0, Math.min(100, stock.percentage))}%`,
                      backgroundColor: COLORS[index % COLORS.length]
                    }} 
                    className="absolute left-0 top-0 h-full"
                  ></div>
                </div>
                <span className="text-sm font-medium">{stock.percentage.toFixed(1)}%</span>
              </td>
              <td className="text-right py-2 font-medium">
                ${(typeof stock.marketValue === 'number' ? stock.marketValue : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t">
            <td className="py-2 font-bold">Total</td>
            <td className="text-right py-2 font-bold">100%</td>
            <td className="text-right py-2 font-bold">
              ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};