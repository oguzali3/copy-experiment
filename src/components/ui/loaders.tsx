// src/components/ui/loaders.tsx
import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
  label?: string;
}

export const Spinner = ({ 
  size = 'md', 
  className, 
  label 
}: SpinnerProps) => {
  const sizeMap = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn(
        "animate-spin text-blue-500", 
        sizeMap[size]
      )} />
      {label && (
        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
          {label}
        </span>
      )}
    </div>
  );
};

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangle' | 'circle' | 'avatar' | 'feed-post';
  count?: number;
}

export const Skeleton = ({ 
  className, 
  variant = 'rectangle',
  count = 1
}: SkeletonProps) => {
  const baseClass = "animate-pulse bg-gray-200 dark:bg-gray-700";
  
  const variantClass = {
    text: "h-4 rounded w-3/4",
    rectangle: "h-32 rounded-md w-full",
    circle: "h-8 w-8 rounded-full",
    avatar: "h-10 w-10 rounded-full",
    'feed-post': "h-auto rounded-md w-full"
  };

  const renderFeedPostSkeleton = () => (
    <div className={cn("p-4", className)}>
      <div className="flex gap-3">
        <div className={cn(baseClass, "h-10 w-10 rounded-full")} />
        <div className="flex-1">
          <div className="flex gap-2 items-center">
            <div className={cn(baseClass, "h-4 w-24 rounded")} />
            <div className={cn(baseClass, "h-3 w-20 rounded")} />
          </div>
          <div className="mt-3">
            <div className={cn(baseClass, "h-4 w-full rounded mb-2")} />
            <div className={cn(baseClass, "h-4 w-3/4 rounded")} />
          </div>
          <div className="mt-4 flex gap-4">
            <div className={cn(baseClass, "h-6 w-16 rounded")} />
            <div className={cn(baseClass, "h-6 w-16 rounded")} />
          </div>
        </div>
      </div>
    </div>
  );

  const items = [];
  
  for (let i = 0; i < count; i++) {
    if (variant === 'feed-post') {
      items.push(
        <div key={i} className="mb-4">
          {renderFeedPostSkeleton()}
        </div>
      );
    } else {
      items.push(
        <div 
          key={i} 
          className={cn(
            baseClass,
            variantClass[variant],
            i < count - 1 ? "mb-2" : "",
            className
          )} 
        />
      );
    }
  }

  return <>{items}</>;
};

interface LoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  spinnerSize?: SpinnerProps['size'];
  spinnerLabel?: string;
  overlay?: boolean;
  showAfterMs?: number;
}

export const LoadingState = ({
  loading,
  children,
  fallback,
  spinnerSize = 'md',
  spinnerLabel,
  overlay = false,
  showAfterMs = 500
}: LoadingStateProps) => {
  const [showSpinner, setShowSpinner] = React.useState(false);
  
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (loading) {
      // Only show spinner after delay to avoid flashing
      timeout = setTimeout(() => {
        setShowSpinner(true);
      }, showAfterMs);
    } else {
      setShowSpinner(false);
    }
    
    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [loading, showAfterMs]);
  
  if (!loading) return <>{children}</>;
  
  if (overlay) {
    return (
      <div className="relative">
        {children}
        {showSpinner && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center rounded-md z-10">
            <Spinner size={spinnerSize} label={spinnerLabel} />
          </div>
        )}
      </div>
    );
  }
  
  if (showSpinner) {
    return fallback || (
      <div className="flex items-center justify-center py-8">
        <Spinner size={spinnerSize} label={spinnerLabel} />
      </div>
    );
  }
  
  // Return invisible placeholder while waiting for delay
  return <div className="invisible">{children}</div>;
};

interface RetryMessageProps {
  message: string;
  description?: string;
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

export const RetryMessage = ({
  message,
  description,
  onRetry,
  retrying = false,
  className
}: RetryMessageProps) => {
  return (
    <div className={cn("p-4 bg-red-50 dark:bg-red-900/10 rounded-md", className)}>
      <div className="text-red-600 dark:text-red-400 font-medium mb-2">
        {message}
      </div>
      
      {description && (
        <p className="text-red-500 dark:text-red-300 text-sm mb-3">
          {description}
        </p>
      )}
      
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="flex items-center gap-2 text-sm bg-white dark:bg-gray-800 px-3 py-1.5 rounded border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
        >
          {retrying ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </>
          )}
        </button>
      )}
    </div>
  );
};