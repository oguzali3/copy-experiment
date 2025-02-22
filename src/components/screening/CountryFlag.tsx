// src/components/CountryFlag.tsx
import React from 'react';
import { COUNTRIES } from "@/constants/marketFilters";

const FLAG_CDN_URL = "https://flagcdn.com/w20";

// Create lookup map for efficiency
const COUNTRY_MAP = COUNTRIES.reduce((acc, country) => {
  acc[country.code] = country.name;
  return acc;
}, {} as Record<string, string>);

interface CountryFlagProps {
  countryCode: string;
  showName?: boolean;
  size?: 'sm' | 'md';
}

export const CountryFlag = React.memo(({ 
  countryCode, 
  showName = true,
  size = 'md'
}: CountryFlagProps) => {
  if (!countryCode) return null;
  
  const code = countryCode.toLowerCase();
  const countryName = COUNTRY_MAP[countryCode] || countryCode;
  
  return (
    <div 
      className="flex items-center gap-2"
      title={countryName}
    >
      <img
        src={`${FLAG_CDN_URL}/${code}.png`}
        alt={`${countryName} flag`}
        className={`${size === 'sm' ? 'w-4' : 'w-5'} h-auto rounded-sm`}
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
      {showName && <span>{countryCode}</span>}
    </div>
  );
});