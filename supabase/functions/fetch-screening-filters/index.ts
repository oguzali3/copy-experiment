import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SCREENING_CONSTANTS = {
  COUNTRIES: [
    { code: 'US', name: 'United States', region: 'North America', currency: 'USD' },
    { code: 'TR', name: 'Turkey', region: 'Europe/Asia', currency: 'TRY' },
    { code: 'GB', name: 'United Kingdom', region: 'Europe', currency: 'GBP' },
    { code: 'JP', name: 'Japan', region: 'Asia', currency: 'JPY' },
    { code: 'CN', name: 'China', region: 'Asia', currency: 'CNY' },
    { code: 'DE', name: 'Germany', region: 'Europe', currency: 'EUR' },
    { code: 'IN', name: 'India', region: 'Asia', currency: 'INR' },
    { code: 'BR', name: 'Brazil', region: 'South America', currency: 'BRL' },
    { code: 'AU', name: 'Australia', region: 'Oceania', currency: 'AUD' },
    { code: 'CA', name: 'Canada', region: 'North America', currency: 'CAD' }
  ],
  INDUSTRIES: [
    { id: '10', name: 'Energy', description: 'Exploration & production of energy products.' },
    { id: '15', name: 'Materials', description: 'Manufacturing chemicals, construction materials, etc.' },
    { id: '20', name: 'Industrials', description: 'Capital goods, transportation services, etc.' },
    { id: '25', name: 'Consumer Discretionary', description: 'Retail, autos, consumer durables, and leisure products.' },
    { id: '30', name: 'Consumer Staples', description: 'Food, beverages, and household products.' },
    { id: '35', name: 'Healthcare', description: 'Pharmaceuticals, biotechnology, and healthcare providers.' },
    { id: '40', name: 'Financials', description: 'Banks, investment funds, and insurance companies.' },
    { id: '45', name: 'Information Technology', description: 'Software, hardware, and technology solutions.' },
    { id: '50', name: 'Telecommunication Services', description: 'Wireless, internet, and telecommunications.' },
    { id: '55', name: 'Utilities', description: 'Electricity, water, and gas distribution.' },
    { id: '60', name: 'Real Estate', description: 'Property development and real estate investments.' }
  ],
  EXCHANGES: [
    { code: 'NYSE', name: 'New York Stock Exchange', country: 'US', timezone: 'America/New_York' },
    { code: 'NASDAQ', name: 'NASDAQ Stock Market', country: 'US', timezone: 'America/New_York' },
    { code: 'LSE', name: 'London Stock Exchange', country: 'GB', timezone: 'Europe/London' },
    { code: 'TSE', name: 'Tokyo Stock Exchange', country: 'JP', timezone: 'Asia/Tokyo' },
    { code: 'SSE', name: 'Shanghai Stock Exchange', country: 'CN', timezone: 'Asia/Shanghai' },
    { code: 'BSE', name: 'Bombay Stock Exchange', country: 'IN', timezone: 'Asia/Kolkata' },
    { code: 'TSX', name: 'Toronto Stock Exchange', country: 'CA', timezone: 'America/Toronto' },
    { code: 'ASX', name: 'Australian Securities Exchange', country: 'AU', timezone: 'Australia/Sydney' },
    { code: 'BMFBOVESPA', name: 'B3 (Brasil Bolsa Balcão)', country: 'BR', timezone: 'America/Sao_Paulo' },
    { code: 'DAX', name: 'Deutsche Börse (Frankfurt)', country: 'DE', timezone: 'Europe/Berlin' }
  ]
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    return new Response(
      JSON.stringify(SCREENING_CONSTANTS),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});