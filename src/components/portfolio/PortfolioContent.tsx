import { useState, useEffect } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchFinancialData } from "@/utils/financialApi";
import { Portfolio, Stock } from "./types";

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
          // No portfolio found - this is okay
          setPortfolio(null);
        } else {
          toast.error("Error fetching portfolio");
          console.error("Error fetching portfolio:", error);
        }
        setLoading(false);
        return;
      }

      if (data) {
        // Transform portfolio_stocks data and fetch current prices
        const stocksPromises = (data.portfolio_stocks || []).map(async (stock: any) => {
          try {
            // Fetch current price from API
            const quoteData = await fetchFinancialData('quote', stock.ticker);
            const currentPrice = quoteData[0]?.price || 0;
            
            // Calculate updated metrics
            const shares = Number(stock.shares);
            const avgPrice = Number(stock.avg_price);
            const marketValue = shares * currentPrice;
            const gainLoss = marketValue - (shares * avgPrice);
            const gainLossPercent = avgPrice > 0 ? ((currentPrice - avgPrice) / avgPrice) * 100 : 0;

            // Update the stock in database with new values
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
              percentOfPortfolio: 0, // Will be calculated after all stocks are processed
              gainLoss,
              gainLossPercent
            };
          } catch (error) {
            console.error(`Error fetching price for ${stock.ticker}:`, error);
            toast.error(`Failed to fetch current price for ${stock.ticker}`);
            
            // Return stock with existing values if API call fails
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
        
        // Calculate total portfolio value and percentages
        const totalValue = stocks.reduce((sum, stock) => sum + stock.marketValue, 0);
        
        // Update portfolio total value in database
        await supabase
          .from('portfolios')
          .update({ total_value: totalValue })
          .eq('id', data.id);

        // Calculate and update percentOfPortfolio for each stock
        const stocksWithPercentages = stocks.map(stock => ({
          ...stock,
          percentOfPortfolio: totalValue > 0 ? (stock.marketValue / totalValue) * 100 : 0
        }));

        // Update percentOfPortfolio in database for each stock
        await Promise.all(stocksWithPercentages.map(stock =>
          supabase
            .from('portfolio_stocks')
            .update({ percent_of_portfolio: stock.percentOfPortfolio })
            .eq('portfolio_id', data.id)
            .eq('ticker', stock.ticker)
        ));

        const portfolioData: Portfolio = {
          id: data.id,
          name: data.name,
          stocks: stocksWithPercentages,
          totalValue
        };
        
        setPortfolio(portfolioData);
      }
    } catch (error) {
      console.error('Error in fetchPortfolio:', error);
      toast.error("Failed to fetch portfolio data");
    }
    setLoading(false);
  };

  const handleAddPortfolio = async (newPortfolio: Portfolio) => {
    try {
      // First create the portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .insert({
          name: newPortfolio.name,
          total_value: newPortfolio.totalValue
        })
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Then add all the stocks
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

  const handleUpdatePortfolio = async (updatedPortfolio: Portfolio) => {
    try {
      // Update portfolio name and total value
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .update({
          name: updatedPortfolio.name,
          total_value: updatedPortfolio.totalValue
        })
        .eq('id', updatedPortfolio.id);

      if (portfolioError) throw portfolioError;

      // Fetch current stocks to compare with updated ones
      const { data: currentStocks } = await supabase
        .from('portfolio_stocks')
        .select('*')
        .eq('portfolio_id', updatedPortfolio.id);

      const currentStocksMap = new Map(currentStocks?.map(s => [s.ticker, s]));
      
      // Update or insert stocks
      for (const stock of updatedPortfolio.stocks) {
        const existingStock = currentStocksMap.get(stock.ticker);
        
        if (existingStock) {
          // For existing positions, update with the new share count directly
          // This fixes the trimming issue by not adding to existing shares
          const { error: updateError } = await supabase
            .from('portfolio_stocks')
            .update({
              shares: stock.shares,
              avg_price: stock.avgPrice,
              current_price: stock.currentPrice,
              market_value: stock.shares * stock.currentPrice,
              percent_of_portfolio: stock.percentOfPortfolio,
              gain_loss: (stock.shares * stock.currentPrice) - (stock.shares * stock.avgPrice),
              gain_loss_percent: ((stock.currentPrice - stock.avgPrice) / stock.avgPrice) * 100
            })
            .eq('portfolio_id', updatedPortfolio.id)
            .eq('ticker', stock.ticker);

          if (updateError) throw updateError;
        } else {
          // Insert new stock
          const { error: insertError } = await supabase
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

          if (insertError) throw insertError;
        }
      }

      // Delete removed stocks
      const updatedTickers = new Set(updatedPortfolio.stocks.map(s => s.ticker));
      const tickersToDelete = [...currentStocksMap.keys()].filter(ticker => !updatedTickers.has(ticker));
      
      if (tickersToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('portfolio_stocks')
          .delete()
          .eq('portfolio_id', updatedPortfolio.id)
          .in('ticker', tickersToDelete);

        if (deleteError) throw deleteError;
      }
      
      // Fetch the updated portfolio
      await fetchPortfolio();
      toast.success("Portfolio updated successfully");
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error("Failed to update portfolio");
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
