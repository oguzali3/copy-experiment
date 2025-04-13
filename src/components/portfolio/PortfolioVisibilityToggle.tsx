// src/components/portfolio/PortfolioVisibilityToggle.tsx
import React, { useState } from 'react';
import { LockIcon, GlobeIcon, DollarSignIcon } from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PortfolioVisibility } from '@/constants/portfolioVisibility';
import { savePortfolioVisibility } from '@/utils/portfolioSubscriptionUtils';

interface PortfolioVisibilityToggleProps {
  portfolioId: string;
  portfolioName: string;
  currentVisibility: PortfolioVisibility;
  onVisibilityChange?: (newVisibility: PortfolioVisibility) => void;
  className?: string;
  disabled?: boolean;
}

export const PortfolioVisibilityToggle: React.FC<PortfolioVisibilityToggleProps> = ({
  portfolioId,
  portfolioName,
  currentVisibility,
  onVisibilityChange,
  className = '',
  disabled = false
}) => {
  const [isChanging, setIsChanging] = useState(false);
  const [visibility, setVisibility] = useState<PortfolioVisibility>(currentVisibility);

  const handleVisibilityChange = async (newVisibility: PortfolioVisibility) => {
    if (newVisibility === visibility) return;
    
    setIsChanging(true);
    try {
      // If changing to paid, show a confirmation
      if (newVisibility === PortfolioVisibility.PAID) {
        // In a real app, this would be a proper dialog
        const confirmed = window.confirm(
          'Making this portfolio paid will require subscribers to pay for access. Youll need to configure pricing. Continue?'
        );
        
        if (!confirmed) {
          setIsChanging(false);
          return;
        }
      }
      
      const success = await savePortfolioVisibility(portfolioId, portfolioName, newVisibility);
      
      if (success) {
        setVisibility(newVisibility);
        toast.success(`Portfolio visibility updated to ${newVisibility.toLowerCase()}`);
        
        if (onVisibilityChange) {
          onVisibilityChange(newVisibility);
        }
        
        // If switched to paid, redirect to pricing page
        if (newVisibility === PortfolioVisibility.PAID) {
          toast.info('Configure your subscription pricing in the next step');
          // In a real component, you would use router/navigate here
          setTimeout(() => {
            window.location.href = '/portfolio-pricing';
          }, 1500);
        }
      } else {
        toast.error('Failed to update portfolio visibility');
      }
    } catch (error) {
      console.error('Error changing portfolio visibility:', error);
      toast.error('Failed to update portfolio visibility');
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Select
        value={visibility}
        onValueChange={(value: string) => handleVisibilityChange(value as PortfolioVisibility)}
        disabled={disabled || isChanging}
      >
        <SelectTrigger className="w-36">
          <SelectValue placeholder="Visibility" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={PortfolioVisibility.PRIVATE}>
            <div className="flex items-center">
              <LockIcon className="h-4 w-4 mr-2" />
              Private
            </div>
          </SelectItem>
          <SelectItem value={PortfolioVisibility.PUBLIC}>
            <div className="flex items-center">
              <GlobeIcon className="h-4 w-4 mr-2" />
              Public
            </div>
          </SelectItem>
          <SelectItem value={PortfolioVisibility.PAID}>
            <div className="flex items-center">
              <DollarSignIcon className="h-4 w-4 mr-2" />
              Paid
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      
      {isChanging && (
        <span className="text-xs text-gray-500 animate-pulse">Updating...</span>
      )}
    </div>
  );
};