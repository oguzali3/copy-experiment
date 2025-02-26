import { Card } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";
import { MetricsSearch } from "./MetricsSearch";
import { CompanySearch } from "./CompanySearch";
import { CompanyTableHeader } from "./CompanyTableHeader";
import { CompanyTableRow } from "./CompanyTableRow";
import { fetchFinancialData, fetchBatchQuotes, formatMarketCap } from "@/utils/financialApi";
import { toast } from "sonner";
import { RefreshCw, Info } from "lucide-react";
import { Button } from "./ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Company = {
  rank: number;
  name: string;
  ticker: string;
  marketCap: string;
  price: string;
  change: string;
  isPositive: boolean;
  currency: string;
  logoUrl?: string;
};

const initialCompanies: Company[] = [
  { rank: 1, name: "Apple Inc.", ticker: "AAPL", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 2, name: "Microsoft", ticker: "MSFT", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 3, name: "Alphabet", ticker: "GOOGL", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 4, name: "Amazon", ticker: "AMZN", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 5, name: "NVIDIA", ticker: "NVDA", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 6, name: "Meta", ticker: "META", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 7, name: "Tesla", ticker: "TSLA", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 8, name: "Berkshire Hathaway", ticker: "BRK-B", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 9, name: "Eli Lilly", ticker: "LLY", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
  { rank: 10, name: "JPMorgan", ticker: "JPM", marketCap: "0", price: "0", change: "0%", isPositive: true, currency: "USD" },
];

type SortDirection = "asc" | "desc" | null;
type SortField = "marketCap" | "price" | "change";

const getCurrencySymbol = (currency: string): string => {
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'JPY': return '¥';
    case 'CNY': return '¥';
    case 'HKD': return 'HK$';
    default: return '$';
  }
};

export const TopCompanies = () => {
  const [companies, setCompanies] = useState<Company[]>(initialCompanies);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sortConfig, setSortConfig] = useState<{
    field: SortField | null;
    direction: SortDirection;
  }>({
    field: null,
    direction: null,
  });

  const fetchPrices = useCallback(async () => {
    if (isRefreshing) return; // Prevent concurrent refreshes
    
    try {
      setIsRefreshing(true);
      const tickers = companies.map(company => company.ticker);
      
      // Fetch all quotes in a single API call
      const quotes = await fetchBatchQuotes(tickers);
      
      if (!quotes) {
        throw new Error('Failed to fetch quotes');
      }

      const updatedCompanies = companies.map(company => {
        const quote = quotes.find(q => q.symbol === company.ticker);
        if (!quote) return company;

        return {
          ...company,
          price: quote.price.toFixed(2),
          change: `${quote.changesPercentage.toFixed(2)}%`,
          isPositive: quote.changesPercentage >= 0,
          marketCap: formatMarketCap(quote.marketCap),
          // Keep existing currency and logo as they don't change frequently
        };
      });

      setCompanies(updatedCompanies);
    } catch (error) {
      console.error('Error fetching prices:', error);
      toast.error("Failed to refresh prices");
    } finally {
      setIsRefreshing(false);
    }
  }, [companies, isRefreshing]); // Only depend on companies and isRefreshing

  // Initial data fetch - including profile data
  const fetchInitialData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const updatedCompanies = await Promise.all(
        companies.map(async (company) => {
          try {
            const [quoteData, profileData] = await Promise.all([
              fetchFinancialData('quote', company.ticker),
              fetchFinancialData('profile', company.ticker)
            ]);
            
            const quote = quoteData[0];
            const profile = profileData[0];
            
            if (quote && profile) {
              return {
                ...company,
                price: quote.price.toFixed(2),
                change: `${quote.changesPercentage.toFixed(2)}%`,
                isPositive: quote.changesPercentage >= 0,
                marketCap: formatMarketCap(quote.marketCap),
                currency: profile.currency || 'USD',
                logoUrl: profile.image || undefined
              };
            }
            return company;
          } catch (error) {
            console.error(`Error fetching data for ${company.ticker}:`, error);
            return company;
          }
        })
      );

      setCompanies(updatedCompanies);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error("Failed to load company data");
    } finally {
      setIsRefreshing(false);
    }
  }, []); // No dependencies since this is only for initial load

  // Only fetch initial data (including profiles) on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleSort = useCallback((field: SortField) => {
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
    return sortedCompanies;
  }, [companies, sortConfig]);

  const handleCompanySelect = async (newCompany: any) => {
    if (!companies.find(c => c.ticker === newCompany.ticker)) {
      try {
        const [quoteData, profileData] = await Promise.all([
          fetchFinancialData('quote', newCompany.ticker),
          fetchFinancialData('profile', newCompany.ticker)
        ]);
        
        const quote = quoteData[0];
        const profile = profileData[0];
        
        if (quote && profile) {
          const formattedCompany: Company = {
            ...newCompany,
            rank: companies.length + 1,
            price: quote.price.toFixed(2),
            change: `${quote.changesPercentage.toFixed(2)}%`,
            isPositive: quote.changesPercentage >= 0,
            marketCap: formatMarketCap(quote.marketCap),
            currency: profile.currency || 'USD',
            logoUrl: profile.image || undefined
          };
          
          setCompanies(prev => {
            const newCompanies = [...prev, formattedCompany];
            if (sortConfig.field) {
              return handleSort(sortConfig.field);
            }
            return newCompanies;
          });
          
          toast.success(`Added ${newCompany.name} to featured companies`);
        }
      } catch (error) {
        console.error(`Error fetching data for new company ${newCompany.ticker}:`, error);
        toast.error(`Failed to fetch data for ${newCompany.name}`);
      }
    }
  };

  const handleRemoveCompany = useCallback((tickerToRemove: string) => {
    setCompanies(prev => {
      const updatedCompanies = prev
        .filter(company => company.ticker !== tickerToRemove)
        .map((company, index) => ({
          ...company,
          rank: index + 1
        }));
      return updatedCompanies;
    });
  }, []);

  const handleMetricSelect = (metricId: string) => {
    console.log("Metric selected:", metricId);
  };

  const handleRefresh = () => {
    fetchPrices();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-[#111827]">Featured Companies</h2>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Track and analyze top companies in real-time</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="transition-all duration-300 hover:shadow-md"
          >
            <RefreshCw className={`h-4 w-4 mr-2 transition-all duration-700 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Monitor market performance and key metrics for leading companies
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <MetricsSearch onMetricSelect={handleMetricSelect} />
        <CompanySearch onCompanySelect={handleCompanySelect} />
      </div>

      <Card className="overflow-hidden rounded-lg border border-gray-200 shadow-sm transition-all duration-200 hover:shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full">
            <CompanyTableHeader sortConfig={sortConfig} onSort={handleSort} />
            <tbody className="divide-y divide-gray-200">
              {companies.map((company, index) => (
                <CompanyTableRow
                  key={company.ticker}
                  company={{
                    ...company,
                    marketCap: `${getCurrencySymbol(company.currency)}${company.marketCap}`,
                    price: `${getCurrencySymbol(company.currency)}${company.price}`
                  }}
                  index={index}
                  onRemove={handleRemoveCompany}
                />
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {companies.length === 0 && (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <p className="text-lg font-medium text-gray-900">No companies added yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Use the search above to add companies to your watchlist
          </p>
        </div>
      )}
    </div>
  );
};
