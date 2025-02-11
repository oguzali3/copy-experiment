
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type PortfolioVisibility = 'private' | 'public' | 'paid';

interface Portfolio {
  id: string;
  name: string;
  is_public: boolean;
  is_paid: boolean;
}

const PortfolioSubscriptions = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [portfolios, setPortfolios] = useState<(Portfolio & { visibility: PortfolioVisibility })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolios();
  }, [user]);

  const fetchPortfolios = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, name, is_public, is_paid')
        .eq('user_id', user.id);

      if (error) throw error;

      const portfoliosWithVisibility = (data || []).map(portfolio => ({
        ...portfolio,
        visibility: getVisibilityFromFlags(portfolio.is_public, portfolio.is_paid)
      }));

      setPortfolios(portfoliosWithVisibility);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error("Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  const getVisibilityFromFlags = (isPublic: boolean, isPaid: boolean): PortfolioVisibility => {
    if (isPaid) return 'paid';
    if (isPublic) return 'public';
    return 'private';
  };

  const handleVisibilityChange = async (portfolioId: string, visibility: PortfolioVisibility) => {
    const isPublic = visibility === 'public';
    const isPaid = visibility === 'paid';

    try {
      const { error } = await supabase
        .from('portfolios')
        .update({
          is_public: isPublic,
          is_paid: isPaid
        })
        .eq('id', portfolioId);

      if (error) throw error;

      setPortfolios(portfolios.map(p => 
        p.id === portfolioId 
          ? { ...p, visibility, is_public: isPublic, is_paid: isPaid }
          : p
      ));

      toast.success("Portfolio visibility updated");
    } catch (error) {
      console.error('Error updating portfolio visibility:', error);
      toast.error("Failed to update portfolio visibility");
    }
  };

  const handleNext = () => {
    const hasPaidPortfolios = portfolios.some(p => p.visibility === 'paid');
    if (hasPaidPortfolios) {
      navigate('/portfolio-pricing');
    } else {
      toast.success("Settings saved successfully");
      navigate('/profile');
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Portfolio Subscription Settings</h1>
      
      <div className="space-y-6 mb-8">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{portfolio.name}</h2>
            </div>

            <RadioGroup
              value={portfolio.visibility}
              onValueChange={(value: PortfolioVisibility) => handleVisibilityChange(portfolio.id, value)}
              className="grid gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="private" id={`private-${portfolio.id}`} />
                <Label htmlFor={`private-${portfolio.id}`} className="font-medium">
                  Private - Only you can see this portfolio
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="public" id={`public-${portfolio.id}`} />
                <Label htmlFor={`public-${portfolio.id}`} className="font-medium">
                  Public - Anyone can view this portfolio for free
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="paid" id={`paid-${portfolio.id}`} />
                <Label htmlFor={`paid-${portfolio.id}`} className="font-medium">
                  Paid - Only paid subscribers can access this portfolio
                </Label>
              </div>
            </RadioGroup>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/profile')}
        >
          Cancel
        </Button>
        <Button onClick={handleNext}>
          Next
        </Button>
      </div>
    </div>
  );
};

export default PortfolioSubscriptions;
