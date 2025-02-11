
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from '@supabase/auth-helpers-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionPricing {
  id: string;
  monthly_price: number;
  annual_price: number;
}

const PortfolioPricing = () => {
  const navigate = useNavigate();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [pricing, setPricing] = useState<SubscriptionPricing | null>(null);

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_pricing')
        .select('*')
        .single();

      if (error) throw error;
      setPricing(data);
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast.error("Failed to load pricing information");
    }
  };

  useEffect(() => {
    fetchPricing();
  }, []);

  const handlePriceChange = async (field: 'monthly_price' | 'annual_price', value: string) => {
    if (!pricing) return;
    
    const numericValue = parseFloat(value) || 0;

    try {
      const { error } = await supabase
        .from('subscription_pricing')
        .update({ [field]: numericValue })
        .eq('id', pricing.id);

      if (error) throw error;

      setPricing({
        ...pricing,
        [field]: numericValue
      });

      toast.success("Price updated successfully");
    } catch (error) {
      console.error('Error updating price:', error);
      toast.error("Failed to update price");
    }
  };

  const handleNext = () => {
    // TODO: Implement Stripe connection flow
    toast.info("Stripe integration coming soon!");
    navigate('/profile');
  };

  if (!pricing) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Set Subscription Pricing</h1>
      
      <Card className="p-6 mb-8">
        <div className="space-y-6">
          <div>
            <Label htmlFor="monthly-price" className="text-base">Monthly Subscription Price ($)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Set the price for monthly access to all paid portfolios
            </p>
            <Input
              id="monthly-price"
              type="number"
              min="0"
              step="0.01"
              value={pricing.monthly_price}
              onChange={(e) => handlePriceChange('monthly_price', e.target.value)}
              className="max-w-xs"
            />
          </div>

          <div>
            <Label htmlFor="annual-price" className="text-base">Annual Subscription Price ($)</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Set the price for annual access to all paid portfolios
            </p>
            <Input
              id="annual-price"
              type="number"
              min="0"
              step="0.01"
              value={pricing.annual_price}
              onChange={(e) => handlePriceChange('annual_price', e.target.value)}
              className="max-w-xs"
            />
          </div>
        </div>
      </Card>

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
