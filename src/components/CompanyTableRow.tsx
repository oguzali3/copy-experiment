
import { ArrowUpIcon, ArrowDownIcon, XIcon } from "lucide-react";
import { Area, AreaChart, YAxis } from "recharts";
import { useState, useEffect } from "react";
import { fetchFinancialData } from "@/utils/financialApi";

interface CompanyTableRowProps {
  company: {
    name: string;
    ticker: string;
    marketCap: string;
    price: string;
    change: string;
    isPositive: boolean;
  };
  index: number;
  onRemove: (ticker: string) => void;
}

export const CompanyTableRow = ({ company, index, onRemove }: CompanyTableRowProps) => {
  const [chartData, setChartData] = useState<{ value: number }[]>([]);

  useEffect(() => {
    const fetchIntraday = async () => {
      try {
        const data = await fetchFinancialData('quote', company.ticker);
        if (data && Array.isArray(data)) {
          // Convert the intraday data to the format we need
          const prices = data.map((quote: any) => ({
            value: parseFloat(quote.price || quote.c || quote.close || '0')
          })).filter(item => !isNaN(item.value) && item.value > 0);
          
          // Use the last 50 data points for a smoother chart
          setChartData(prices.slice(-50));
        }
      } catch (error) {
        console.error('Failed to fetch intraday data:', error);
        // Fallback to current price if fetch fails
        const currentPrice = parseFloat(company.price);
        if (!isNaN(currentPrice)) {
          setChartData([{ value: currentPrice }]);
        }
      }
    };

    fetchIntraday();
  }, [company.ticker]);

  return (
    <tr className="hover:bg-gray-50 group">
      <td className="px-4 py-3 text-sm text-gray-500">
        <div className="flex items-center">
          {index + 1}
          <button
            onClick={() => onRemove(company.ticker)}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-3 p-1 rounded-full hover:bg-gray-100"
          >
            <XIcon className="h-4 w-4 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="font-medium text-gray-900">{company.name}</div>
      </td>
      <td className="px-4 py-3 text-sm font-medium text-blue-600">{company.ticker}</td>
      <td className="px-4 py-3 text-sm text-gray-500">${company.marketCap}</td>
      <td className="px-4 py-3">
        <div className="w-24 h-12">
          <AreaChart
            width={96}
            height={48}
            data={chartData}
            margin={{ top: 4, right: 0, left: 0, bottom: 4 }}
          >
            <defs>
              <linearGradient id={`gradient-${company.ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={company.isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                  stopOpacity={0.2}
                />
                <stop
                  offset="100%"
                  stopColor={company.isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <YAxis 
              hide 
              domain={['dataMin', 'dataMax']}
              padding={{ top: 10, bottom: 10 }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={company.isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
              fill={`url(#gradient-${company.ticker})`}
              strokeWidth={1.5}
              dot={false}
              isAnimationActive={false}
              connectNulls
            />
          </AreaChart>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">${company.price}</span>
          <div className={`flex items-center text-sm ${company.isPositive ? 'text-success' : 'text-warning'}`}>
            {company.isPositive ? (
              <ArrowUpIcon className="h-3 w-3 mr-1" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-1" />
            )}
            <span>{company.change}</span>
          </div>
        </div>
      </td>
    </tr>
  );
};
