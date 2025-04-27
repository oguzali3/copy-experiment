// Toggle debug mode (for troubleshooting)
const toggleDebug = () => {
  setDebug(!debug);
};import React, { useState, useEffect, useRef } from "react";
import { CompanySearch } from "@/components/CompanySearch";
import { TimeRangePanel } from "@/components/financials/TimeRangePanel";
import { MetricChart } from "@/components/financials/MetricChartforCharting";
import { FinancialDataTable } from "@/components/FinancialDataTable";
import { CategoryMetricsPanel, Metric } from"@/components/CategoryMetricsPanel";
import { metricCategories } from '@/data/metricCategories';
import { Button } from "@/components/ui/button";
import  ChartExport  from "@/components/financials/ChartExport";
import { getMetricDisplayName } from "@/utils/metricDefinitions";
import { ChartType } from '@/types/chartTypes';
import { X, BarChart3, LineChart, Cog, Eye, EyeOff, Move, Pencil, PencilOff } from "lucide-react";
import SelectedMetricsList from "@/components/SelectedMetricList";
import CombinedCompanyChart from "@/components/CombinedCompanyChart";
import CombinedFinancialTable from "@/components/CombinedFinancialTable";
import CombinedChartExport from "@/components/financials/CombinedChartExport";
import { supabase } from "@/integrations/supabase/client";

// Import updated time utilities
import { 
  calculatePercentageFromRange,
  calculateRangeFromPercentage,
extractTimePeriods, 
getDefaultTimePeriods, 
getDefaultTimeRange, 
getPeriodIdentifier 
} from '@/utils/timeUtils';
import SimplifiedChartExport from "@/components/financials/SimplifiedChartExport";

// API base URL
const API_BASE_URL = "http://localhost:4000/api/analysis";

// Define a new interface for company data
interface CompanyData {
  ticker: string;
  name: string;
  metricData: any[];
  priceData?: any[]; // Add this new property
  marketCapData?: any[]; // For market cap data
  marketData?: Record<string, any[]>; // New field for all market data types

  isLoading: boolean;
  error: string | null;
}


