
import { ArrowUpIcon, ArrowDownIcon, XIcon } from "lucide-react";

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
  const getLogoUrl = (ticker: string) => {
    // Fallback logos for major companies
    const logoMap: { [key: string]: string } = {
      'AAPL': 'https://companieslogo.com/img/orig/AAPL-157ca9ec.png',
      'MSFT': 'https://companieslogo.com/img/orig/MSFT-6e6017c6.png',
      'GOOG': 'https://companieslogo.com/img/orig/GOOGL-0ed88f7c.png',
      'GOOGL': 'https://companieslogo.com/img/orig/GOOGL-0ed88f7c.png',
      'AMZN': 'https://companieslogo.com/img/orig/AMZN-e9f942e4.png',
      'NVDA': 'https://companieslogo.com/img/orig/NVDA-8fb4460e.png',
      'META': 'https://companieslogo.com/img/orig/META-4767da84.png',
      'TSLA': 'https://companieslogo.com/img/orig/TSLA-3f31a2d9.png',
      'BRK-A': 'https://companieslogo.com/img/orig/BRK.A-f060a0b0.png',
      'BRK.A': 'https://companieslogo.com/img/orig/BRK.A-f060a0b0.png',
      'LLY': 'https://companieslogo.com/img/orig/LLY-9a757623.png',
      'JPM': 'https://companieslogo.com/img/orig/JPM-b585cef2.png',
    };
    return logoMap[ticker] || `https://ui-avatars.com/api/?name=${ticker}&background=random`;
  };

  return (
    <tr className="hover:bg-gray-100 transition-colors odd:bg-white even:bg-gray-50 group">
      <td className="px-2 py-1.5 text-sm text-gray-500">
        <div className="flex items-center">
          {index + 1}
          <button
            onClick={() => onRemove(company.ticker)}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 p-0.5 rounded-full hover:bg-gray-100"
          >
            <XIcon className="h-3 w-3 text-gray-400 hover:text-red-500" />
          </button>
        </div>
      </td>
      <td className="px-2 py-1.5">
        <div className="flex items-center gap-2">
          <img 
            src={company.logoUrl || getLogoUrl(company.ticker)} 
            alt={`${company.name} logo`}
            className="w-6 h-6 rounded object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${company.ticker}&background=random`;
            }}
          />
          <div className="font-medium text-sm text-gray-900">{company.name}</div>
        </div>
      </td>
      <td className="px-2 py-1.5 text-sm font-medium text-blue-600">{company.ticker}</td>
      <td className="px-2 py-1.5 text-sm text-gray-500">{company.marketCap}</td>
      <td className="px-2 py-1.5">
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-gray-900">{company.price}</span>
          <div className={`flex items-center text-xs ${company.isPositive ? 'text-success' : 'text-warning'}`}>
            {company.isPositive ? (
              <ArrowUpIcon className="h-3 w-3 mr-0.5" />
            ) : (
              <ArrowDownIcon className="h-3 w-3 mr-0.5" />
            )}
            <span>{company.change}</span>
          </div>
        </div>
      </td>
    </tr>
  );
};
