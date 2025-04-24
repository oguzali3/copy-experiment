import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Content-Type': 'application/json'
  }

// New Edge Function specifically for fetching stock prices by date range
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 204
    });
  }

  try {
    const { symbol, startDate, endDate } = await req.json();
    const apiKey = Deno.env.get("FMP_API_KEY");

    if (!apiKey) {
      throw new Error("FMP_API_KEY is not set");
    }

    // Validate required parameters
    if (!symbol) {
      throw new Error("Symbol is required");
    }
    
    if (!startDate || !endDate) {
      throw new Error("Both startDate and endDate are required");
    }

    // Format dates as YYYY-MM-DD if they're not already
    const formatDateString = (dateString) => {
      if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return dateString; // Already in YYYY-MM-DD format
      }
      
      // Check if it's just a year (e.g., "2020")
      if (dateString.match(/^\d{4}$/)) {
        return `${dateString}-01-01`; // Use January 1st of that year
      }
      
      try {
        // Try to parse and format the date
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
      } catch (e) {
        throw new Error(`Invalid date format: ${dateString}`);
      }
    };

    const formattedStartDate = formatDateString(startDate);
    const formattedEndDate = formatDateString(endDate);

    console.log(`Fetching historical prices for ${symbol} from ${formattedStartDate} to ${formattedEndDate}`);

    // Build the URL for fetching historical prices by date range
    const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?from=${formattedStartDate}&to=${formattedEndDate}&apikey=${apiKey}`;
    
    console.log(`Fetching data from URL: ${url}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    
    // Transform the data to match the expected format
    const transformedData = transformPriceData(data, symbol);
    
    return new Response(JSON.stringify(transformedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'An error occurred while processing your request'
      }), 
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Transform FMP historical price data to match the expected format in your application
function transformPriceData(data, symbol) {
  // Check if we have valid data
  if (!data || !data.historical || !Array.isArray(data.historical)) {
    console.warn('Received invalid data format from FMP API');
    return [];
  }
  
  // FMP returns data in descending order (newest first), but we want ascending
  const historicalData = [...data.historical].reverse();
  
  // Transform to expected format: { time: "YYYY-MM-DD", price: number }
  return historicalData.map(item => ({
    time: item.date,
    price: item.close,
    // Add additional fields that might be useful
    open: item.open,
    high: item.high,
    low: item.low,
    volume: item.volume
  }));
}