const Charting = () => {
// State for selected metrics
const [selectedMetrics, setSelectedMetrics] = useState<Metric[]>([]);

// Modified: State for selected companies (array instead of single company)
const [selectedCompanies, setSelectedCompanies] = useState<CompanyData[]>([]);

// State for view mode (single panel or by company)
const [viewMode, setViewMode] = useState<'byCompany' | 'single'>('byCompany');

const [metricTypes, setMetricTypes] = useState<Record<string, ChartType>>({});
const [selectedCategory, setSelectedCategory] = useState<string>("");

// State for metric visibility
const [metricVisibility, setMetricVisibility] = useState<Record<string, boolean>>({});

// State for metric data labels
const [metricLabels, setMetricLabels] = useState<Record<string, boolean>>({});

// State for metric statistics settings
const [metricSettings, setMetricSettings] = useState<Record<string, {
  average?: boolean;
  median?: boolean;
  min?: boolean;
  max?: boolean;
}>>({});

// State for period and time selection
const [period, setPeriod] = useState<'annual' | 'quarter'>('annual');
const hasPriceMetric = () => {
  return selectedMetrics.some(metric => metric.id === "price");
};
const isMarketDataMetric = (metricId: string) => {
  // List of all market data metrics
  const marketDataMetrics = [
    'price', 
    'marketCapDaily', 
    'peRatioDaily', 
    'psRatioDaily', 
    'pfcfRatioDaily', 
    'pcfRatioDaily', 
    'pbRatioDaily', 
    'fcfYieldDaily'
  ];
  
  return marketDataMetrics.includes(metricId);
};

// Get all selected market data metrics
const getSelectedMarketDataMetrics = () => {
  return selectedMetrics
    .filter(metric => isMarketDataMetric(metric.id))
    .map(metric => metric.id);
};

// Get market data for a specific metric and company
const getMarketData = (company: CompanyData, metricId: string) => {
  // Check if we have market data for this company and metric
  if (company.marketData && company.marketData[metricId]) {
    return company.marketData[metricId];
  }
  
  // For backward compatibility
  if (metricId === 'price' && company.priceData) {
    return company.priceData;
  }
  
  if (metricId === 'marketCapDaily' && company.marketCapData) {
    return company.marketCapData;
  }
  
  return [];
};
// Dynamic time periods
const [timePeriods, setTimePeriods] = useState<string[]>(getDefaultTimePeriods('annual'));
// Use computed default for slider value
const defaultPeriods = getDefaultTimePeriods('annual');
const [sliderValue, setSliderValue] = useState<[number, number]>(getDefaultTimeRange(defaultPeriods));

// Refs for chart and table
const chartContainerRef = useRef<HTMLDivElement>(null);
const fullExportRef = useRef<HTMLDivElement>(null);

const [chartTitle, setChartTitle] = useState<string>("");
const [userModifiedTimeRange, setUserModifiedTimeRange] = useState<boolean>(false);
const [timeRangePercentage, setTimeRangePercentage] = useState<[number, number]>([0, 100]);

// Debug flag to help troubleshooting
const [debug, setDebug] = useState<boolean>(false);

useEffect(() => {
  loadChartStateFromSession();
}, []);

const handleMetricSelect = (metric: Metric) => {
  if (!selectedMetrics.some(m => m.id === metric.id)) {
    setSelectedMetrics(prev => [...prev, metric]);
    // Set default visibility to true for new metrics
    setMetricVisibility(prev => ({
      ...prev,
      [metric.id]: true
    }));
    // Set default label visibility to true for new metrics
    setMetricLabels(prev => ({
      ...prev,
      [metric.id]: true
    }));
    // Initialize settings for new metric
    setMetricSettings(prev => ({
      ...prev,
      [metric.id]: {
        average: false,
        median: false,
        min: false,
        max: false
      }
    }));
  }
};

const handleRemoveMetric = (metricId: string) => {
  setSelectedMetrics(prev => prev.filter(m => m.id !== metricId));
  // Clean up all related state when removing a metric
  setMetricTypes(prev => {
    const newTypes = { ...prev };
    delete newTypes[metricId];
    return newTypes;
  });
  setMetricVisibility(prev => {
    const newVisibility = { ...prev };
    delete newVisibility[metricId];
    return newVisibility;
  });
  setMetricLabels(prev => {
    const newLabels = { ...prev };
    delete newLabels[metricId];
    return newLabels;
  });
  setMetricSettings(prev => {
    const newSettings = { ...prev };
    delete newSettings[metricId];
    return newSettings;
  });
};

// Modified: Handle company selection to add to array
const handleCompanySelect = (company: any) => {
  // Check if company is already selected
  if (selectedCompanies.some(c => c.ticker === company.ticker)) {
    // If already selected, don't add it again
    return;
  }

  // Add the new company to the array
  setSelectedCompanies(prev => [
    ...prev, 
    {
      ticker: company.ticker,
      name: company.name,
      metricData: [],
      isLoading: false,
      error: null
    }
  ]);
};

// New function to remove a company
const handleRemoveCompany = (ticker: string) => {
  setSelectedCompanies(prev => prev.filter(company => company.ticker !== ticker));
};

const handleSliderChange = (value: [number, number]) => {
  setSliderValue(value);
  setUserModifiedTimeRange(true);
  
  // Calculate and store the percentage values relative to the total range
  if (timePeriods.length > 1) {
    setTimeRangePercentage(calculatePercentageFromRange(value, timePeriods.length));
  }
};

const handleMetricTypeChange = (metric: string, type: ChartType) => {
  setMetricTypes(prev => ({
    ...prev,
    [metric]: type
  }));
};

const handleToggleVisibility = (metricId: string) => {
  setMetricVisibility(prev => ({ 
    ...prev, 
    [metricId]: !prev[metricId] 
  }));
};

const handleToggleLabels = (metricId: string) => {
  setMetricLabels(prev => ({
    ...prev,
    [metricId]: !prev[metricId]
  }));
};

const handleMetricSettingChange = (metricId: string, setting: string, value: boolean) => {
  setMetricSettings(prev => ({
    ...prev,
    [metricId]: {
      ...prev[metricId],
      [setting]: value
    }
  }));
};

const handleCategorySelect = (categoryId: string) => {
  setSelectedCategory(categoryId);
};
const handleReorderMetrics = (reorderedMetrics: Metric[]) => {
  setSelectedMetrics(reorderedMetrics);
};
const handlePeriodChange = (newPeriod: 'annual' | 'quarter') => {
  // Clear existing data when switching period types
  setSelectedCompanies(prev => prev.map(company => ({
    ...company,
    metricData: []
  })));
  
  setPeriod(newPeriod);
  
  // Reset time periods to defaults for the new period type
  const defaultPeriods = getDefaultTimePeriods(newPeriod);
  setTimePeriods(defaultPeriods);
  
  // Set slider to show the default time range (5 years)
  setSliderValue(getDefaultTimeRange(defaultPeriods));
  
  // Reset user modification flag since we're explicitly changing the period type
  setUserModifiedTimeRange(false);
};
// Function to save the current chart state to session storage
const saveChartStateToSession = () => {
  // Create an object with all the state you want to preserve
  const chartState = {
    selectedCompanies,
    selectedMetrics,
    metricTypes,
    metricVisibility,
    metricLabels,
    metricSettings,
    period,
    sliderValue,
    viewMode
  };
  
  // Save it to session storage
  sessionStorage.setItem('chartingState', JSON.stringify(chartState));
};

// Function to load the chart state from session storage
const loadChartStateFromSession = () => {
  try {
    // Get the saved state from session storage
    const savedState = sessionStorage.getItem('chartingState');
    
    // If there's saved state, parse it and restore all state variables
    if (savedState) {
      const parsedState = JSON.parse(savedState);
      
      // Restore your state variables
      setSelectedCompanies(parsedState.selectedCompanies || []);
      setSelectedMetrics(parsedState.selectedMetrics || []);
      setMetricTypes(parsedState.metricTypes || {});
      setMetricVisibility(parsedState.metricVisibility || {});
      setMetricLabels(parsedState.metricLabels || {});
      setMetricSettings(parsedState.metricSettings || {});
      setPeriod(parsedState.period || 'annual');
      setSliderValue(parsedState.sliderValue || [0, 4]);
      setViewMode(parsedState.viewMode || 'byCompany');
      
      return true; // Indicate successful loading
    }
    
    return false; // No saved state found
  } catch (error) {
    console.error('Error loading chart state:', error);
    return false;
  }
};
// Add an effect to save the state when it changes
useEffect(() => {
  // Only save if there's meaningful data
  if (selectedCompanies.length > 0 || selectedMetrics.length > 0) {
    saveChartStateToSession();
  }
}, [
  selectedCompanies, 
  selectedMetrics, 
  metricTypes, 
  metricVisibility, 
  metricLabels, 
  metricSettings, 
  period, 
  sliderValue,
  viewMode
]);
// Initialize chart type for new metrics
useEffect(() => {
  const newMetricTypes = { ...metricTypes };
  selectedMetrics.forEach(metric => {
    if (!newMetricTypes[metric.id]) {
      newMetricTypes[metric.id] = metric.name.toLowerCase().includes('margin') ? 'line' : 'bar';
    }
  });
  setMetricTypes(newMetricTypes);
}, [selectedMetrics]);
const fetchPriceData = async (ticker: string) => {
  // Update loading state for this company
  const companyIndex = selectedCompanies.findIndex(c => c.ticker === ticker);
  if (companyIndex === -1) return;
  
  setSelectedCompanies(prev => {
    const updatedCompanies = [...prev];
    updatedCompanies[companyIndex] = {
      ...updatedCompanies[companyIndex],
      isLoading: true
    };
    return updatedCompanies;
  });
  
  try {
    // Get the periods we want to display based on slider
    const selectedPeriods = timePeriods.slice(sliderValue[0], sliderValue[1] + 1);
    
    if (debug) {
      console.log('Selected periods for price data:', selectedPeriods);
    }
    
    // Extract years from selected periods
    const years = selectedPeriods
      .map(period => {
        // Try direct year format first (e.g., "2022")
        const directYear = parseInt(period);
        if (!isNaN(directYear)) return directYear;
        
        // Try to extract year from other formats (e.g., "Q1 2022")
        const match = period.match(/\b(20\d{2})\b/);
        return match ? parseInt(match[1]) : null;
      })
      .filter(year => year !== null);
    
    // If no valid years found, use a default timeframe
    if (years.length === 0) {
      console.warn("No valid years found in selected periods, using default timeframe");
      return fetchPriceDataWithDefaultTimeframe(ticker);
    }
    
    // Find min and max years
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    if (debug) {
      console.log(`Using year range: ${minYear} to ${maxYear}`);
    }
    
    // Convert years to full dates
    // Start on January 1st of the min year, end on December 31st of the max year
    const startDate = `${minYear}-01-01`;
    const endDate = `${maxYear}-12-31`;
    
    return fetchPriceDataFromBackend(ticker, startDate, endDate);
  } catch (err) {
    console.error(`Error in fetchPriceData for ${ticker}:`, err);
    
    // Update error state for this company
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          isLoading: false,
          error: `Failed to fetch price data: ${err.message}`
        };
      }
      
      return updatedCompanies;
    });
    
    return null;
  }
};

