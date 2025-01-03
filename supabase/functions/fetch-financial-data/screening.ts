import { corsHeaders } from './utils';

interface ScreeningCriteria {
  metrics: Array<{
    id: string;
    min?: string;
    max?: string;
  }>;
  countries?: string[];
  industries?: string[];
  exchanges?: string[];
  page?: number;
}

export const handleScreening = async (
  apiKey: string,
  criteria: ScreeningCriteria
) => {
  const STOCKS_PER_PAGE = 50;
  const page = criteria.page || 0;

  try {
    // Build base URL with pagination
    let url = `https://financialmodelingprep.com/api/v3/stock-screener?apikey=${apiKey}&limit=${STOCKS_PER_PAGE}&offset=${page * STOCKS_PER_PAGE}`;

    // Add filtering parameters
    if (criteria.countries?.length) {
      url += `&country=${criteria.countries.join(',')}`;
    }
    
    if (criteria.industries?.length) {
      url += `&sector=${criteria.industries.join(',')}`;
    }
    
    if (criteria.exchanges?.length) {
      url += `&exchange=${criteria.exchanges.join(',')}`;
    }

    // Add metric filters
    if (criteria.metrics?.length) {
      criteria.metrics.forEach(metric => {
        if (metric.min) {
          url += `&${metric.id}_more_than=${metric.min}`;
        }
        if (metric.max) {
          url += `&${metric.id}_less_than=${metric.max}`;
        }
      });
    }

    console.log('Fetching screening data from URL:', url);
    const screeningResponse = await fetch(url);
    const screeningData = await screeningResponse.json();

    // Get additional company details for the screened stocks
    const symbols = screeningData.map((stock: any) => stock.symbol).join(',');
    if (symbols) {
      const detailsUrl = `https://financialmodelingprep.com/api/v3/profile/${symbols}?apikey=${apiKey}`;
      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      // Combine screening and company details data
      const enrichedData = screeningData.map((stock: any) => {
        const details = detailsData.find((d: any) => d.symbol === stock.symbol);
        return {
          ...stock,
          ...details
        };
      });

      return {
        data: enrichedData,
        page,
        hasMore: enrichedData.length === STOCKS_PER_PAGE
      };
    }

    return {
      data: [],
      page,
      hasMore: false
    };
  } catch (error) {
    console.error('Screening error:', error);
    throw error;
  }
};