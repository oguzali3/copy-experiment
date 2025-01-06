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

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("portfolios")
          .select("*, portfolio_stocks(*)");

        if (error) {
          toast.error("Error fetching portfolio");
          setLoading(false);
          return;
        }

        if (data && data[0]) {
          // Transform portfolio_stocks data and fetch current prices
          const stocksPromises = (data[0].portfolio_stocks || []).map(async (stock: any) => {
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
            .eq('id', data[0].id);

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
              .eq('portfolio_id', data[0].id)
              .eq('ticker', stock.ticker)
          ));

          const portfolioData: Portfolio = {
            id: data[0].id,
            name: data[0].name,
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

    fetchPortfolio();
  }, []);

  const handleAddPortfolio = async () => {
    // Logic to add a new portfolio
  };

  const handleDeletePortfolio = async (id: string) => {
    // Logic to delete a portfolio
  };

  const handleUpdatePortfolio = async (updatedPortfolio: Portfolio) => {
    // Logic to update a portfolio
  };

  if (loading) return <div>Loading...</div>;
  if (!portfolio) return <PortfolioEmpty onCreate={handleAddPortfolio} />;

  return (
    <PortfolioView
      portfolio={portfolio}
      onAddPortfolio={handleAddPortfolio}
      onDeletePortfolio={handleDeletePortfolio}
      onUpdatePortfolio={handleUpdatePortfolio}
    />
  );
};

export default PortfolioContent;