// New method to fetch price data from our backend API
const fetchPriceDataFromBackend = async (ticker: string, startDate: string, endDate: string) => {
  try {

      console.log(`Fetching price data for ${ticker} from ${startDate} to ${endDate}`);

    
    // Call our new backend API endpoint
    const url = `${API_BASE_URL}/market-data/${ticker}?metric=price&startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch price data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (debug) {
      console.log(`Fetched ${data.length} price data points for ${ticker} using backend API`);
    }
    
    // Process the data to match the expected format
    const processedData = data.map(item => ({
      time: item.date,
      price: item.value,
      // Add other fields if available
      open: item.open,
      high: item.high,
      low: item.low,
      volume: item.volume
    }));
    
    // Store the price data in the company object
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          priceData: processedData,
          isLoading: false
        };
      }
      
      return updatedCompanies;
    });
    
    return processedData;
  } catch (err) {
    console.error(`Error fetching price data from backend for ${ticker}:`, err);
    
    // If backend method fails, fall back to the timeframe method
    console.log(`Falling back to timeframe method for ${ticker}`);
    return fetchPriceDataWithDefaultTimeframe(ticker);
  }
};

// Method for fallback using a default timeframe
const fetchPriceDataWithDefaultTimeframe = async (ticker: string) => {
  try {
    // Use a default timeframe (last 5 years)
    const timeframe = "5Y";
    
    if (debug) {
      console.log(`Fetching price data for ${ticker} with default timeframe ${timeframe}`);
    }
    
    // Call the existing edge function as a fallback
    const { data, error } = await supabase.functions.invoke('fetch-stock-chart', {
      body: { symbol: ticker, timeframe }
    });
    
    if (error) throw error;
    
    if (debug) {
      console.log(`Fetched ${data.length} price data points for ${ticker} using edge function fallback`);
    }
    
    // Store the price data in the company object
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          priceData: data,
          isLoading: false
        };
      }
      
      return updatedCompanies;
    });
    
    return data;
  } catch (err) {
    console.error(`Error fetching price data for ${ticker} using fallback:`, err);
    
    // Update error state for this company
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          isLoading: false,
          error: `Failed to fetch price data: ${err.message}`
        };
      }
      
      return updatedCompanies;
    });
    
    return null;
  }
};

// Keep the original timeframe function entirely unchanged
const fetchPriceDataWithTimeframe = async (ticker: string, timeframe: string) => {
  try {
    // Call your existing API endpoint - No changes to this part
    const { data, error } = await supabase.functions.invoke('fetch-stock-chart', {
      body: { symbol: ticker, timeframe }
    });
    
    if (error) throw error;
    
    if (debug) {
      console.log(`Fetched ${data.length} price data points for ${ticker} with timeframe ${timeframe}`);
    }
    
    // Store the price data in the company object
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          priceData: data,
          isLoading: false
        };
      }
      
      return updatedCompanies;
    });
    
    return data;
  } catch (err) {
    console.error(`Error fetching price data for ${ticker}:`, err);
    
    // Update error state for this company
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          isLoading: false,
          error: `Failed to fetch price data: ${err.message}`
        };
      }
      
      return updatedCompanies;
    });
    
    return null;
  }
};

// Add this effect to refetch price data when the time range changes
useEffect(() => {
  // Only refetch if we have companies, price metric is selected, and sliderValue has changed
  if (selectedCompanies.length > 0 && hasPriceMetric()) {
    // Re-fetch price data for each company
    selectedCompanies.forEach(company => {
      fetchPriceData(company.ticker);
    });
  }
}, [sliderValue, timePeriods]);
// Add an additional effect to fetch price data when price metric is selected
useEffect(() => {
  // If price metric is selected and we have companies
  if (hasPriceMetric() && selectedCompanies.length > 0) {
    // Fetch price data for each company
    selectedCompanies.forEach(company => {
      // Only fetch if we don't already have price data for this company
      if (!company.priceData) {
        fetchPriceData(company.ticker);
      }
    });
  }
}, [hasPriceMetric()]);
const fetchMarketDataFromBackend = async (ticker: string, metricId: string, startDate: string, endDate: string) => {
  try {
    console.log(`Fetching ${metricId} data for ${ticker} from ${startDate} to ${endDate}`);

    // Call our backend API endpoint
    const url = `${API_BASE_URL}/market-data/${ticker}?metric=${metricId}&startDate=${startDate}&endDate=${endDate}`;
    const response = await fetch(url);
    console.log(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${metricId} data: ${response.statusText}`);
    }
    
    const data = await response.json();
    // Process the data to match the expected format
    const processedData = data.map(item => ({
      time: item.date,
      [metricId]: item.value, // Store under the metric ID key
      // Keep other fields as well if they exist
      date: item.date,
      value: item.value,
      // Add any additional properties that might be in the response

    }));
    console.log(processedData);

    // Store the data in the company object
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        // Create or update the marketData object
        const currentMarketData = updatedCompanies[companyIndex].marketData || {};
        
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          marketData: {
            ...currentMarketData,
            [metricId]: processedData
          },
          isLoading: false
        };
        
        // For backward compatibility, also update specific fields
        if (metricId === 'price') {
          updatedCompanies[companyIndex].priceData = processedData;
        } else if (metricId === 'marketCapDaily') {
          updatedCompanies[companyIndex].marketCapData = processedData;
        }
      }
      
      return updatedCompanies;
    });
    
    return processedData;
  } catch (err) {
    console.error(`Error fetching ${metricId} data from backend for ${ticker}:`, err);
    
    // Update error state for this company
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          isLoading: false,
          error: `Failed to fetch ${metricId} data: ${err.message}`
        };
      }
      
      return updatedCompanies;
    });
    
    return null;
  }
};
const fetchMarketData = async (ticker: string, metricId: string) => {
  // Update loading state for this company
  const companyIndex = selectedCompanies.findIndex(c => c.ticker === ticker);
  if (companyIndex === -1) return;
  
  setSelectedCompanies(prev => {
    const updatedCompanies = [...prev];
    updatedCompanies[companyIndex] = {
      ...updatedCompanies[companyIndex],
      isLoading: true
    };
    return updatedCompanies;
  });
  
  try {
    // Get the periods we want to display based on slider
    const selectedPeriods = timePeriods.slice(sliderValue[0], sliderValue[1] + 1);
    
    // Extract years from selected periods
    const years = selectedPeriods
      .map(period => {
        // Try direct year format first (e.g., "2022")
        const directYear = parseInt(period);
        if (!isNaN(directYear)) return directYear;
        
        // Try to extract year from other formats (e.g., "Q1 2022")
        const match = period.match(/\b(20\d{2})\b/);
        return match ? parseInt(match[1]) : null;
      })
      .filter(year => year !== null);
    
    // If no valid years found, use a default timeframe
    if (years.length === 0) {
      console.warn(`No valid years found in selected periods for ${metricId}, using default timeframe`);
      
      // For price, we have an existing fallback
      if (metricId === 'price') {
        return fetchPriceDataWithDefaultTimeframe(ticker);
      }
      
      // For other metrics, use a default date range
      const now = new Date();
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(now.getFullYear() - 5);
      
      const startDate = fiveYearsAgo.toISOString().split('T')[0];
      const endDate = now.toISOString().split('T')[0];
      
      return fetchMarketDataFromBackend(ticker, metricId, startDate, endDate);
    }
    
    // Find min and max years
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    // Convert years to full dates
    console.log(maxYear)
    const startDate = `${minYear}-01-01`;
    let endDate = `${maxYear}-12-31`;
    if (maxYear=== 2024 || maxYear=== 2025 ){ 
      const now = new Date();

      endDate = now.toISOString().split('T')[0];
  }

    return fetchMarketDataFromBackend(ticker, metricId, startDate, endDate);
  } catch (err) {
    console.error(`Error in fetchMarketData for ${ticker} (${metricId}):`, err);
    
    // Update error state for this company
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          isLoading: false,
          error: `Failed to fetch ${metricId} data: ${err.message}`
        };
      }
      
      return updatedCompanies;
    });
    
    return null;
  }
};


