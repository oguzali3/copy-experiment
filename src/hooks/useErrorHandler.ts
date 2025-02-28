/* eslint-disable @typescript-eslint/no-explicit-any */
// src/hooks/useErrorHandler.ts
import { toast } from 'sonner';

type ErrorCategory = 'network' | 'auth' | 'data' | 'upload' | 'action' | 'unknown';

interface ErrorHandlerOptions {
  silent?: boolean;
  retry?: () => Promise<any>;
  fallback?: any;
  context?: string;
}

export const useErrorHandler = () => {
  const handleError = (
    error: any, 
    category: ErrorCategory = 'unknown',
    options: ErrorHandlerOptions = {}
  ) => {
    // Log all errors to console with context
    console.error(
      `Error [${category}]${options.context ? ` in ${options.context}` : ''}:`, 
      error
    );
    
    // Prepare user-friendly message based on error type
    let userMessage = 'Something went wrong. Please try again.';
    
    // Parse different error types
    if (error?.graphQLErrors?.length) {
      // Handle GraphQL errors
      const graphQLError = error.graphQLErrors[0];
      
      if (graphQLError.extensions?.code === 'UNAUTHENTICATED') {
        userMessage = 'Your session has expired. Please sign in again.';
        // Could trigger auth refresh here
      } else if (graphQLError.message) {
        userMessage = graphQLError.message;
      }
    } else if (error?.networkError) {
      // Handle network errors
      userMessage = 'Network error. Please check your connection and try again.';
    } else if (error instanceof Error) {
      // Use the error message if it's a standard Error
      userMessage = error.message;
    }
    
    // Don't show toast if silent mode is requested
    if (!options.silent) {
      // Toast with different styling based on category
      switch (category) {
        case 'auth':
          toast.error(userMessage, {
            description: 'Please sign in to continue.',
            action: {
              label: 'Sign In',
              onClick: () => window.location.href = '/signin'
            }
          });
          break;
        
        case 'network':
          toast.error(userMessage, {
            description: 'Check your connection and try again.',
            action: options.retry ? {
              label: 'Retry',
              onClick: options.retry
            } : undefined
          });
          break;
        
        case 'upload':
          toast.error(userMessage, {
            description: 'Try uploading a smaller file or in a different format.'
          });
          break;
          
        default:
          toast.error(userMessage, {
            action: options.retry ? {
              label: 'Retry',
              onClick: options.retry
            } : undefined
          });
      }
    }
    
    // Return fallback value if provided
    return options.fallback;
  };
  
  return { handleError };
};