// src/services/paymentApi.ts
import apiClient from '@/utils/apiClient';

interface PaymentMethod {
  id: string;
  type: string;
  brand: string;
  last4: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

interface AddPaymentMethodDto {
    paymentToken: string;
    type: string;
    userId?: string;         // Make optional since backend will get it from auth
    stripeCustomerId?: string; // Make optional
}
interface CreatePaymentDto {
  amount: number;
  currency?: string;
  paymentMethodId: string;
  description?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: Record<string, any>;
}

interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  createdAt: string;
}

const PaymentAPI = {
  /**
   * Get all payment methods for the current user
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    try {
      const response = await apiClient.get<PaymentMethod[]>('/payments/methods');
      return response.data;
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      throw error;
    }
  },

  /**
 * Add a new payment method
 */
async addPaymentMethod(dto: AddPaymentMethodDto): Promise<PaymentMethod> {
    try {
      console.log('Sending payment method data:', dto); // Log for debugging
      
      // Ensure we have a userId from context if not explicitly provided
      if (!dto.userId) {
        // Get the user ID from the auth context if available
        const authContext = JSON.parse(localStorage.getItem('authContext') || '{}');
        if (authContext.user && authContext.user.id) {
          dto.userId = authContext.user.id;
        }
      }
      
      // Add additional defensive check to log if userId is still missing
      if (!dto.userId) {
        console.warn('Adding payment method without userId, this might fail');
      }
      
      const response = await apiClient.post<PaymentMethod>('/payments/methods', dto);
      return response.data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      // Log the response data for more insight
      if (error.response) {
        console.error('Error response data:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Remove a payment method
   */
  removePaymentMethod: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`/payments/methods/${id}`);
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  },

  /**
   * Set a payment method as default
   */
  setDefaultPaymentMethod: async (id: string): Promise<PaymentMethod> => {
    try {
      const response = await apiClient.put<PaymentMethod>(`/payments/methods/${id}/default`);
      return response.data;
    } catch (error) {
      console.error('Error setting default payment method:', error);
      throw error;
    }
  },

  /**
   * Get a client token for payment processing
   */
  getClientToken: async (customerId?: string): Promise<{clientToken: string}> => {
    try {
      const response = await apiClient.get<{clientToken: string}>('/payments/token', {
        params: { customerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error getting client token:', error);
      throw error;
    }
  },

  /**
   * Process a payment
   */
  createPayment: async (dto: CreatePaymentDto): Promise<Transaction> => {
    try {
      const response = await apiClient.post<Transaction>('/payments/process', dto);
      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  /**
   * Confirm a payment
   */
  confirmPayment: async (paymentIntentId: string): Promise<Transaction> => {
    try {
      const response = await apiClient.post<Transaction>(`/payments/confirm/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error confirming payment:', error);
      throw error;
    }
  },

  /**
   * Get transaction history for the current user
   */
  getTransactions: async (limit: number = 10, offset: number = 0): Promise<{transactions: Transaction[], total: number}> => {
    try {
      const response = await apiClient.get<{transactions: Transaction[], total: number}>('/payments/transactions', {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  /**
   * Get a specific transaction
   */
  getTransaction: async (id: string): Promise<Transaction> => {
    try {
      const response = await apiClient.get<Transaction>(`/payments/transactions/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  },
  getOrCreateStripeCustomer: async (): Promise<{stripeCustomerId: string}> => {
    try {
      const response = await apiClient.get<{stripeCustomerId: string}>('/payments/stripe-customer');
      return response.data;
    } catch (error) {
      console.error('Error getting Stripe customer ID:', error);
      throw error;
    }
  },
};

export default PaymentAPI;