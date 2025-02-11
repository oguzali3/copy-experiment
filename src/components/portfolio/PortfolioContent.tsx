
import { useState, useEffect } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchFinancialData } from "@/utils/financialApi";
import { Portfolio, Stock } from "./types";
import { updatePortfolioStock, calculatePortfolioMetrics } from "./utils/portfolioOperations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PortfolioContentProps {
  portfolioId: string;
}

const PortfolioContent = ({ portfolioId }: PortfolioContentProps) => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    setLoading(true);
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        toast.error("Error fetching user session");
        console.error("Error fetching session:", sessionError);
        setLoading(false);
        return;
      }

      if (!session) {
        toast.error("Please sign in to view portfolios");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("portfolios")
        .select("*, portfolio_stocks(*)")
        .eq('user_id', session.user.id);

      if (error) {
        toast.error("Error fetching portfolios");
        console.error("Error fetching portfolios:", error);
        setLoading(false);
        return;
      }

      if (data) {
        const processedPortfolios = await Promise.all(data.map(async (portfolio) => {
          const stocksPromises = (portfolio.portfolio_stocks || []).map(async (stock: any) => {
            try {
              const quoteData = await fetchFinancialData('quote', stock.ticker);
              if (!quoteData || !quoteData[0]) {
                console.error(`No quote data received for ${stock.ticker}`);
                throw new Error(`Failed to fetch quote data for ${stock.ticker}`);
              }
              
              const currentPrice = quoteData[0]?.price || 0;
              const shares = Number(stock.shares);
              const avgPrice = Number(stock.avg_price);
              const marketValue = shares * currentPrice;
              const gainLoss = marketValue - (shares * avgPrice);
              const gainLossPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

              await supabase
                .from('portfolio_stocks')
                .update({
                  current_price: currentPrice,
                  market_value: marketValue,
                  gain_loss: gainLoss,
                  gain_loss_percent: gainLossPercent
                })
                .eq('id', stock.id);

              return {
                ticker: stock.ticker,
                name: stock.name,
                shares,
                avgPrice,
                currentPrice,
                marketValue,
                percentOfPortfolio: 0,
                gainLoss,
                gainLossPercent
              };
            } catch (error) {
              console.error(`Error fetching price for ${stock.ticker}:`, error);
              toast.error(`Failed to fetch current price for ${stock.ticker}`);
              
              return {
                ticker: stock.ticker,
                name: stock.name,
                shares: Number(stock.shares),
                avgPrice: Number(stock.avg_price),
                currentPrice: Number(stock.current_price),
                marketValue: Number(stock.market_value),
                percentOfPortfolio: Number(stock.percent_of_portfolio),
                gainLoss: Number(stock.gain_loss),
                gainLossPercent: Number(stock.gain_loss_percent)
              };
            }
          });

          const stocks = await Promise.all(stocksPromises);
          const { totalValue, stocksWithPercentages } = calculatePortfolioMetrics(stocks);
          
          await supabase
            .from('portfolios')
            .update({ total_value: totalValue })
            .eq('id', portfolio.id);

          await Promise.all(stocksWithPercentages.map(stock =>
            supabase
              .from('portfolio_stocks')
              .update({ percent_of_portfolio: stock.percentOfPortfolio })
              .eq('portfolio_id', portfolio.id)
              .eq('ticker', stock.ticker)
          ));

          return {
            id: portfolio.id,
            name: portfolio.name,
            stocks: stocksWithPercentages,
            totalValue
          };
        }));

        setPortfolios(processedPortfolios);
        // Set the first portfolio as selected if none is selected
        if (!selectedPortfolioId && processedPortfolios.length > 0) {
          setSelectedPortfolioId(processedPortfolios[0].id);
        }
      }
    } catch (error) {
      console.error('Error in fetchPortfolios:', error);
      toast.error("Failed to fetch portfolio data");
    }
    setLoading(false);
  };

  const handleAddPortfolio = async (newPortfolio: Portfolio) => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        toast.error("Error fetching user session");
        console.error("Error fetching session:", sessionError);
        return;
      }

      if (!session) {
        toast.error("Please sign in to create a portfolio");
        return;
      }

      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          name: newPortfolio.name,
          total_value: newPortfolio.totalValue,
          user_id: session.user.id
        })
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      const stockPromises = newPortfolio.stocks.map(stock => 
        supabase
          .from('portfolio_stocks')
          .insert({
            portfolio_id: portfolioData.id,
            ticker: stock.ticker,
            name: stock.name,
            shares: stock.shares,
            avg_price: stock.avgPrice,
            current_price: stock.currentPrice,
            market_value: stock.marketValue,
            percent_of_portfolio: stock.percentOfPortfolio,
            gain_loss: stock.gainLoss,
            gain_loss_percent: stock.gainLossPercent
          })
      );

      await Promise.all(stockPromises);
      
      await fetchPortfolios();
      setSelectedPortfolioId(portfolioData.id);
      setIsCreating(false);
      toast.success("Portfolio created successfully");
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error("Failed to create portfolio");
    }
  };

  const handleUpdatePortfolio = async (updatedPortfolio: Portfolio) => {
    try {
      await supabase
        .from('portfolios')
        .update({
          name: updatedPortfolio.name,
          total_value: updatedPortfolio.totalValue
        })
        .eq('id', updatedPortfolio.id);

      const { data: currentStocks } = await supabase
        .from('portfolio_stocks')
        .select('*')
        .eq('portfolio_id', updatedPortfolio.id);

      const currentStocksMap = new Map(currentStocks?.map(s => [s.ticker, s]));

      for (const stock of updatedPortfolio.stocks) {
        const existingStock = currentStocksMap.get(stock.ticker);

        if (existingStock) {
          await updatePortfolioStock(updatedPortfolio.id, stock, existingStock);
        } else {
          await supabase
            .from('portfolio_stocks')
            .insert({
              portfolio_id: updatedPortfolio.id,
              ticker: stock.ticker,
              name: stock.name,
              shares: stock.shares,
              avg_price: stock.avgPrice,
              current_price: stock.currentPrice,
              market_value: stock.marketValue,
              percent_of_portfolio: stock.percentOfPortfolio,
              gain_loss: stock.gainLoss,
              gain_loss_percent: stock.gainLossPercent
            });
        }
      }

      const updatedTickers = new Set(updatedPortfolio.stocks.map(s => s.ticker));
      const tickersToDelete = [...currentStocksMap.keys()].filter(ticker => !updatedTickers.has(ticker));
      
      if (tickersToDelete.length > 0) {
        await supabase
          .from('portfolio_stocks')
          .delete()
          .eq('portfolio_id', updatedPortfolio.id)
          .in('ticker', tickersToDelete);
      }
      
      await fetchPortfolios();
      toast.success("Portfolio updated successfully");
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error("Failed to update portfolio");
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPortfolios(prev => prev.filter(portfolio => portfolio.id !== id));
      setSelectedPortfolioId(null);
      toast.success("Portfolio deleted successfully");
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error("Failed to delete portfolio");
    }
  };

  if (loading) return <div>Loading...</div>;
  
  if (isCreating) {
    return (
      <PortfolioCreate
        onSubmit={handleAddPortfolio}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (portfolios.length === 0) {
    return <PortfolioEmpty onCreate={() => setIsCreating(true)} />;
  }

  const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Select
          value={selectedPortfolioId || undefined}
          onValueChange={(value) => setSelectedPortfolioId(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Portfolio" />
          </SelectTrigger>
          <SelectContent>
            {portfolios.map((portfolio) => (
              <SelectItem key={portfolio.id} value={portfolio.id}>
                {portfolio.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedPortfolio && (
        <PortfolioView
          portfolio={selectedPortfolio}
          onAddPortfolio={() => setIsCreating(true)}
          onDeletePortfolio={handleDeletePortfolio}
          onUpdatePortfolio={handleUpdatePortfolio}
        />
      )}
    </div>
  );
};

export default PortfolioContent;
