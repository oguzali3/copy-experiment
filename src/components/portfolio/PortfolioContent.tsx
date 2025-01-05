import { useState, useEffect } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchFinancialData } from "@/utils/financialApi";

export type Stock = {
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  percentOfPortfolio: number;
  gainLoss: number;
  gainLossPercent: number;
};

export type Portfolio = {
  id: string;
  name: string;
  stocks: Stock[];
  totalValue: number;
};

export const PortfolioContent = () => {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const updateStockPrices = async (stocks: Stock[]): Promise<Stock[]> => {
    const updatedStocks = await Promise.all(
      stocks.map(async (stock) => {
        try {
          const quoteData = await fetchFinancialData('quote', stock.ticker);
          const currentPrice = quoteData[0]?.price || stock.currentPrice;
          const marketValue = currentPrice * stock.shares;
          const gainLoss = marketValue - (stock.shares * stock.avgPrice);
          const gainLossPercent = ((currentPrice - stock.avgPrice) / stock.avgPrice) * 100;

          return {
            ...stock,
            currentPrice,
            marketValue,
            gainLoss,
            gainLossPercent,
          };
        } catch (error) {
          console.error(`Error fetching price for ${stock.ticker}:`, error);
          return stock;
        }
      })
    );

    // Recalculate percentOfPortfolio based on new market values
    const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);
    return updatedStocks.map(stock => ({
      ...stock,
      percentOfPortfolio: (stock.marketValue / totalValue) * 100
    }));
  };

  const fetchPortfolios = async () => {
    try {
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select(`
          id,
          name,
          total_value,
          portfolio_stocks (
            id,
            ticker,
            name,
            shares,
            avg_price,
            current_price,
            market_value,
            percent_of_portfolio,
            gain_loss,
            gain_loss_percent
          )
        `);

      if (portfoliosError) throw portfoliosError;

      if (portfoliosData) {
        const formattedPortfolios: Portfolio[] = await Promise.all(
          portfoliosData.map(async p => {
            const stocks = (p.portfolio_stocks || []).map(s => ({
              ticker: s.ticker,
              name: s.name,
              shares: s.shares,
              avgPrice: s.avg_price,
              currentPrice: s.current_price || 0,
              marketValue: s.market_value || 0,
              percentOfPortfolio: s.percent_of_portfolio || 0,
              gainLoss: s.gain_loss || 0,
              gainLossPercent: s.gain_loss_percent || 0
            }));

            // Update current prices and calculations
            const updatedStocks = await updateStockPrices(stocks);
            const totalValue = updatedStocks.reduce((sum, stock) => sum + stock.marketValue, 0);

            // Update the portfolio in the database with new values
            await supabase
              .from('portfolios')
              .update({ total_value: totalValue })
              .eq('id', p.id);

            // Update stock values in the database
            await Promise.all(
              updatedStocks.map(stock => 
                supabase
                  .from('portfolio_stocks')
                  .update({
                    current_price: stock.currentPrice,
                    market_value: stock.marketValue,
                    percent_of_portfolio: stock.percentOfPortfolio,
                    gain_loss: stock.gainLoss,
                    gain_loss_percent: stock.gainLossPercent
                  })
                  .eq('portfolio_id', p.id)
                  .eq('ticker', stock.ticker)
              )
            );

            return {
              id: p.id,
              name: p.name,
              totalValue: totalValue,
              stocks: updatedStocks
            };
          })
        );

        setPortfolios(formattedPortfolios);
        if (formattedPortfolios.length > 0 && !selectedPortfolio) {
          setSelectedPortfolio(formattedPortfolios[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error("Failed to fetch portfolios");
    }
  };

  const handleCreatePortfolio = async (portfolio: Portfolio) => {
    try {
      // Insert the portfolio with user_id
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .insert([
          {
            name: portfolio.name,
            total_value: portfolio.totalValue,
            user_id: (await supabase.auth.getUser()).data.user?.id
          }
        ])
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Insert the stocks
      if (portfolio.stocks.length > 0) {
        const stocksToInsert = portfolio.stocks.map(stock => ({
          portfolio_id: portfolioData.id,
          ticker: stock.ticker,
          name: stock.name,
          shares: stock.shares,
          avg_price: stock.avgPrice,
          current_price: stock.currentPrice,
          market_value: stock.marketValue,
          percent_of_portfolio: stock.percentOfPortfolio,
          gain_loss: stock.gainLoss,
          gain_loss_percent: stock.gainLossPercent,
        }));

        const { error: stocksError } = await supabase
          .from('portfolio_stocks')
          .insert(stocksToInsert);

        if (stocksError) throw stocksError;
      }

      // Update the local state with the new portfolio
      const newPortfolio = {
        ...portfolio,
        id: portfolioData.id,
      };
      
      setPortfolios([...portfolios, newPortfolio]);
      setSelectedPortfolio(newPortfolio);
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

      setPortfolios(portfolios.filter(p => p.id !== id));
      if (selectedPortfolio?.id === id) {
        setSelectedPortfolio(null);
      }
      toast.success("Portfolio deleted successfully");
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      toast.error("Failed to delete portfolio");
    }
  };

  const handleUpdatePortfolio = async (updatedPortfolio: Portfolio) => {
    try {
      // Update the portfolio
      const { error: portfolioError } = await supabase
        .from('portfolios')
        .update({
          name: updatedPortfolio.name,
          total_value: updatedPortfolio.totalValue,
        })
        .eq('id', updatedPortfolio.id);

      if (portfolioError) throw portfolioError;

      // Delete existing stocks
      const { error: deleteError } = await supabase
        .from('portfolio_stocks')
        .delete()
        .eq('portfolio_id', updatedPortfolio.id);

      if (deleteError) throw deleteError;

      // Insert updated stocks
      const stocksToInsert = updatedPortfolio.stocks.map(stock => ({
        portfolio_id: updatedPortfolio.id,
        ticker: stock.ticker,
        name: stock.name,
        shares: stock.shares,
        avg_price: stock.avgPrice,
        current_price: stock.currentPrice,
        market_value: stock.marketValue,
        percent_of_portfolio: stock.percentOfPortfolio,
        gain_loss: stock.gainLoss,
        gain_loss_percent: stock.gainLossPercent,
      }));

      const { error: stocksError } = await supabase
        .from('portfolio_stocks')
        .insert(stocksToInsert);

      if (stocksError) throw stocksError;

      setPortfolios(portfolios.map(p => 
        p.id === updatedPortfolio.id ? updatedPortfolio : p
      ));
      setSelectedPortfolio(updatedPortfolio);
      toast.success("Portfolio updated successfully");
    } catch (error) {
      console.error('Error updating portfolio:', error);
      toast.error("Failed to update portfolio");
    }
  };

  if (portfolios.length === 0 && !isCreating) {
    return <PortfolioEmpty onCreateClick={() => setIsCreating(true)} />;
  }

  if (isCreating) {
    return (
      <PortfolioCreate 
        onSubmit={handleCreatePortfolio}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {portfolios.map((portfolio) => (
          <Button
            key={portfolio.id}
            variant={selectedPortfolio?.id === portfolio.id ? "default" : "ghost"}
            onClick={() => setSelectedPortfolio(portfolio)}
            className={selectedPortfolio?.id === portfolio.id ? "bg-[#f5a623] hover:bg-[#f5a623]/90 text-white" : ""}
          >
            {portfolio.name}
          </Button>
        ))}
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