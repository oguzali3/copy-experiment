// src/services/transactionsApi.ts
import apiClient from '@/utils/apiClient';
import { AuthService } from '@/services/auth.service';

// Enum for transaction types that matches your backend
export enum TransactionType {
  BUY = 'BUY',
  SELL = 'SELL',
  DIVIDEND = 'DIVIDEND',
  SPLIT = 'SPLIT',
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL'
}

// Interface for Transaction data
export interface Transaction {
  id: string;
  portfolioId: string;
  ticker?: string;
  type: TransactionType;
  shares?: number;
  price?: number;
  amount?: number;
  date: string;
  fees?: number;
  notes?: string;
  splitRatio?: number;
  createdAt: string;
  updatedAt: string;
}

// Interface for creating new transactions
export interface CreateTransactionRequest {
  ticker?: string;
  type: TransactionType;
  shares?: number;
  price?: number;
  amount?: number;
  date?: string;
  fees?: number;
  notes?: string;
  splitRatio?: number;
}

// Interface for updating transactions
export interface UpdateTransactionRequest {
  ticker?: string;
  shares?: number;
  price?: number;
  amount?: number;
  date?: string;
  fees?: number;
  notes?: string;
  splitRatio?: number;
}

// Transaction API client
const transactionsApi = {
  // Get all transactions for a portfolio
  getTransactions: async (
    portfolioId: string,
    filters?: {
      type?: TransactionType;
      ticker?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<Transaction[]> => {
    try {
      const response = await apiClient.get<Transaction[]>(
        `/portfolios/${portfolioId}/transactions`,
        { params: filters }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  // Get a single transaction by ID
  getTransaction: async (portfolioId: string, id: string): Promise<Transaction> => {
    try {
      const response = await apiClient.get<Transaction>(
        `/portfolios/${portfolioId}/transactions/${id}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  },

  // Create a new transaction
  createTransaction: async (
    portfolioId: string,
    transaction: CreateTransactionRequest
  ): Promise<Transaction> => {
    try {
      const response = await apiClient.post<Transaction>(
        `/portfolios/${portfolioId}/transactions`,
        transaction
      );
      return response.data;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  // Record a buy transaction
  recordBuy: async (
    portfolioId: string,
    data: {
      ticker: string;
      shares: number;
      price: number;
      date?: string;
      fees?: number;
      notes?: string;
    }
  ): Promise<Transaction> => {
    try {
      const response = await apiClient.post<Transaction>(
        `/portfolios/${portfolioId}/transactions/buy`, 
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error recording buy transaction:', error);
      throw error;
    }
  },

  // Record a sell transaction
  recordSell: async (
    portfolioId: string,
    data: {
      ticker: string;
      shares: number;
      price: number;
      date?: string;
      fees?: number;
      notes?: string;
    }
  ): Promise<Transaction> => {
    try {
      const response = await apiClient.post<Transaction>(
        `/portfolios/${portfolioId}/transactions/sell`, 
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error recording sell transaction:', error);
      throw error;
    }
  },

  // Record a dividend transaction
  recordDividend: async (
    portfolioId: string,
    data: {
      ticker: string;
      amount: number;
      date?: string;
      notes?: string;
    }
  ): Promise<Transaction> => {
    try {
      const response = await apiClient.post<Transaction>(
        `/portfolios/${portfolioId}/transactions/dividend`, 
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error recording dividend transaction:', error);
      throw error;
    }
  },

  // Record a stock split
  recordSplit: async (
    portfolioId: string,
    data: {
      ticker: string;
      ratio: number;
      date?: string;
      notes?: string;
    }
  ): Promise<Transaction> => {
    try {
      const response = await apiClient.post<Transaction>(
        `/portfolios/${portfolioId}/transactions/split`, 
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error recording stock split:', error);
      throw error;
    }
  },

  // Update an existing transaction
  updateTransaction: async (
    portfolioId: string,
    id: string,
    data: UpdateTransactionRequest
  ): Promise<Transaction> => {
    try {
      const response = await apiClient.put<Transaction>(
        `/portfolios/${portfolioId}/transactions/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  },

  // Delete a transaction
  deleteTransaction: async (portfolioId: string, id: string): Promise<void> => {
    try {
      await apiClient.delete(`/portfolios/${portfolioId}/transactions/${id}`);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  },

  // Import multiple transactions at once
  importTransactions: async (
    portfolioId: string,
    transactions: CreateTransactionRequest[]
  ): Promise<{ success: boolean; count: number }> => {
    try {
      const response = await apiClient.post<{ success: boolean; count: number }>(
        `/portfolios/${portfolioId}/transactions/import`,
        transactions
      );
      return response.data;
    } catch (error) {
      console.error('Error importing transactions:', error);
      throw error;
    }
  }
};

export default transactionsApi;