// Modified: Fetch data for all companies
const fetchMetricData = async (companyIndex: number) => {
  const company = selectedCompanies[companyIndex];
  
  if (!company || !company.ticker || selectedMetrics.length === 0) return;
  
  // Update loading state for this company
  setSelectedCompanies(prev => {
    const updatedCompanies = [...prev];
    updatedCompanies[companyIndex] = {
      ...updatedCompanies[companyIndex],
      isLoading: true,
      error: null
    };
    return updatedCompanies;
  });
  
  try {
    // Fetch data for each selected metric (except price which is handled separately)
    const promises = selectedMetrics
    .filter(metric => !isMarketDataMetric(metric.id))
    .map(async (metric) => {
        const mappedPeriod = period === 'quarter' ? 'quarter' : 'annual';
        // Add a limit parameter to ensure we get enough years of data
        const url = `${API_BASE_URL}/metric-data/${company.ticker}?metric=${metric.id}&period=${mappedPeriod}&limit=15`;        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch ${metric.name}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (debug) {
          console.log(`Fetched data for ${company.ticker} - ${metric.id}:`, data);
        }
        
        return {
          metricId: metric.id,
          data
        };
      });
    
    const results = await Promise.all(promises);
    
    // Extract time periods from the first result that has data
    let extractedPeriods: string[] = [];
    for (const result of results) {
      if (result.data && result.data.length > 0) {
        // Extract and set the time periods dynamically
        extractedPeriods = extractTimePeriods(result.data, period);
        if (extractedPeriods.length > 0) {
          if (debug) {
            console.log(`Extracted ${extractedPeriods.length} ${period} periods:`, extractedPeriods);
          }
          
          // Check if the array content actually changed before updating
          const periodsChanged = 
            timePeriods.length !== extractedPeriods.length ||
            !timePeriods.every((p, i) => p === extractedPeriods[i]);
          
          if (periodsChanged) {
            setTimePeriods(extractedPeriods);
            
            // If the user hasn't modified the time range yet, use the default range (5 years)
            if (!userModifiedTimeRange || timePeriods.length === 0) {
              setSliderValue(getDefaultTimeRange(extractedPeriods));
            } else {
              // Apply the saved percentage range to the new periods array
              setSliderValue(calculateRangeFromPercentage(timeRangePercentage, extractedPeriods));
            }
          }
          break;
        }
      }
    }
    
    // If no time periods could be extracted, use default
    if (extractedPeriods.length === 0) {
      extractedPeriods = getDefaultTimePeriods(period);
      setTimePeriods(extractedPeriods);
      setSliderValue([0, extractedPeriods.length - 1]);
    }
    
    // Process and combine the data
    const processedData: any[] = [];
    
    // Create data points for each period
    extractedPeriods.forEach(periodId => {
      const dataPoint: any = { period: periodId };
      const metrics: any[] = [];
      
      // Add metrics data for this period
      results.forEach(result => {
        const metricData = result.data.find((item: any) => {
          // Special case for TTM
          if (item.period === 'TTM' && periodId === 'TTM') {
            return true;
          }
          
          // Get period identifier from date
          const itemPeriodId = getPeriodIdentifier(item.date, period, item.period);
          return itemPeriodId === periodId;
        });
        
        if (metricData) {
          metrics.push({
            name: result.metricId,
            value: parseFloat(metricData.value) || 0
          });
        }
      });
      
      dataPoint.metrics = metrics;
      processedData.push(dataPoint);
    });
    
    if (debug) {
      console.log(`Processed data for ${company.ticker}:`, processedData);
    }
    
    // Update the company's metric data
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      updatedCompanies[companyIndex] = {
        ...updatedCompanies[companyIndex],
        metricData: processedData,
        isLoading: false,
        error: null
      };
      return updatedCompanies;
    });
    
  } catch (err: any) {
    const errorMessage = err instanceof Error ? err.message : 'An error occurred';
    console.error(`Error fetching metric data for ${company.ticker}:`, err);
    
    // Update error state for this company
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      updatedCompanies[companyIndex] = {
        ...updatedCompanies[companyIndex],
        isLoading: false,
        error: errorMessage
      };
      return updatedCompanies;
    });
  }
};
const fetchMarketCapData = async (ticker: string) => {
  // Update loading state for this company
  const companyIndex = selectedCompanies.findIndex(c => c.ticker === ticker);
  if (companyIndex === -1) return;
  
  setSelectedCompanies(prev => {
    const updatedCompanies = [...prev];
    updatedCompanies[companyIndex] = {
      ...updatedCompanies[companyIndex],
      isLoading: true
    };
    return updatedCompanies;
  });
  
  try {
    // Get the periods we want to display based on slider
    const selectedPeriods = timePeriods.slice(sliderValue[0], sliderValue[1] + 1);
    
    if (debug) {
      console.log('Selected periods for market cap data:', selectedPeriods);
    }
    
    // Extract years from selected periods
    const years = selectedPeriods
      .map(period => {
        // Try direct year format first (e.g., "2022")
        const directYear = parseInt(period);
        if (!isNaN(directYear)) return directYear;
        
        // Try to extract year from other formats (e.g., "Q1 2022")
        const match = period.match(/\b(20\d{2})\b/);
        return match ? parseInt(match[1]) : null;
      })
      .filter(year => year !== null);
    
    // If no valid years found, use a default timeframe
    if (years.length === 0) {
      console.warn("No valid years found in selected periods, using default timeframe");
      return null;
    }
    
    // Find min and max years
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    
    if (debug) {
      console.log(`Using year range: ${minYear} to ${maxYear}`);
    }
    
    // Convert years to full dates
    // Start on January 1st of the min year, end on December 31st of the max year
    const startDate = `${minYear}-01-01`;
    const endDate = `${maxYear}-12-31`;
    
    // Call our backend API endpoint
    const url = `${API_BASE_URL}/market-data/${ticker}?metric=marketcap&startDate=${startDate}&endDate=${endDate}`;
    
    if (debug) {
      console.log(`Fetching market cap data from: ${url}`);
    }
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch market cap data: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (debug) {
      console.log(`Fetched ${data.length} market cap data points for ${ticker}`);
    }
    
    // Process the data to match the expected format
    const processedData = data.map(item => ({
      time: item.date,
      marketCap: item.value,
      // Preserve any additional data
      price: item.price,
      numberOfShares: item.numberOfShares
    }));
    
    // Store the market cap data in the company object
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          marketCapData: processedData,
          isLoading: false
        };
      }
      
      return updatedCompanies;
    });
    return processedData;
  } catch (err) {
    console.error(`Error in fetchMarketCapData for ${ticker}:`, err);
    
    // Update error state for this company
    setSelectedCompanies(prev => {
      const updatedCompanies = [...prev];
      const companyIndex = updatedCompanies.findIndex(c => c.ticker === ticker);
      
      if (companyIndex !== -1) {
        updatedCompanies[companyIndex] = {
          ...updatedCompanies[companyIndex],
          isLoading: false,
          error: `Failed to fetch market cap data: ${err.message}`
        };
      }
      
      return updatedCompanies;
    });
    
    return null;
  }
};

