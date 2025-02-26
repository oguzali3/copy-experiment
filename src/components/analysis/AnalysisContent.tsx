import React from 'react';
import { AnalysisOverview } from './AnalysisOverview';
import { FinancialStatements } from '@/components/FinancialStatements';

interface AnalysisContentProps {
  activeTab: string;
  selectedStock: any;
  onTabChange: (tab: string) => void;
}

export const AnalysisContent = ({ 
  activeTab, 
  selectedStock,
  onTabChange
}: AnalysisContentProps) => {
  return (
    <div className="-mx-4 sm:-mx-6 md:-mx-8 lg:-mx-12">
      {activeTab === 'overview' && (
        <AnalysisOverview selectedStock={selectedStock} />
      )}
      {activeTab === 'financials' && selectedStock && (
        <FinancialStatements ticker={selectedStock.ticker} />
      )}
    </div>
  );
};
