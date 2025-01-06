import { useState, useEffect } from "react";
import { PortfolioEmpty } from "./PortfolioEmpty";
import { PortfolioCreate } from "./PortfolioCreate";
import { PortfolioView } from "./PortfolioView";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { fetchFinancialData } from "@/utils/financialApi";
import { Stock, Portfolio } from "./types";

const PortfolioContent = () => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("portfolios")
        .select("*")
        .single();

      if (error) {
        toast.error("Error fetching portfolio");
      } else {
        setPortfolio(data);
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
  if (!portfolio) return <PortfolioEmpty onAddPortfolio={handleAddPortfolio} />;

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
