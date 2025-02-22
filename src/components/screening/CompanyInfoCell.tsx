import React from 'react';
import { CountryFlag } from './CountryFlag';

interface CompanyInfoCellProps {
  companyName: string;
  exchange: string;
  country: string;
}

const CompanyInfoCell = ({ companyName, exchange, country }: CompanyInfoCellProps) => {
  return (
    <div className="flex flex-col gap-1">
      <div className="font-medium text-gray-900">{companyName || '-'}</div>
      <div className="flex items-center gap-3 text-sm text-gray-500">
        {country && (
          <div className="flex items-center gap-1.5">
            <CountryFlag countryCode={country} showName={false} size="sm" />
            <span>{country}</span>
          </div>
        )}
        {exchange && (
          <>
            <div className="w-1 h-1 rounded-full bg-gray-300" />
            <span>{exchange}</span>
          </>
        )}
      </div>
    </div>
  );
};

export default CompanyInfoCell;