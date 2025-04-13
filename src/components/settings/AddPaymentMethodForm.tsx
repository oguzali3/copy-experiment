// src/components/settings/AddPaymentMethodForm.tsx
import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/loaders";
import { toast } from "sonner";
import PaymentAPI from "@/services/paymentApi";

interface AddPaymentMethodFormProps {
  onSuccess: () => void;
  user?: any;
}

const AddPaymentMethodForm = ({ onSuccess, user }: AddPaymentMethodFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  // Add debug logging
  console.log('Stripe object loaded:', !!stripe);
  console.log('Card Element rendered');
  console.log('Current user:', user);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
  
    if (!stripe || !elements) {
      console.log('Stripe not initialized properly');
      setError('Stripe is not initialized properly');
      return;
    }
  
    setProcessing(true);
    setError(null);
  
    try {
      // Create the payment method with Stripe
      const cardElement = elements.getElement(CardElement);
      
      if (!cardElement) {
        throw new Error('Card element not found');
      }
  
      console.log('Creating payment method...');
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });
  
      if (stripeError) {
        console.error('Stripe error creating payment method:', stripeError);
        throw new Error(stripeError.message);
      }
  
      console.log('Payment method created:', paymentMethod);
      
      // Get or create a Stripe customer ID
      const { stripeCustomerId } = await PaymentAPI.getOrCreateStripeCustomer();
      
      // Add payment method with the customer ID
      const response = await PaymentAPI.addPaymentMethod({
        paymentToken: paymentMethod.id,
        type: 'CREDIT_CARD',
        stripeCustomerId: stripeCustomerId,
        userId: user?.id // Include userId explicitly
      });
      
      console.log('Payment method added successfully:', response);
      toast.success('Payment method added successfully');
      onSuccess();
    } catch (err: any) {
      console.error('Error adding payment method:', err);
      setError(err.message || 'An error occurred while adding your payment method');
      toast.error('Failed to add payment method');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="p-4 border rounded-lg" style={{ minHeight: '60px' }}>
        <CardElement
          options={{
            style: {
              base: {
                fontSize: '16px',
                color: '#424770',
                fontFamily: 'Arial, sans-serif',
                '::placeholder': {
                  color: '#aab7c4',
                },
                ':-webkit-autofill': {
                  color: '#424770',
                },
                padding: '10px',
              },
              invalid: {
                color: '#9e2146',
              },
            },
            hidePostalCode: true,
          }}
          onChange={(e) => {
            console.log('Card element change:', e);
            if (e.error) console.error('Card element error:', e.error);
          }}
          onFocus={() => console.log('Card element focus')}
          onBlur={() => console.log('Card element blur')}
          onReady={() => console.log('Card element ready')}
        />
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      <Button 
        type="submit" 
        disabled={!stripe || processing} 
        className="w-full"
      >
        {processing ? <Spinner size="sm" /> : 'Add Payment Method'}
      </Button>
    </form>
  );
};

export default AddPaymentMethodForm;