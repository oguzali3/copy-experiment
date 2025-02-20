
import { ArrowUpIcon, ArrowDownIcon, XIcon } from "lucide-react";
import { Area, AreaChart, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { useStockWebSocket } from "@/hooks/useStockWebSocket";

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
  const { price } = useStockWebSocket(company.ticker);

  useEffect(() => {
    if (price) {
      setChartData(prev => {
        const newData = [...prev, { value: price }];
        if (newData.length > 20) {
          return newData.slice(-20);
        }
        return newData;
      });
    }
  }, [price]);

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
      <td className="px-4 py-3 text-sm text-gray-900">${company.price}</td>
      <td className="px-4 py-3">
        <div className="w-24 h-12">
          <AreaChart
            width={96}
            height={48}
            data={chartData}
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={`gradient-${company.ticker}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={company.isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                  stopOpacity={0.3}
                />
                <stop
                  offset="100%"
                  stopColor={company.isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <YAxis hide domain={['dataMin', 'dataMax']} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={company.isPositive ? "rgb(34, 197, 94)" : "rgb(239, 68, 68)"}
              fill={`url(#gradient-${company.ticker})`}
              strokeWidth={1.5}
            />
          </AreaChart>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className={`flex items-center ${company.isPositive ? 'text-success' : 'text-warning'}`}>
          {company.isPositive ? (
            <ArrowUpIcon className="h-4 w-4 mr-1" />
          ) : (
            <ArrowDownIcon className="h-4 w-4 mr-1" />
          )}
          <span>{company.change}</span>
        </div>
      </td>
    </tr>
  );
};
