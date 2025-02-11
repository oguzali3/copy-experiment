
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSessionContext } from '@supabase/auth-helpers-react';
import PortfolioContent from "@/components/portfolio/PortfolioContent";
import { toast } from "sonner";

interface LocationState {
  selectedPortfolioId: string;
}

const Portfolio = () => {
  const { session, isLoading } = useSessionContext();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedPortfolioId = (location.state as LocationState)?.selectedPortfolioId;

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

  return selectedPortfolioId ? <PortfolioContent selectedPortfolioId={selectedPortfolioId} /> : null;
};

export default Portfolio;
