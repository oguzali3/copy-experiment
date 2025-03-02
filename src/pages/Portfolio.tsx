// src/components/Portfolio.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import PortfolioContent from "@/components/portfolio/PortfolioContent";
import { toast } from "sonner";
import { isAuthenticated } from "@/services/auth.service";
import portfolioApi from '@/services/portfolioApi';
import { Portfolio as PortfolioType } from "@/components/portfolio/types";

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
  const [portfolios, setPortfolios] = useState<PortfolioType[]>([]);
  
  // Get portfolioId from URL params or location state
  const urlPortfolioId = params.id;
  const statePortfolioId = (location.state as LocationState)?.portfolioId;

  useEffect(() => {
    // Check if user is authenticated
    if (!isAuthenticated()) {
      const error = "Please sign in to access your portfolio";
      setAuthError(error);
      toast.error(error);
      navigate("/signin");
      return;
    }

    const fetchData = async () => {
      try {
        console.log("Attempting to fetch portfolios...");
        
        // Use skipRefresh=true to prevent expensive refreshes when just loading the page
        const fetchedPortfolios = await portfolioApi.getPortfolios({ skipRefresh: true });
        setPortfolios(fetchedPortfolios);
        console.log("Portfolios fetched:", fetchedPortfolios);
        
        // Determine which portfolio ID to use
        const currentPortfolioId = urlPortfolioId || statePortfolioId;
        
        if (currentPortfolioId) {
          console.log("Using provided portfolio ID:", currentPortfolioId);
          setPortfolioId(currentPortfolioId);
        } else if (fetchedPortfolios && fetchedPortfolios.length > 0) {
          // Use first portfolio if none specified
          const firstPortfolioId = fetchedPortfolios[0].id;
          console.log("Setting first portfolio ID:", firstPortfolioId);
          setPortfolioId(firstPortfolioId);
          
          // Update the URL to include the portfolio ID
          navigate(`/portfolio/${firstPortfolioId}`, { replace: true });
        } else {
          console.log("No portfolios found");
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching portfolios:", error);
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

    fetchData();
  }, [urlPortfolioId, statePortfolioId, navigate]);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64">Loading portfolio data...</div>;
  }

  if (authError) {
    return <div className="text-center text-red-500">{authError}</div>;
  }

  // Pass both the portfolioId and the portfolios data
  return <PortfolioContent 
    portfolioId={portfolioId || ""} 
    portfolios={portfolios}
    setPortfolios={setPortfolios}
  />;
};

export default Portfolio;