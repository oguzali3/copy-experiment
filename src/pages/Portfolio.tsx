
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import PortfolioContent from "@/components/portfolio/PortfolioContent";
import { toast } from "sonner";

interface LocationState {
  portfolioId: string;
}

const Portfolio = () => {
  const { session, isLoading } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();
  const { portfolioId } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!isLoading && !session) {
      toast.error("Please sign in to access your portfolio");
      navigate("/signin");
    }
  }, [session, isLoading, navigate]);

  useEffect(() => {
    if (!portfolioId && !isLoading && session) {
      navigate("/profile");
    }
  }, [portfolioId, isLoading, session, navigate]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!session || !portfolioId) {
    return null;
  }

  return <PortfolioContent portfolioId={portfolioId} />;
};

export default Portfolio;