// Check if a selected metric is a market cap metric
const hasMarketCapMetric = () => {
  return selectedMetrics.some(metric => metric.id === "marketCapDaily");
};
// Effect to fetch all market data metrics when they're selected
useEffect(() => {
  // Get all selected market data metrics
  const marketDataMetrics = getSelectedMarketDataMetrics();
  
  // If we have companies and market data metrics selected
  if (selectedCompanies.length > 0 && marketDataMetrics.length > 0) {
    // For each company
    selectedCompanies.forEach(company => {
      // For each market data metric
      marketDataMetrics.forEach(metricId => {
        // Check if we already have data for this metric
        const hasData = company.marketData && company.marketData[metricId];
        
        // Only fetch if we don't have data yet
        if (!hasData) {
          fetchMarketData(company.ticker, metricId);
        }
      });
    });
  }
}, [selectedMetrics, selectedCompanies.length]);

// Effect to refetch market data when time range changes
useEffect(() => {
  // Get all selected market data metrics
  const marketDataMetrics = getSelectedMarketDataMetrics();
  
  // Only refetch if we have companies and market data metrics selected
  if (selectedCompanies.length > 0 && marketDataMetrics.length > 0) {
    // For each company
    selectedCompanies.forEach(company => {
      // For each market data metric
      marketDataMetrics.forEach(metricId => {
        // Refetch data for the new time range
        fetchMarketData(company.ticker, metricId);
      });
    });
  }
}, [sliderValue, timePeriods]);
// Add a useEffect to fetch market cap data when selected
useEffect(() => {
  // If market cap metric is selected and we have companies
  if (hasMarketCapMetric() && selectedCompanies.length > 0) {
    // Fetch market cap data for each company
    selectedCompanies.forEach(company => {
      // Only fetch if we don't already have market cap data for this company
      if (!company.marketCapData) {
        fetchMarketCapData(company.ticker);
      }
    });
  }
}, [hasMarketCapMetric(), selectedCompanies.length]);
// Call fetchMetricData for each company when companies, metrics, or period changes
useEffect(() => {
  if (selectedCompanies.length > 0 && selectedMetrics.length > 0) {
    // Fetch data for each company
    selectedCompanies.forEach((_, index) => {
      fetchMetricData(index);
    });
  }
}, [selectedCompanies.length, selectedMetrics, period]);
useEffect(() => {
  // Only refetch if we have companies, market cap metric is selected, and sliderValue has changed
  if (selectedCompanies.length > 0 && hasMarketCapMetric()) {
    // Re-fetch market cap data for each company
    selectedCompanies.forEach(company => {
      fetchMarketCapData(company.ticker);
    });
  }
}, [sliderValue, timePeriods]);

