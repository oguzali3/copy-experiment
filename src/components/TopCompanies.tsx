
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { MetricsSearch } from "./MetricsSearch";
import { CompanySearch } from "./CompanySearch";
import { CompanyTableHeader } from "./CompanyTableHeader";
import { CompanyTableRow } from "./CompanyTableRow";
import { useStockWebSocket } from "@/hooks/useStockWebSocket";
import { fetchFinancialData } from "@/utils/financialApi";

type Company = {
  rank: number;
  name: string;
  ticker: string;
  marketCap: string;
  price: string;  // Changed to only string
  change: string;
  isPositive: boolean;
};

const initialCompanies: Company[] = [
  { rank: 1, name: "Apple Inc.", ticker: "AAPL", marketCap: "3.02T", price: "0", change: "0%", isPositive: true },
  { rank: 2, name: "Microsoft", ticker: "MSFT", marketCap: "2.89T", price: "0", change: "0%", isPositive: true },
  { rank: 3, name: "Alphabet", ticker: "GOOGL", marketCap: "1.89T", price: "0", change: "0%", isPositive: true },
  { rank: 4, name: "Amazon", ticker: "AMZN", marketCap: "1.78T", price: "0", change: "0%", isPositive: true },
  { rank: 5, name: "NVIDIA", ticker: "NVDA", marketCap: "1.22T", price: "0", change: "0%", isPositive: true },
  { rank: 6, name: "Meta", ticker: "META", marketCap: "905B", price: "0", change: "0%", isPositive: true },
  { rank: 7, name: "Tesla", ticker: "TSLA", marketCap: "857B", price: "0", change: "0%", isPositive: true },
  { rank: 8, name: "Berkshire", ticker: "BRK.A", marketCap: "785B", price: "0", change: "0%", isPositive: true },
  { rank: 9, name: "Eli Lilly", ticker: "LLY", marketCap: "674B", price: "0", change: "0%", isPositive: true },
  { rank: 10, name: "JPMorgan", ticker: "JPM", marketCap: "498B", price: "0", change: "0%", isPositive: true },
];

type SortDirection = "asc" | "desc" | null;
type SortField = "marketCap" | "price" | "change";

export const TopCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({
    field: null,
    direction: null,
  });

  // Initialize WebSocket connections for each company
  companies.forEach(company => {
    const { price: latestPrice } = useStockWebSocket(company.ticker);
    
    useEffect(() => {
      if (latestPrice) {
        setCompanies(prevCompanies => {
          return prevCompanies.map(prevCompany => {
            if (prevCompany.ticker === company.ticker) {
              // Calculate change percentage based on previous price
              const prevPrice = parseFloat(prevCompany.price);
              const changePercent = prevPrice > 0 
                ? ((latestPrice - prevPrice) / prevPrice) * 100 
                : 0;
              
              return {
                ...prevCompany,
                price: latestPrice.toFixed(2), // Ensure price is string
                change: `${changePercent.toFixed(2)}%`,
                isPositive: changePercent >= 0
              };
            }
            return prevCompany;
          });
        });
      }
    }, [latestPrice]);
  });

  // Fetch initial quotes for all companies
  useEffect(() => {
    const fetchInitialQuotes = async () => {
      try {
        const quotesPromises = companies.map(company => 
          fetchFinancialData('quote', company.ticker)
        );
        
        const quotes = await Promise.all(quotesPromises);
        
        setCompanies(prevCompanies => {
          return prevCompanies.map((company, index) => {
            const quote = quotes[index]?.[0];
            if (quote) {
              return {
                ...company,
                price: quote.price.toFixed(2), // Ensure price is string
                change: `${quote.changesPercentage.toFixed(2)}%`,
                isPositive: quote.changesPercentage >= 0
              };
            }
            return company;
          });
        });
      } catch (error) {
        console.error('Error fetching initial quotes:', error);
      }
    };

    fetchInitialQuotes();
  }, []);

  const handleSort = (field: SortField) => {
    let direction: SortDirection = "desc";
    
    if (sortConfig.field === field && sortConfig.direction === "desc") {
      direction = "asc";
    }

    const sortedCompanies = [...companies].sort((a, b) => {
      if (field === "marketCap") {
        const valueA = parseFloat(a[field].replace("T", "000").replace("B", ""));
        const valueB = parseFloat(b[field].replace("T", "000").replace("B", ""));
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      } else if (field === "price") {
        const valueA = parseFloat(a[field]);
        const valueB = parseFloat(b[field]);
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      } else if (field === "change") {
        const valueA = parseFloat(a[field].replace("%", ""));
        const valueB = parseFloat(b[field].replace("%", ""));
        return direction === "asc" ? valueA - valueB : valueB - valueA;
      }
      return 0;
    });

    setSortConfig({ field, direction });
    setCompanies(sortedCompanies);
  };

  const handleCompanySelect = (newCompany: any) => {
    if (!companies.find(c => c.ticker === newCompany.ticker)) {
      const formattedCompany: Company = {
        ...newCompany,
        rank: companies.length + 1,
        price: "0",
        change: "0%",
        isPositive: true
      };
      setCompanies(prev => [...prev, formattedCompany]);
    }
  };

  const handleRemoveCompany = (tickerToRemove: string) => {
    setCompanies(prev => prev.filter(company => company.ticker !== tickerToRemove));
  };

  const handleMetricSelect = (metricId: string) => {
    console.log("Metric selected:", metricId);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-[#111827]">Featured Companies</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <MetricsSearch onMetricSelect={handleMetricSelect} />
        <CompanySearch onCompanySelect={handleCompanySelect} />
      </div>
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <CompanyTableHeader sortConfig={sortConfig} onSort={handleSort} />
            <tbody className="divide-y divide-gray-200">
              {companies.map((company, index) => (
                <CompanyTableRow
                  key={company.ticker}
                  company={company}
                  index={index}
                  onRemove={handleRemoveCompany}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
