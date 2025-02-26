
import { ArrowUpIcon, ArrowDownIcon, XIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchFinancialData } from "@/utils/financialApi";
import { MiniChart } from "./MiniChart";

interface CompanyTableRowProps {
  company: {
    name: string;
    ticker: string;
    marketCap: string;
    price: string;
    change: string;
    isPositive: boolean;
    logoUrl?: string;
  };
  index: number;
  onRemove: (ticker: string) => void;
}

export const CompanyTableRow = ({ company, index, onRemove }: CompanyTableRowProps) => {
  const navigate = useNavigate();

  const { data: chartData } = useQuery({
    queryKey: ['stock-chart', company.ticker, '1D'],
    queryFn: async () => {
      const response = await fetchFinancialData('quote', company.ticker);
      // Mock data for demo - replace with actual API data when available
      const basePrice = parseFloat(company.price);
      const points = 20;
      return Array.from({ length: points }, (_, i) => ({
        time: new Date(Date.now() - (points - i) * 1000 * 60 * 30).toISOString(),
        price: basePrice * (1 + (Math.random() - 0.5) * 0.02)
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    navigate(`/analysis?ticker=${company.ticker}`);
  };

  return (
    <tr 
      className="hover:bg-gray-50/80 transition-all duration-200 odd:bg-white even:bg-gray-50/50 group cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="px-3 py-2 text-sm text-gray-500">
        <div className="flex items-center">
          {index + 1}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(company.ticker);
            }}
            className="opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2 p-1 rounded-full hover:bg-red-50"
          >
            <XIcon className="h-3 w-3 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        </div>
      </td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg overflow-hidden bg-[#4A4A4A] flex items-center justify-center shadow-sm">
            <img 
              src={company.logoUrl} 
              alt={`${company.name} logo`}
              className="w-full h-full object-contain p-1.5"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(company.ticker)}&background=random&color=fff&size=32`;
              }}
            />
          </div>
          <div className="font-medium text-sm text-gray-900 group-hover:text-blue-600 transition-colors">
            {company.name}
          </div>
        </div>
      </td>
      <td className="px-3 py-2 text-sm font-medium text-gray-900">{company.ticker}</td>
      <td className="px-3 py-2 text-sm text-gray-500">{company.marketCap}</td>
      <td className="px-3 py-2">
        {chartData && <MiniChart data={chartData} isPositive={company.isPositive} />}
      </td>
      <td className="px-3 py-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-gray-900">{company.price}</span>
          <div className={`flex items-center text-xs font-medium ${company.isPositive ? 'text-success' : 'text-warning'}`}>
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
