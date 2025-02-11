import { useState, useEffect } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchFinancialData } from "@/utils/financialApi";
import { Portfolio, Stock } from "./types";
import { updatePortfolioStock, calculatePortfolioMetrics } from "./utils/portfolioOperations";

interface PortfolioContentProps {
  portfolioId: string;
}

const PortfolioContent = ({ portfolioId }: PortfolioContentProps) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (portfolioId) {
      fetchPortfolio();
    }
  }, [portfolioId]);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .select(`
          *,
          portfolio_stocks (*)
        `)
        .eq('id', portfolioId)
        .single();

      if (portfolioError) throw portfolioError;

      if (portfolioData) {
        const processedStocks = await Promise.all((portfolioData.portfolio_stocks || []).map(async (stock: any) => {
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
        }));

        const { totalValue, stocksWithPercentages } = calculatePortfolioMetrics(processedStocks);
        
        setPortfolio({
          id: portfolioData.id,
          name: portfolioData.name,
          stocks: stocksWithPercentages,
          totalValue
        });
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
      toast.error("Failed to fetch portfolio data");
    }
    setLoading(false);
  };

  const handleAddPosition = async (stock: Stock) => {
    if (!portfolio) return;

    try {
      await supabase
        .from('portfolio_stocks')
        .insert({
          portfolio_id: portfolio.id,
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

      await fetchPortfolio();
      toast.success("Position added successfully");
    } catch (error) {
      console.error('Error adding position:', error);
      toast.error("Failed to add position");
    }
  };

  const handleUpdatePosition = async (updatedStock: Stock) => {
    if (!portfolio) return;

    try {
      await updatePortfolioStock(portfolio.id, updatedStock, null);
      await fetchPortfolio();
      toast.success("Position updated successfully");
    } catch (error) {
      console.error('Error updating position:', error);
      toast.error("Failed to update position");
    }
  };

  const handleDeletePosition = async (ticker: string) => {
    if (!portfolio) return;

    try {
      await supabase
        .from('portfolio_stocks')
        .delete()
        .eq('portfolio_id', portfolio.id)
        .eq('ticker', ticker);

      await fetchPortfolio();
      toast.success("Position deleted successfully");
    } catch (error) {
      console.error('Error deleting position:', error);
      toast.error("Failed to delete position");
    }
  };

  if (loading) return <div>Loading...</div>;
  
  if (isCreating) {
    return (
      <PortfolioCreate
        onSubmit={async (newPortfolio) => {
          await handleAddPosition(newPortfolio.stocks[0]);
          setIsCreating(false);
        }}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  if (!portfolio) {
    return <PortfolioEmpty onCreate={() => setIsCreating(true)} />;
  }

  return (
    <PortfolioView
      portfolio={portfolio}
      onAddPortfolio={() => setIsCreating(true)}
      onDeletePortfolio={() => {}} // This will be implemented later if needed
      onUpdatePortfolio={(updatedPortfolio) => {
        if (updatedPortfolio.stocks.length > 0) {
          handleUpdatePosition(updatedPortfolio.stocks[0]);
        }
      }}
    />
  );
};

export default PortfolioContent;
