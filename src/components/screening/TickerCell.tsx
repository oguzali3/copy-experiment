import React, { useState, useEffect } from 'react';
import { Building2 } from 'lucide-react';
import { logoCache } from '@/services/LogoCache';

interface TickerCellProps {
  symbol: string;
  onClick: (symbol: string) => void;
}

export const TickerCell = React.memo(({ symbol, onClick }: TickerCellProps) => {
  const [hasLogo, setHasLogo] = useState<boolean | undefined>(logoCache.hasLogo(symbol));

  useEffect(() => {
    if (hasLogo === undefined) {
      logoCache.preloadLogo(symbol).then(setHasLogo);
    }
  }, [symbol, hasLogo]);

  return (
    <div className="flex items-center gap-2">
      {hasLogo ? (
        <img
          src={`${import.meta.env.VITE_URL}/company-logos/${encodeURIComponent(symbol)}`}
          alt={`${symbol} logo`}
          className="w-8 h-8 rounded object-contain bg-gray-50"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.onerror = null; // Prevent infinite loop
            setHasLogo(false);
          }}
        />
      ) : (
        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
          <Building2 className="w-5 h-5 text-gray-400" />
        </div>
      )}
      <button
        onClick={() => onClick(symbol)}
        className="font-medium text-blue-600 hover:text-blue-800 hover:underline flex items-center"
      >
        {symbol}
      </button>
    </div>
  );
});