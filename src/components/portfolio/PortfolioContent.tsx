import { useState, useEffect } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchFinancialData } from "@/utils/financialApi";
import { Portfolio, Stock } from "./types";
import { updatePortfolioStock, calculatePortfolioMetrics } from "./utils/portfolioOperations";

const PortfolioContent = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("portfolios")
        .select("*, portfolio_stocks(*)")
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setPortfolio(null);
        } else {
          toast.error("Error fetching portfolio");
          console.error("Error fetching portfolio:", error);
        }
        setLoading(false);
        return;
      }

      if (data) {
        const stocksPromises = (data.portfolio_stocks || []).map(async (stock: any) => {
          try {
            const quoteData = await fetchFinancialData('quote', stock.ticker);
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
          .eq('id', data.id);

        await Promise.all(stocksWithPercentages.map(stock =>
          supabase
            .from('portfolio_stocks')
            .update({ percent_of_portfolio: stock.percentOfPortfolio })
            .eq('portfolio_id', data.id)
            .eq('ticker', stock.ticker)
        ));

        setPortfolio({
          id: data.id,
          name: data.name,
          stocks: stocksWithPercentages,
          totalValue
        });
      }
    } catch (error) {
      console.error('Error in fetchPortfolio:', error);
      toast.error("Failed to fetch portfolio data");
    }
    setLoading(false);
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
          if (stock.shares === existingStock.shares) {
            // Skip if no change in shares
            continue;
          } else if (stock.shares < existingStock.shares) {
            // Trim operation - maintain existing average price
            await supabase
              .from('portfolio_stocks')
              .update({
                shares: stock.shares,
                current_price: stock.currentPrice,
                market_value: stock.shares * stock.currentPrice,
                percent_of_portfolio: stock.percentOfPortfolio,
                gain_loss: (stock.shares * stock.currentPrice) - (stock.shares * existingStock.avg_price),
                gain_loss_percent: ((stock.currentPrice - existingStock.avg_price) / existingStock.avg_price) * 100
              })
              .eq('portfolio_id', updatedPortfolio.id)
              .eq('ticker', stock.ticker);
          } else {
            // Add operation - Accumulate shares and calculate new weighted average
            const totalShares = existingStock.shares + (stock.shares - existingStock.shares);
            
            // Calculate weighted average price
            const existingCost = existingStock.shares * existingStock.avg_price;
            const additionalCost = (stock.shares - existingStock.shares) * stock.avgPrice;
            const totalCost = existingCost + additionalCost;
            const newAvgPrice = totalCost / totalShares;

            // Calculate updated metrics
            const marketValue = totalShares * stock.currentPrice;
            const gainLoss = marketValue - totalCost;
            const gainLossPercent = ((stock.currentPrice - newAvgPrice) / newAvgPrice) * 100;

            await supabase
              .from('portfolio_stocks')
              .update({
                shares: totalShares,
                avg_price: newAvgPrice,
                current_price: stock.currentPrice,
                market_value: marketValue,
                percent_of_portfolio: stock.percentOfPortfolio,
                gain_loss: gainLoss,
                gain_loss_percent: gainLossPercent
              })
              .eq('portfolio_id', updatedPortfolio.id)
              .eq('ticker', stock.ticker);
          }
        } else {
          // Insert new stock position
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

      // Remove stocks that are no longer in the portfolio
      const updatedTickers = new Set(updatedPortfolio.stocks.map(s => s.ticker));
      const tickersToDelete = [...currentStocksMap.keys()].filter(ticker => !updatedTickers.has(ticker));
      
      if (tickersToDelete.length > 0) {
        await supabase
          .from('portfolio_stocks')
          .delete()
          .eq('portfolio_id', updatedPortfolio.id)
          .in('ticker', tickersToDelete);
      }
      
      await fetchPortfolio();
      toast.success("Portfolio updated successfully");
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error("Failed to update portfolio");
    }
  };

  const handleAddPortfolio = async (newPortfolio: Portfolio) => {
    try {
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          name: newPortfolio.name,
          total_value: newPortfolio.totalValue
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
      
      await fetchPortfolio();
      setIsCreating(false);
      toast.success("Portfolio created successfully");
    } catch (error) {
      console.error('Error creating portfolio:', error);
      toast.error("Failed to create portfolio");
    }
  };

  const handleDeletePortfolio = async (id: string) => {
    try {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPortfolio(null);
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

  if (!portfolio) {
    return <PortfolioEmpty onCreate={() => setIsCreating(true)} />;
  }

  return (
    <PortfolioView
      portfolio={portfolio}
      onAddPortfolio={() => setIsCreating(true)}
      onDeletePortfolio={handleDeletePortfolio}
      onUpdatePortfolio={handleUpdatePortfolio}
    />
  );
};

export default PortfolioContent;