// Transform financial data for the chart for a specific company
const getChartData = (companyData: any[]) => {
  if (!companyData || !companyData.length) {
    return null;
  }
  
  // Get the periods we want to display based on slider
  const selectedPeriods = timePeriods.slice(sliderValue[0], sliderValue[1] + 1);
  
  if (debug) {
    console.log('Selected periods:', selectedPeriods);
  }
  
  // Filter data based on the selected time range
  const filteredData = companyData.filter(item => {
    return selectedPeriods.includes(item.period);
  });
  
  if (debug) {
    console.log('Filtered data:', filteredData);
  }
  
  return filteredData;
};

// Get combined chart data for Single Panel view
const getCombinedChartData = () => {
  if (!selectedCompanies.length || !selectedMetrics.length) {
    return null;
  }
  
  // Get the periods we want to display based on slider
  const selectedPeriods = timePeriods.slice(sliderValue[0], sliderValue[1] + 1);
  
  // Create a map of all periods to ensure we have all time periods
  const periodsMap: Record<string, any> = {};
  selectedPeriods.forEach(period => {
    periodsMap[period] = { period };
  });
  
  // For each company, add their metrics to the corresponding periods
  selectedCompanies.forEach(company => {
    if (!company.metricData || !company.metricData.length) return;
    
    // Filter company data to selected periods
    const companyFilteredData = company.metricData.filter(item => 
      selectedPeriods.includes(item.period)
    );
    
    // For each period in this company's data
    companyFilteredData.forEach(dataPoint => {
      const periodKey = dataPoint.period;
      
      if (periodsMap[periodKey]) {
        // For each metric in this period
        dataPoint.metrics.forEach((metric: any) => {
          // Only include visible metrics
          if (metricVisibility[metric.name] !== false) {
            // Create a company-specific metric ID to avoid collision
            const companyMetricKey = `${company.ticker}_${metric.name}`;
            periodsMap[periodKey][companyMetricKey] = metric.value;
          }
        });
      }
    });
  });
  
  // Convert the periods map to an array
  const combinedData = Object.values(periodsMap);
  
  if (debug) {
    console.log('Combined chart data:', combinedData);
  }
  
  return combinedData;
};

// Get only visible metrics for chart
const getVisibleMetrics = () => {
  return selectedMetrics
    .filter(metric => metricVisibility[metric.id] !== false)
    .map(metric => metric.id);
};

// Get metrics that should be stacked
const getStackedMetrics = () => {
  return selectedMetrics
    .filter(metric => 
      metricVisibility[metric.id] !== false && 
      metricTypes[metric.id] === 'stacked'
    )
    .map(metric => metric.id);
};

// Check if we have metrics that should be stacked
const hasStackedMetrics = () => {
  const stackedMetrics = getStackedMetrics();
  // Only consider stacking when there are multiple metrics set to "stacked"
  return stackedMetrics.length >= 2;
};

// Get all data for the table (we want to show more historical data in the table)
const getTableData = (companyData: any[]) => {
  if (!companyData || !companyData.length) return null;
  
  // For annual data: last 9 years + TTM (if available)
  // For quarterly data: last 10 quarters
  const maxPeriods = period === 'annual' ? 10 : 10; // Adjust count as needed

  // First sort data chronologically (oldest to newest)
  let allData = [...companyData];
  
  const hasTTM = allData.some(item => item.period === 'TTM');
  
  // Special handling for TTM - remove it temporarily for sorting
  let ttmData = null;
  if (hasTTM) {
    ttmData = allData.find(item => item.period === 'TTM');
    allData = allData.filter(item => item.period !== 'TTM');
  }
  
  // Sort the non-TTM data
  allData.sort((a, b) => {
    if (period === 'annual') {
      // For annual data, sort by year
      return parseInt(a.period) - parseInt(b.period);
    } else {
      // For quarterly data, try to split the period into month and year
      try {
        const [monthA, yearA] = a.period.split(' ');
        const [monthB, yearB] = b.period.split(' ');
        
        // Compare years first
        const yearDiff = parseInt(yearA) - parseInt(yearB);
        if (yearDiff !== 0) return yearDiff;
        
        // If years are the same, compare months
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months.indexOf(monthA) - months.indexOf(monthB);
      } catch (e) {
        // Fallback to string comparison
        return a.period.localeCompare(b.period);
      }
    }
  });
  
  // Take at most the last N periods (excluding TTM)
  const limitedData = allData.slice(-maxPeriods);
  
  // Add TTM back at the end if it exists
  if (ttmData) {
    limitedData.push(ttmData);
  }
  
  return limitedData;
};

