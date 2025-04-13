// src/components/portfolio/PortfolioAccessDenied.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LockIcon, DollarSignIcon } from 'lucide-react';
import { PortfolioVisibility } from '@/constants/portfolioVisibility';

interface PortfolioAccessDeniedProps {
  reason: 'private' | 'subscriptionRequired' | 'notFound';
  portfolioName?: string;
  portfolioId?: string;
  onSubscribe?: () => void;
}

const PortfolioAccessDenied: React.FC<PortfolioAccessDeniedProps> = ({
  reason,
  portfolioName,
  portfolioId,
  onSubscribe
}) => {
  const navigate = useNavigate();
  
  const renderContent = () => {
    switch (reason) {
      case 'private':
        return (
          <>
            <CardHeader>
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-gray-100 mb-4">
                <LockIcon className="h-6 w-6 text-gray-600" />
              </div>
              <CardTitle className="text-center">Private Portfolio</CardTitle>
              <CardDescription className="text-center">
                This portfolio is set to private by its owner
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                {portfolioName ? `"${portfolioName}"` : "This portfolio"} is private and not shared with other users.
              </p>
            </CardContent>
          </>
        );
        
      case 'subscriptionRequired':
        return (
          <>
            <CardHeader>
              <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 mb-4">
                <DollarSignIcon className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-center">Subscription Required</CardTitle>
              <CardDescription className="text-center">
                Subscribe to access this premium portfolio
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600 mb-4">
                {portfolioName ? `"${portfolioName}"` : "This portfolio"} requires a subscription to access.
              </p>
              {onSubscribe && (
                <Button 
                  className="mx-auto mt-2"
                  onClick={onSubscribe}
                >
                  View Subscription Options
                </Button>
              )}
            </CardContent>
          </>
        );
        
      case 'notFound':
      default:
        return (
          <>
            <CardHeader>
              <CardTitle className="text-center">Portfolio Not Found</CardTitle>
              <CardDescription className="text-center">
                We couldn't find the portfolio you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-gray-600">
                The portfolio may have been removed or you might have followed an invalid link.
              </p>
            </CardContent>
          </>
        );
    }
  };
  
  return (
    <div className="max-w-md mx-auto my-12">
      <Card>
        {renderContent()}
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            onClick={() => navigate('/portfolios/public')}
          >
            Browse Public Portfolios
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default PortfolioAccessDenied;