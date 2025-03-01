// src/components/Portfolio.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import PortfolioContent from "@/components/portfolio/PortfolioContent";
import { toast } from "sonner";
import portfolioApi from "@/services/portfolioApi";
import { isAuthenticated, getAuthToken } from "@/services/auth.service";

interface LocationState {
  portfolioId?: string;
}

const Portfolio = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [portfolioId, setPortfolioId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  
  // Get portfolioId from URL params or location state
  const urlPortfolioId = params.id;
  const statePortfolioId = (location.state as LocationState)?.portfolioId;

  useEffect(() => {
    // Add debug logging
    console.log("Auth check: isAuthenticated =", isAuthenticated());
    console.log("Auth token =", getAuthToken()?.substring(0, 10) + "...");
    
    // Check if user is authenticated
    if (!isAuthenticated()) {
      const error = "Please sign in to access your portfolio";
      setAuthError(error);
      toast.error(error);
      navigate("/signin");
      return;
    }

    // Use portfolioId from URL params first, then from location state
    const currentPortfolioId = urlPortfolioId || statePortfolioId;
    
    if (currentPortfolioId) {
      setPortfolioId(currentPortfolioId);
      setIsLoading(false);
      return;
    }

    // If no portfolioId is provided, fetch the first portfolio
    const fetchFirstPortfolio = async () => {
      try {
        // Debug console
        console.log("Attempting to fetch portfolios...");
        
        const portfolios = await portfolioApi.getPortfolios();
        console.log("Portfolios fetched:", portfolios);
        
        if (portfolios && portfolios.length > 0) {
          setPortfolioId(portfolios[0].id);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
        // More detailed error message
        const errorMsg = error.response?.data?.message || "Failed to load portfolio data";
        console.log("Error details:", error.response?.data);
        
        toast.error(errorMsg);
        setIsLoading(false);
        
        // Only redirect if it's an authentication error
        if (error.response?.status === 401) {
          navigate("/signin");
        }
      }
    };

    fetchFirstPortfolio();
  }, [urlPortfolioId, statePortfolioId, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading portfolio data...</div>;
  }

  if (authError) {
    return <div className="text-center text-red-500">{authError}</div>;
  }

  return <PortfolioContent portfolioId={portfolioId || ""} />;
};

export default Portfolio;