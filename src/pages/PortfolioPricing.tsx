
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Portfolio {
  id: string;
  name: string;
  is_paid: boolean;
  monthly_price: number;
  annual_price: number;
}

const PortfolioPricing = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);

  useState(() => {
    fetchPaidPortfolios();
  });

  const fetchPaidPortfolios = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('portfolios')
        .select('id, name, is_paid, monthly_price, annual_price')
        .eq('user_id', user.id)
        .eq('is_paid', true);

      if (error) throw error;
      setPortfolios(data || []);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
      toast.error("Failed to load portfolios");
    }
  };

  const handlePriceChange = async (portfolioId: string, field: 'monthly_price' | 'annual_price', value: string) => {
    const numericValue = parseFloat(value) || 0;

    try {
      const { error } = await supabase
        .from('portfolios')
        .update({ [field]: numericValue })
        .eq('id', portfolioId);

      if (error) throw error;

      setPortfolios(portfolios.map(p => 
        p.id === portfolioId 
          ? { ...p, [field]: numericValue }
          : p
      ));
    } catch (error) {
      console.error('Error updating portfolio price:', error);
      toast.error("Failed to update price");
    }
  };

  const handleNext = () => {
    // TODO: Implement Stripe connection flow
    toast.info("Stripe integration coming soon!");
    navigate('/profile');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Set Subscription Pricing</h1>
      
      <div className="space-y-6 mb-8">
        {portfolios.map((portfolio) => (
          <Card key={portfolio.id} className="p-6">
            <h2 className="text-xl font-semibold mb-4">{portfolio.name}</h2>
            
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label htmlFor={`monthly-${portfolio.id}`}>Monthly Price ($)</Label>
                <Input
                  id={`monthly-${portfolio.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={portfolio.monthly_price}
                  onChange={(e) => handlePriceChange(portfolio.id, 'monthly_price', e.target.value)}
                  className="max-w-xs"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`annual-${portfolio.id}`}>Annual Price ($)</Label>
                <Input
                  id={`annual-${portfolio.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  value={portfolio.annual_price}
                  onChange={(e) => handlePriceChange(portfolio.id, 'annual_price', e.target.value)}
                  className="max-w-xs"
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => navigate('/portfolio-subscriptions')}
        >
          Back
        </Button>
        <Button onClick={handleNext}>
          Next: Connect Stripe
        </Button>
      </div>
    </div>
  );
};

export default PortfolioPricing;
