
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import PortfolioContent from "@/components/portfolio/PortfolioContent";
import { toast } from "sonner";

const Portfolio = () => {
  const { session, isLoading } = useSessionContext();
  const navigate = useNavigate();
  const { portfolioId } = useParams();

  useEffect(() => {
    if (!isLoading && !session) {
      toast.error("Please sign in to access your portfolio");
      navigate("/signin");
    }
  }, [session, isLoading, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return <PortfolioContent portfolioId={portfolioId} />;
};

export default Portfolio;