// Calculate statistics for metrics across a date range (for single panel view)
const calculateMetricStats = (companyTicker: string, metricId: string, companyData: any[]) => {
  if (!companyData || companyData.length === 0) {
    return { totalChange: null, cagr: null };
  }
  
  // Extract all values for this metric
  const metricValues: { period: string; value: number }[] = [];
  
  companyData.forEach(dataPoint => {
    const metricData = dataPoint.metrics?.find((m: any) => m.name === metricId);
    if (metricData && !isNaN(metricData.value)) {
      metricValues.push({
        period: dataPoint.period,
        value: typeof metricData.value === 'number' ? metricData.value : parseFloat(metricData.value)
      });
    }
  });
  
  // If we have at least two values, calculate change and CAGR
  if (metricValues.length >= 2) {
    // Sort chronologically
    metricValues.sort((a, b) => {
      if (a.period === 'TTM') return 1;
      if (b.period === 'TTM') return -1;
      return parseInt(a.period) - parseInt(b.period);
    });
    
    const startValue = metricValues[0].value;
    const endValue = metricValues[metricValues.length - 1].value;
    
    // Calculate total change percentage
    const totalChange = startValue !== 0 ? 
      ((endValue - startValue) / Math.abs(startValue)) * 100 : null;
    
    // Calculate years for CAGR
    let years = metricValues.length - 1; // Default to number of periods - 1
    
    // If periods are years, calculate actual years elapsed
    if (!isNaN(parseInt(metricValues[0].period)) && 
        !isNaN(parseInt(metricValues[metricValues.length - 1].period))) {
      years = parseInt(metricValues[metricValues.length - 1].period) - 
              parseInt(metricValues[0].period);
    }
    
    // Calculate CAGR only if values are positive
    const cagr = (startValue > 0 && endValue > 0 && years > 0) ? 
      calculateCAGR(startValue, endValue, years) : null;
    
    return { totalChange, cagr };
  }
  
  return { totalChange: null, cagr: null };
};

