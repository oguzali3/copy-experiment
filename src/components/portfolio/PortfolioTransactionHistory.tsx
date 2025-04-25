// src/components/portfolio/PortfolioTransactionHistory.tsx
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, Calendar, DollarSign, Clock } from "lucide-react";
import { format } from "date-fns";
import portfolioApi from '@/services/portfolioApi';
import { Loader2 } from 'lucide-react';

interface PortfolioTransactionHistoryProps {
  portfolioId: string;
}

type Transaction = {
  id: string;
  type: string;
  ticker: string;
  shares: number;
  priceAtTransaction: number;
  amount: number;
  tradeDate: string;
};

export const PortfolioTransactionHistory: React.FC<PortfolioTransactionHistoryProps> = ({ 
  portfolioId 
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (expanded && portfolioId) {
      fetchTransactions();
    }
  }, [portfolioId, expanded]);

  const fetchTransactions = async () => {
    if (!portfolioId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await portfolioApi.getPortfolioTransactions(portfolioId);
      setTransactions(data);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | string) => {
    // Clean up potentially malformed numbers
    const cleanValue = typeof value === 'string' 
      ? parseFloat(value.replace(/(\d+\.\d+)\.00$/, '$1')) 
      : value;
      
    // Handle if still NaN after cleanup
    if (isNaN(Number(cleanValue))) {
      console.warn('Invalid number format:', value);
      return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Number(cleanValue));
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm space-y-4 mt-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium flex items-center">
          <Clock className="h-5 w-5 mr-2 text-gray-500" />
          Transaction History
        </h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Hide' : 'Show'} Transactions
        </Button>
      </div>
      
      {expanded && (
        <>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              {error}
              <Button 
                variant="link" 
                onClick={fetchTransactions} 
                className="ml-2"
              >
                Try Again
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transaction history available for this portfolio.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
              <TableHeader>
                <TableRow>
                    <TableHead className="w-[15%]">
                    <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        Date
                    </div>
                    </TableHead>
                    <TableHead className="w-[10%]">Type</TableHead>
                    <TableHead className="w-[15%]">Ticker</TableHead>
                    <TableHead className="text-right w-[15%]">Shares</TableHead>
                    <TableHead className="text-right w-[20%]">
                    <div className="flex items-center justify-end">
                        <DollarSign className="h-4 w-4 mr-1 text-gray-500" />
                        Price
                    </div>
                    </TableHead>
                    <TableHead className="text-right w-[25%]">Total Value</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">
                        {formatDate(transaction.tradeDate)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'BUY' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.type === 'BUY' ? (
                            <ArrowUpIcon className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowDownIcon className="h-3 w-3 mr-1" />
                          )}
                          {transaction.type}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{transaction.ticker}</TableCell>
                      <TableCell className="text-right">{transaction.shares.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.priceAtTransaction)}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(transaction.amount)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </>
      )}
    </div>
  );
};