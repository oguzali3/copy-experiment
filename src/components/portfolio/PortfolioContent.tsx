import { useState, useEffect } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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

  // Fetch portfolios on component mount
  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('portfolios')
        .select('*');

      if (portfoliosError) throw portfoliosError;

      if (portfoliosData) {
        // For each portfolio, fetch its stocks
        const portfoliosWithStocks = await Promise.all(
          portfoliosData.map(async (portfolio) => {
            const { data: stocksData, error: stocksError } = await supabase
              .from('portfolio_stocks')
              .select('*')
              .eq('portfolio_id', portfolio.id);

            if (stocksError) throw stocksError;

            return {
              id: portfolio.id,
              name: portfolio.name,
              totalValue: portfolio.total_value,
              stocks: stocksData || []
            };
          })
        );

        setPortfolios(portfoliosWithStocks);
      }
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error("Failed to fetch portfolios");
    }
  };

  const handleCreatePortfolio = async (portfolio: Portfolio) => {
    try {
      // Insert the portfolio
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('portfolios')
        .insert([
          {
            name: portfolio.name,
            total_value: portfolio.totalValue,
          }
        ])
        .select()
        .single();

      if (portfolioError) throw portfolioError;

      // Insert the stocks
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
        <Button
          variant="outline"
          onClick={() => setIsCreating(true)}
          className="ml-auto"
        >
          Create Portfolio
        </Button>
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