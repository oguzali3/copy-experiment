// src/pages/profile/components/tabs/PortfoliosTab.tsx
import React from 'react';
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { PortfolioListItem } from '../shared/PortfolioListItem';
import { PortfolioData } from '../types';

interface PortfoliosTabProps {
  portfolios: PortfolioData[];
  isOwner: boolean;
}

export const PortfoliosTab: React.FC<PortfoliosTabProps> = ({ portfolios, isOwner }) => {
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
        {portfolios.length > 0 ? (
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