return (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h2 className="text-sm font-medium mb-2 text-gray-600">Metrics</h2>
        <div className="bg-white p-4 rounded-lg shadow-sm h-[400px]">
          <CategoryMetricsPanel 
            categories={metricCategories}
            onMetricSelect={handleMetricSelect}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      </div>
      <div>
        <h2 className="text-sm font-medium mb-2 text-gray-600">Search Companies</h2>
        <CompanySearch onCompanySelect={handleCompanySelect} />
        
        {/* Period Selection */}
        <div className="mt-4">
          <h2 className="text-sm font-medium mb-2 text-gray-600">Period</h2>
          <div className="flex space-x-2">
            <Button 
              variant={period === 'annual' ? 'default' : 'outline'}
              onClick={() => handlePeriodChange('annual')}
              className="flex-1"
            >
              Annual
            </Button>
            <Button 
              variant={period === 'quarter' ? 'default' : 'outline'}
              onClick={() => handlePeriodChange('quarter')}
              className="flex-1"
            >
              Quarterly
            </Button>
          </div>
        </div>
        
        {/* View Mode Selection & Selected Companies */}
        {selectedCompanies.length > 0 && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-sm font-medium text-gray-600">Selected Companies</h2>
              
              {/* View Mode Selector */}
              <div className="relative min-w-[140px]">
                <select 
                  className="w-full appearance-none bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value as 'single' | 'byCompany')}
                >
                  <option value="byCompany">By Company</option>
                  <option value="single">Single Panel</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 space-y-2">
              {selectedCompanies.map((company, index) => (
                <div 
                  key={company.ticker}
                  className="flex items-center justify-between p-2 bg-white rounded border border-gray-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{company.name}</span>
                    <span className="text-sm text-gray-500">({company.ticker})</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCompany(company.ticker)}
                    className="h-8 w-8 p-0"
                    title="Remove Company"
                  >
                    <X size={16} />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Selected Metrics */}
        {selectedMetrics.length > 0 && (
          <div className="mt-4">
            <h2 className="text-sm font-medium mb-2 text-gray-600">Selected Metrics</h2>
            <div className="bg-gray-50 rounded-lg p-3">
            <SelectedMetricsList
              metrics={selectedMetrics}
              ticker={selectedCompanies[0]?.ticker || ''}
              metricTypes={metricTypes}
              onMetricTypeChange={handleMetricTypeChange}
              onRemoveMetric={handleRemoveMetric}
              onToggleVisibility={handleToggleVisibility}
              onToggleLabels={handleToggleLabels}
              metricVisibility={metricVisibility}
              metricLabels={metricLabels}
              metricSettings={metricSettings}
              onMetricSettingChange={handleMetricSettingChange}
              onReorderMetrics={handleReorderMetrics}
            />
            </div>
            
            {/* Stacked metrics info message */}
            {getStackedMetrics().length === 1 && (
              <div className="mt-2 text-xs text-amber-600 px-1">
                Select at least one more metric as "stacked" to enable stacked bar chart
              </div>
            )}
          </div>
        )}
        
        {/* Debug toggle (hidden in UI) */}
        <div className="mt-4 text-right">
          <button 
            onClick={toggleDebug} 
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            {debug ? "Disable Debug" : "Enable Debug"}
          </button>
        </div>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-sm" ref={fullExportRef}>
      {!selectedCompanies.length && !selectedMetrics.length ? (
        <div className="text-center text-gray-500">
          <p>Select a company and metrics to start charting</p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Shared controls for all charts */}
          {selectedCompanies.length > 0 && selectedMetrics.length > 0 && (
            <>
              <div className="flex justify-between items-center">
                <div className="flex flex-col">
                  <span className="text-sm text-gray-600">
                    {getVisibleMetrics().length} of {selectedMetrics.length} metrics visible

                  </span>
                  {hasStackedMetrics() && (
                    <span className="text-sm text-green-600">
                      {getStackedMetrics().length} metrics stacked
                    </span>
                  )}
                </div>

              </div>
              
              <TimeRangePanel
                sliderValue={sliderValue}
                onSliderChange={handleSliderChange}
                timePeriods={timePeriods}
                timeFrame={period === 'quarter' ? 'quarterly' : 'annual'}
              />
              
              {/* Debug info */}
              {debug && (
                <div className="bg-gray-100 p-4 rounded-md mb-4 text-xs font-mono">
                  <h4 className="font-bold mb-2">Debug Info:</h4>
                  <p>Period type: {period}</p>
                  <p>Time periods: {timePeriods.join(', ')}</p>
                  <p>Slider value: [{sliderValue.join(', ')}]</p>
                  <p>Selected time range: {timePeriods.slice(sliderValue[0], sliderValue[1] + 1).join(', ')}</p>
                  <p>Companies: {selectedCompanies.map(c => c.ticker).join(', ')}</p>
                  <p>Visible metrics: {getVisibleMetrics().join(', ')}</p>
                  <p>Stacked metrics: {getStackedMetrics().join(', ')}</p>
                  <p>Has stackable metrics: {hasStackedMetrics() ? 'Yes' : 'No'}</p>
                </div>
              )}
            </>
          )}
          
          {/* Render charts based on view mode */}
          {viewMode === 'single' ? (
            // Single Panel View - Combined chart with all companies
        <div className="border-t pt-8 first:border-t-0 first:pt-0">
          <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
            <div>
              <p className="font-medium">{selectedCompanies.map(c => c.name).join(' vs. ')}</p>
              <p className="text-sm text-gray-500">Comparison</p>
            </div>
          </div>
          
          {selectedCompanies.length > 0 && selectedMetrics.length > 0 ? (
            <>
              {/* Show loading indicator if any company is still loading */}
              {selectedCompanies.some(company => company.isLoading) && (
                <div className="text-center py-2 mb-2 bg-blue-50 rounded">
                  <p className="text-blue-500">Loading data...</p>
                </div>
              )}
              
              {/* Show errors if any company has an error */}
              {selectedCompanies.some(company => company.error) && (
                <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4">
                  <p>There were errors loading data for some companies:</p>
                  <ul className="list-disc pl-5 mt-1">
                    {selectedCompanies
                      .filter(company => company.error)
                      .map(company => (
                        <li key={company.ticker}>{company.ticker}: {company.error}</li>
                      ))}
                  </ul>
                </div>
              )}
              
              {/* Add this line to include the CombinedChartExport */}
              <div className="flex justify-end mb-2">
                {getCombinedChartData() && getCombinedChartData().length > 0 && (
                  <CombinedChartExport
                    data={getCombinedChartData()}
                    companies={selectedCompanies}
                    metrics={getVisibleMetrics()}
                    metricTypes={metricTypes}
                    metricLabels={metricLabels}
                    metricSettings={metricSettings}
                    stackedMetrics={hasStackedMetrics() ? getStackedMetrics() : []}
                    fileName={`${selectedCompanies.map(c => c.ticker).join('-')}-comparison`}
                  />
                )}
              </div>
              
              {/* Combined Chart */}
              <div className="h-[750px] w-[full]">
                {getCombinedChartData() && getCombinedChartData().length > 0 ? (
                  <CombinedCompanyChart 
                    data={getCombinedChartData()}
                    companies={selectedCompanies}
                    metrics={getVisibleMetrics()}
                    metricTypes={metricTypes}
                    metricLabels={metricLabels}
                    metricSettings={metricSettings}
                    stackedMetrics={hasStackedMetrics() ? getStackedMetrics() : []}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500">No data available for the selected companies and time period.</p>
                  </div>
                )}
              </div>
              
              {/* Combined Financial Data Table */}
              {getCombinedChartData() && getCombinedChartData().length > 0 && (
                <div className="mt-8">
                  <CombinedFinancialTable 
                    data={getCombinedChartData()}
                    companies={selectedCompanies}
                    metrics={getVisibleMetrics()}
                    metricVisibility={metricVisibility}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Select at least one company and metric to display data</p>
            </div>
          )}
        </div>
          ) : (
            // By Company View - Separate chart for each company
            selectedCompanies.map((company, index) => (
              <div key={company.ticker} className="border-t pt-8 first:border-t-0 first:pt-0">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg mb-4">
                  <div>
                    <p className="font-medium">{company.name}</p>
                    <p className="text-sm text-gray-500">{company.ticker}</p>
                  </div>
                </div>
                
                {company.isLoading && (
                  <div className="text-center py-4">
                    <p className="text-gray-500">Loading data for {company.ticker}...</p>
                  </div>
                )}
                
                {company.error && (
                  <div className="bg-red-50 text-red-700 p-3 rounded-md">
                    <p>{company.error}</p>
                  </div>
                )}
                    <div className="flex justify-end mb-2">
                  {getChartData(company.metricData) && getChartData(company.metricData).length > 0 && (
                    <ChartExport 
                      data={getChartData(company.metricData)}
                      metrics={getVisibleMetrics()}
                      ticker={company.ticker}
                      metricTypes={metricTypes}
                      stackedMetrics={hasStackedMetrics() ? getStackedMetrics() : []}
                      companyName={company.name}
                      title={`${company.name} (${company.ticker})`}
                      metricSettings={metricSettings}
                      metricLabels={metricLabels}
                      fileName={`${company.ticker}-financial-metrics`}
                      dailyPriceData={hasPriceMetric() && company.priceData ? company.priceData : []}

                      selectedPeriods={getChartData(company.metricData)?.selectedPeriods || []}
                      sliderValue={sliderValue}
                      timePeriods={timePeriods}      
                    />
                  )}
                </div>
                <div className="h-[750px] w-[full]" ref={index === 0 ? chartContainerRef : undefined}>
                  {getChartData(company.metricData) && getChartData(company.metricData).length > 0 ? (
                    <MetricChart 
                  data={getChartData(company.metricData)}
                  metrics={getVisibleMetrics()}
                  ticker={company.ticker}
                  metricTypes={metricTypes}
                  stackedMetrics={hasStackedMetrics() ? getStackedMetrics() : []}
                  onMetricTypeChange={handleMetricTypeChange}
                  companyName={company.name}
                  title={`${company.name} (${company.ticker})`}
                  metricSettings={metricSettings}
                  metricLabels={metricLabels}
                  dailyPriceData={hasPriceMetric() && company.priceData ? company.priceData : []}
                  // Pass all market data metrics in a single object
                  dailyMarketData={getSelectedMarketDataMetrics().reduce((acc, metricId) => ({
                    ...acc,
                    [metricId]: getMarketData(company, metricId)
                  }), {})}
                  selectedPeriods={getChartData(company.metricData)?.selectedPeriods || []}
                  sliderValue={sliderValue}
                  timePeriods={timePeriods}                  />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-gray-500">No data available for {company.ticker} in the selected time period.</p>
                    </div>
                  )}
                </div>
                
                {/* Financial Data Table for each company */}
                {getTableData(company.metricData) && getTableData(company.metricData).length > 0 && (
                  <FinancialDataTable
                    data={getTableData(company.metricData)}
                    metrics={getVisibleMetrics()}
                    metricVisibility={metricVisibility}
                    company={company.name}
                  />
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  </div>
);
};

export default Charting;