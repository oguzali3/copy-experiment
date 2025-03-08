// src/pages/profile/components/tabs/PortfoliosTab.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { PortfolioListItem } from '../shared/PortfolioListItem';
import { PortfolioData } from '../types';
import { Skeleton } from "@/components/ui/skeleton"; // Assuming you have a Skeleton component

interface PortfoliosTabProps {
  portfolios: PortfolioData[];
  isOwner: boolean;
  isLoading: boolean;
}

export const PortfoliosTab: React.FC<PortfoliosTabProps> = ({ 
  portfolios, 
  isOwner, 
  isLoading 
}) => {
  const navigate = useNavigate();

  const handlePortfolioClick = (portfolioId: string) => {
    navigate('/portfolio', {
      state: { portfolioId }
    });
  };

  return (
    <div className="space-y-4">
      {isOwner && (
        <Button 
          onClick={() => navigate('/portfolio-subscriptions')} 
          className="w-full bg-gradient-to-r from-black to-gray-900 hover:from-gray-900 hover:to-black text-white font-medium py-2.5 transition-all duration-300"
        >
          Create A Portfolio Subscription Service
        </Button>
      )}
      
      <div className="space-y-2">
        {isLoading ? (
          // Show skeleton loaders while portfolios are loading
          Array(3).fill(0).map((_, index) => (
            <div key={`skeleton-${index}`} className="py-3 px-4 bg-white rounded-lg border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          ))
        ) : portfolios.length > 0 ? (
          portfolios.map(portfolio => (
            <PortfolioListItem 
              key={portfolio.id}
              portfolio={portfolio}
              onClick={() => handlePortfolioClick(portfolio.id)}
            />
          ))
        ) : (
          <div className="text-center py-6 text-gray-600 bg-gray-50 rounded-lg">
            {isOwner ? 'You haven\'t created any portfolios yet' : 'No portfolios yet'}
          </div>
        )}
      </div>
    </div>
  );
};