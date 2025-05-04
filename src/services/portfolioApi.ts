/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/portfolioApi.ts
import { Portfolio, Stock } from "@/components/portfolio/types";
import apiClient from "@/utils/apiClient";
import { AuthService, getUserData } from "@/services/auth.service";
import { standardizePortfolioData } from "@/utils/portfolioDataUtils";
import { PortfolioVisibility } from "@/constants/portfolioVisibility";

// Define interfaces for API responses
interface PortfolioResponseDto {
  id: string;
  name: string;
  totalValue: number;
  positions: StockPositionResponseDto[];
  userId: string;
  createdAt: string;
  updatedAt: string;
  previousDayValue: number;
  dayChange: number;
  dayChangePercent: number;
  lastPriceUpdate: Date | null;
  visibility: PortfolioVisibility;
  description?: string;
}

interface StockPositionResponseDto {
  id: string;
  ticker: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  marketValue: number;
  percentOfPortfolio: number;
  gainLoss: number;
  gainLossPercent: number;
  createdAt: string;
  updatedAt: string;
}

interface PortfolioBasicInfoDto {
  id: string;
  name: string;
  description?: string;
  visibility: PortfolioVisibility;
  userId: string;
  createdAt: Date;
  lastDayChange: number;
  lastMonthChange: number;
  lastYearChange: number;
  totalValue: number;
  creator: {
    displayName?: string;
    avatarUrl?: string | null;
  };
}

interface PortfolioHistoryResponse {
  portfolioId: string;
  interval: "daily" | "weekly" | "monthly";
  data: Array<{
    date: string;
    value: number;
    previousValue: number;
    dayChange: number;
    dayChangePercent: number;
  }>;
}

interface PortfolioPerformanceResponse {
  portfolioId: string;
  data: {
    dates: string[];
    portfolioValues: number[];
    performanceValues: number[];
    performancePercent: number[];
  };
}

interface CreatePositionRequest {
  ticker: string;
  name?: string;
  shares: number;
  avgPrice: number;
}

interface UpdatePositionRequest {
  ticker: string;
  shares?: number;
  avgPrice?: number;
}

interface MarketStatusResponse {
  isMarketOpen: boolean;
  nextMarketOpenTime: Date;
  lastMarketCloseTime: Date;
  marketHours: { open: string; close: string };
  serverTime: Date;
}
interface PortfolioTransaction {
  id: string;
  type: string;
  ticker: string;
  shares: number;
  priceAtTransaction: number;
  amount: number;
  timestamp: string;
}
export interface IntradayDataPoint {
  timestamp: string;
  value: number;
}

export interface IntradayResponse {
  portfolioId: string;
  date: string;
  data: IntradayDataPoint[];
}

// Request deduplication and caching system
const pendingRequests = new Map<string, Promise<any>>();
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10000; // 10 seconds cache lifetime

// Create unique cache keys for requests
const createCacheKey = (endpoint: string, params?: any) => {
  return `${endpoint}${params ? "_" + JSON.stringify(params) : ""}`;
};

// Deduplicate and cache GET requests
const dedupGet = async <T>(endpoint: string, params?: any): Promise<T> => {
  // Add timestamp to prevent browser caching
  const paramsWithTimestamp = {
    ...params,
    _t: Date.now(),
  };

  const cacheKey = createCacheKey(endpoint, params);
  const now = Date.now();

  // Check for cached response
  const cached = requestCache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log(`[Cache hit] Using cached response for ${cacheKey}`);
    return cached.data as T;
  }

  // Check for in-flight request
  const pendingRequest = pendingRequests.get(cacheKey);
  if (pendingRequest) {
    console.log(`[Request dedup] Reusing in-flight request for ${cacheKey}`);
    return pendingRequest;
  }

  // Create new request
  const requestPromise = (async () => {
    try {
      const response = await apiClient.get<T>(endpoint, {
        params: paramsWithTimestamp,
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      // Cache response
      requestCache.set(cacheKey, { data: response.data, timestamp: now });
      return response.data;
    } finally {
      // Remove from pending requests
      pendingRequests.delete(cacheKey);
    }
  })();

  // Store promise
  pendingRequests.set(cacheKey, requestPromise);

  return requestPromise;
};

// Request queue for operations that modify data
class RequestQueue {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;

  public async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await request();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      this.process();
    });
  }

  private async process() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const request = this.queue.shift();
      if (request) {
        try {
          await request();
        } catch (error) {
          console.error("Request error:", error);
        }
      }
    }

    this.processing = false;
  }
}

// Create request queue instance
const requestQueue = new RequestQueue();

// Clear all caches
function clearAllCaches() {
  console.log("Clearing ALL portfolio-related caches");
  console.log("Cache keys being cleared:", Array.from(requestCache.keys()));
  requestCache.clear();
  console.log(
    "Pending requests being cleared:",
    Array.from(pendingRequests.keys())
  );
  pendingRequests.clear();
}

// Invalidate cache for specific portfolio
function invalidatePortfolioCache(portfolioId: string) {
  const keysToInvalidate: string[] = [];

  Array.from(requestCache.keys()).forEach((key) => {
    if (
      key.includes(`/portfolios/${portfolioId}/`) ||
      key.includes(`light_refresh_${portfolioId}`) ||
      key === `/portfolios/${portfolioId}`
    ) {
      keysToInvalidate.push(key);
    }
  });

  keysToInvalidate.forEach((key) => {
    console.log(`[Cache] Invalidating ${key}`);
    requestCache.delete(key);
  });
}

// Map backend DTOs to frontend model
const mapToPortfolio = (dto: PortfolioResponseDto): Portfolio => {
  // Ensure numeric values
  const ensureNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") return parseFloat(val) || 0;
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    return 0;
  };

  // Map positions to stocks
  const stocks =
    dto.positions?.map((pos) => ({
      ticker: pos.ticker,
      name: pos.name,
      shares: ensureNumber(pos.shares),
      avgPrice: ensureNumber(pos.avgPrice),
      currentPrice: ensureNumber(pos.currentPrice),
      marketValue: ensureNumber(pos.shares) * ensureNumber(pos.currentPrice),
      percentOfPortfolio: ensureNumber(pos.percentOfPortfolio),
      gainLoss: ensureNumber(pos.gainLoss),
      gainLossPercent: ensureNumber(pos.gainLossPercent),
    })) || [];

  // Calculate total from positions
  const calculatedTotal = stocks.reduce(
    (sum, stock) => sum + stock.marketValue,
    0
  );
  const reportedTotal = ensureNumber(dto.totalValue);

  // Use calculated if significant discrepancy
  const totalValue =
    Math.abs(calculatedTotal - reportedTotal) > 0.5
      ? calculatedTotal
      : reportedTotal;

  // Create portfolio object
  const portfolio: Portfolio = {
    id: dto.id,
    name: dto.name,
    totalValue: totalValue,
    previousDayValue: ensureNumber(dto.previousDayValue),
    // Use backend values if provided and non-zero
    dayChange:
      ensureNumber(dto.dayChange) !== 0
        ? ensureNumber(dto.dayChange)
        : totalValue - ensureNumber(dto.previousDayValue),
    dayChangePercent:
      ensureNumber(dto.dayChangePercent) !== 0
        ? ensureNumber(dto.dayChangePercent)
        : ensureNumber(dto.previousDayValue) > 0
        ? ((totalValue - ensureNumber(dto.previousDayValue)) /
            ensureNumber(dto.previousDayValue)) *
          100
        : 0,
    lastPriceUpdate: dto.lastPriceUpdate ? new Date(dto.lastPriceUpdate) : null,
    stocks: stocks,
    visibility: dto.visibility,
    description: dto.description || "",
    userId: dto.userId,
  };

  // Standardize to ensure consistency
  return standardizePortfolioData(portfolio);
};

// Map position DTO to Stock model
const mapToStock = (dto: StockPositionResponseDto): Stock => {
  // Helper function to ensure all values are proper numbers
  const ensureNumber = (val: any): number => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") return parseFloat(val) || 0;
    if (typeof val === "number") return isNaN(val) ? 0 : val;
    return 0;
  };

  return {
    ticker: dto.ticker,
    name: dto.name,
    shares: ensureNumber(dto.shares),
    avgPrice: ensureNumber(dto.avgPrice),
    currentPrice: ensureNumber(dto.currentPrice),
    marketValue: ensureNumber(dto.marketValue),
    percentOfPortfolio: ensureNumber(dto.percentOfPortfolio),
    gainLoss: ensureNumber(dto.gainLoss),
    gainLossPercent: ensureNumber(dto.gainLossPercent),
  };
};

const portfolioApi = {
  clearAllCaches,

  // Get all user portfolios
  getPortfolios: async (options?: {
    skipRefresh?: boolean;
    forceRefresh?: boolean;
    portfolioId?: string;
  }): Promise<Portfolio[]> => {
    try {
      const forceRefresh = options?.forceRefresh === true;
      const specificPortfolioId = options?.portfolioId;

      // Clear cache if requested
      if (forceRefresh && specificPortfolioId) {
        invalidatePortfolioCache(specificPortfolioId);
      } else if (forceRefresh) {
        clearAllCaches();
      }

      // Request params
      const params = {
        skipRefresh: options?.skipRefresh,
        forceRefresh,
        portfolioId: specificPortfolioId,
        _t: Date.now(),
      };

      // Make request
      const response = await apiClient.get<PortfolioResponseDto[]>(
        "/portfolios",
        {
          params,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      // Process portfolios
      let portfolios = response.data.map((dto) => {
        const lightRefreshCacheKey = `light_refresh_${dto.id}`;
        const lightRefreshData = requestCache.get(lightRefreshCacheKey);

        // Use light refresh data if available and recent
        if (
          lightRefreshData &&
          Date.now() - lightRefreshData.timestamp < 30000
        ) {
          console.log(`Using light refresh data for portfolio ${dto.id}`);
          return lightRefreshData.data as Portfolio;
        }

        // Otherwise map and standardize
        const portfolio = mapToPortfolio(dto);
        return standardizePortfolioData(portfolio);
      });

      // Filter by ID if requested
      if (specificPortfolioId) {
        portfolios = portfolios.filter((p) => p.id === specificPortfolioId);
      }

      return portfolios;
    } catch (error) {
      console.error("Error fetching portfolios:", error);
      return [];
    }
  },

  // Get portfolio by ID
  getPortfolioById: async (portfolioId: string): Promise<Portfolio> => {
    try {
      // Use light-refresh endpoint for authenticated users
      const response = await apiClient.get<PortfolioResponseDto>(
        `/portfolios/${portfolioId}/light-refresh`,
        {
          params: { _t: Date.now() },
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (response.data) {
        return mapToPortfolio(response.data);
      }

      throw new Error(`Portfolio ${portfolioId} not found`);
    } catch (error) {
      console.error(`Error fetching portfolio ${portfolioId}:`, error);
      throw error;
    }
  },

  // Create portfolio
  createPortfolio: async (data: {
    name: string;
    positions: {
      ticker: string;
      name: string;
      shares: number;
      avgPrice: number;
    }[];
  }): Promise<Portfolio> => {
    return requestQueue.add(async () => {
      // Get user ID
      let userId = getUserData()?.id;

      if (!userId) {
        const currentUser = await AuthService.getCurrentUser(true);
        userId = currentUser?.id;
      }

      if (!userId) {
        throw new Error("User ID required to create portfolio");
      }

      // Include userId in request
      const requestData = { ...data, userId };

      try {
        const response = await apiClient.post<PortfolioResponseDto>(
          "/portfolios",
          requestData
        );
        clearAllCaches();

        const portfolio = mapToPortfolio(response.data);
        return standardizePortfolioData(portfolio);
      } catch (error) {
        console.error("Error creating portfolio:", error);
        // Extract error message
        if (error.response?.data?.message) {
          const errorMessage = Array.isArray(error.response.data.message)
            ? error.response.data.message.join(", ")
            : error.response.data.message;

          throw new Error(errorMessage);
        }
        throw error;
      }
    });
  },

  // Update portfolio
  updatePortfolio: async (
    id: string,
    data: {
      name: string;
      visibility?: PortfolioVisibility;
    }
  ): Promise<Portfolio> => {
    return requestQueue.add(async () => {
      console.log(`Updating portfolio ${id} with data:`, data);

      const response = await apiClient.put<PortfolioResponseDto>(
        `/portfolios/${id}`,
        data
      );
      invalidatePortfolioCache(id);

      const portfolio = mapToPortfolio(response.data);
      return standardizePortfolioData(portfolio);
    });
  },

  // Delete portfolio
  deletePortfolio: async (id: string): Promise<void> => {
    return requestQueue.add(async () => {
      await apiClient.delete(`/portfolios/${id}`);
      clearAllCaches();
    });
  },

  // Add position
  addPosition: async (
    portfolioId: string,
    position: CreatePositionRequest
  ): Promise<Stock> => {
    return requestQueue.add(async () => {
      // Ensure numeric values
      const cleanPosition = {
        ...position,
        shares: Number(position.shares),
        avgPrice: Number(position.avgPrice),
      };

      const response = await apiClient.post<StockPositionResponseDto>(
        `/portfolios/${portfolioId}/positions`,
        cleanPosition,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      invalidatePortfolioCache(portfolioId);

      // Map to stock
      return mapToStock(response.data);
    });
  },

  // Update position
  updatePosition: async (
    portfolioId: string,
    ticker: string,
    data: UpdatePositionRequest
  ): Promise<Stock> => {
    return requestQueue.add(async () => {
      // Ensure numeric values
      const cleanData = {
        ...data,
        shares: data.shares !== undefined ? Number(data.shares) : undefined,
        avgPrice:
          data.avgPrice !== undefined ? Number(data.avgPrice) : undefined,
      };

      const response = await apiClient.put<StockPositionResponseDto>(
        `/portfolios/${portfolioId}/positions/${ticker}`,
        cleanData,
        {
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      invalidatePortfolioCache(portfolioId);

      // Map to stock
      return mapToStock(response.data);
    });
  },

  // Delete position
  deletePosition: async (
    portfolioId: string,
    ticker: string
  ): Promise<void> => {
    return requestQueue.add(async () => {
      await apiClient.delete(`/portfolios/${portfolioId}/positions/${ticker}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
      invalidatePortfolioCache(portfolioId);
    });
  },

  // Refresh portfolio prices
  refreshPrices: async (
    portfolioId: string,
    excludedTickers?: string[]
  ): Promise<Portfolio> => {
    return requestQueue.add(async () => {
      try {
        console.log(
          "refreshPrices called with excluded tickers:",
          excludedTickers
        );

        // Create request body
        const requestBody: Record<string, any> = {};

        // Only add excludedTickers to request body if we have some to exclude
        if (excludedTickers && excludedTickers.length > 0) {
          requestBody.excludedTickers = excludedTickers;
          console.log(
            "Adding excludedTickers to request body:",
            excludedTickers
          );
        }

        // Invalidate cache
        invalidatePortfolioCache(portfolioId);

        // Make the API call
        const response = await apiClient.post<PortfolioResponseDto>(
          `/portfolios/${portfolioId}/refresh`,
          requestBody,
          {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        const portfolio = mapToPortfolio(response.data);
        return standardizePortfolioData(portfolio);
      } catch (error) {
        console.error("Error refreshing portfolio prices:", error);
        throw new Error("Failed to refresh portfolio prices");
      }
    });
  },
  /**
   * @deprecated Use getPortfolioPerformance() instead which provides portfolioValues that can be used for the same purpose.
   * This method will be removed in a future release.
   */
  getPortfolioHistoryWithExclusions: async (
    portfolioId: string,
    startDate?: string,
    endDate?: string,
    interval: "daily" | "weekly" | "monthly" = "daily",
    excludedTickers?: string[]
  ): Promise<PortfolioHistoryResponse> => {
    try {
      // Create parameters for the request
      const params: Record<string, any> = {
        startDate,
        endDate,
        interval,
        _t: Date.now(), // Add timestamp to prevent caching
      };

      // Only add excludedTickers parameter if we have tickers to exclude
      if (excludedTickers && excludedTickers.length > 0) {
        params.excludedTickers = excludedTickers.join(",");
        console.log(
          "Adding excludedTickers parameter:",
          params.excludedTickers
        );
      }

      // Set headers to prevent caching
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };

      // Make the API call
      const response = await apiClient.get<PortfolioHistoryResponse>(
        `/portfolios/${portfolioId}/history`,
        { params, headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching portfolio history with exclusions:", error);
      throw error;
    }
  },

  // Light refresh of portfolio (without DB update)
  getLightRefreshPortfolio: async (portfolioId: string): Promise<Portfolio> => {
    try {
      const params = { _t: Date.now() };
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };

      console.log(`Performing light refresh for portfolio ${portfolioId}`);

      const response = await apiClient.get<PortfolioResponseDto>(
        `/portfolios/${portfolioId}/light-refresh`,
        { params, headers }
      );

      const portfolio = mapToPortfolio(response.data);
      const standardizedPortfolio = standardizePortfolioData(portfolio);

      // Store in cache
      requestCache.set(`light_refresh_${portfolioId}`, {
        data: standardizedPortfolio,
        timestamp: Date.now(),
      });

      return standardizedPortfolio;
    } catch (error) {
      console.error("Error light refreshing portfolio:", error);

      // Fall back to regular portfolio fetch
      const portfolios = await apiClient.get<PortfolioResponseDto[]>(
        "/portfolios",
        {
          params: {
            skipRefresh: true,
            portfolioId: portfolioId,
          },
        }
      );

      if (portfolios.data && portfolios.data.length > 0) {
        const matchingPortfolio = portfolios.data.find(
          (p) => p.id === portfolioId
        );
        if (matchingPortfolio) {
          const portfolio = mapToPortfolio(matchingPortfolio);
          return standardizePortfolioData(portfolio);
        }
      }

      throw error;
    }
  },

  getPortfolioPerformance: async (
    portfolioId: string,
    startDate?: string,
    endDate?: string,
    excludedTickers?: string[]
  ): Promise<PortfolioPerformanceResponse> => {
    try {
      console.log(
        "getPortfolioPerformance called with excluded tickers:",
        excludedTickers
      );

      // Create parameters for the request
      const params: Record<string, any> = {
        startDate,
        endDate,
        _t: Date.now(), // Add timestamp to prevent caching
      };

      // Only add excludedTickers parameter if we have tickers to exclude
      if (excludedTickers && excludedTickers.length > 0) {
        params.excludedTickers = excludedTickers.join(",");
        console.log(
          "Adding excludedTickers parameter:",
          params.excludedTickers
        );
      }

      console.log("Final request params:", params);

      // Set headers to prevent caching
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };

      // Make the API call
      const response = await apiClient.get<PortfolioPerformanceResponse>(
        `/portfolio-history/${portfolioId}/performance`,
        { params, headers }
      );
      console.log(
        "API call getPortfolioPerformance with excluded tickers:",
        excludedTickers
      );
      console.log("Forming request:", {
        endpoint: `/portfolios/${portfolioId}/performance`,
        params,
      });

      return response.data;
    } catch (error) {
      console.error("Error fetching portfolio performance:", error);
      throw error;
    }
  },

  /**
   * @deprecated Use getPortfolioPerformance() instead which provides portfolioValues that can be used for the same purpose.
   * This method will be removed in a future release.
   */
  getPortfolioHistory: async (
    portfolioId: string,
    startDate?: string,
    endDate?: string,
    interval: "daily" | "weekly" | "monthly" = "daily",
    excludedTickers?: string[]
  ): Promise<PortfolioHistoryResponse> => {
    try {
      console.log(
        "API call getPortfolioHistory with excluded tickers:",
        excludedTickers
      );

      // Build parameters
      const params: Record<string, any> = {
        startDate,
        endDate,
        interval,
        _t: Date.now(),
      };

      // Only add excludedTickers parameter if we have tickers to exclude
      if (excludedTickers && excludedTickers.length > 0) {
        params.excludedTickers = excludedTickers.join(",");
        console.log(
          "Adding excludedTickers parameter:",
          params.excludedTickers
        );
      }

      console.log("Final history request params:", params);

      // Set headers to prevent caching
      const headers = {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      };

      // Make the API call
      const response = await apiClient.get<PortfolioHistoryResponse>(
        `/portfolios/${portfolioId}/history`,
        { params, headers }
      );

      return response.data;
    } catch (error) {
      console.error("Error fetching portfolio history:", error);
      throw error;
    }
  },

  // Get market status
  getMarketStatus: async (): Promise<MarketStatusResponse> => {
    try {
      const response = await apiClient.get<MarketStatusResponse>(
        "/portfolios/market/status"
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching market status:", error);
      // Return default values
      return {
        isMarketOpen: false,
        nextMarketOpenTime: new Date(),
        lastMarketCloseTime: new Date(),
        marketHours: { open: "09:30", close: "16:00" },
        serverTime: new Date(),
      };
    }
  },

  // Get basic portfolios by visibility
  getBasicPortfoliosByVisibility: async (
    visibility: "public" | "paid"
  ): Promise<PortfolioBasicInfoDto[]> => {
    try {
      const response = await apiClient.get<PortfolioBasicInfoDto[]>(
        `/portfolios/by-visibility/${visibility}/basic-info`,
        {
          params: { _t: Date.now() },
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(
        `Error fetching basic portfolios with visibility ${visibility}:`,
        error
      );
      return [];
    }
  },
  getPortfolioTransactions: async (
    portfolioId: string
  ): Promise<PortfolioTransaction[]> => {
    try {
      const response = await apiClient.get<PortfolioTransaction[]>(
        `/portfolios/${portfolioId}/transactions`,
        {
          headers: {
            "Cache-Control": "no-cache",
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching portfolio transactions:", error);
      throw error;
    }
  },
  getPortfolioIntraday: async (
    portfolioId: string,
    excludedTickers?: string[],
    date?: string
  ): Promise<IntradayResponse> => {
    try {
      const params: Record<string, any> = {
        _t: Date.now(),
      };
      if (date) {
        params.date = date;
      }
      if (excludedTickers && excludedTickers.length > 0) {
        params.excludedTickers = excludedTickers.join(",");
        console.log(
          `[portfolioApi] Fetching intraday for ${portfolioId} excluding: ${params.excludedTickers}`
        );
      } else {
        console.log(
          `[portfolioApi] Fetching intraday for ${portfolioId} with no exclusions.`
        );
      }

      const response = await apiClient.get<IntradayResponse>( // <-- Specify expected response data type
        `/portfolio-history/${portfolioId}/intraday`,
        {
          params: params,
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );

      // Basic validation (optional but recommended)
      if (
        !response.data ||
        typeof response.data !== "object" ||
        !response.data.data ||
        !Array.isArray(response.data.data)
      ) {
        console.error("Invalid intraday response structure:", response.data);
        throw new Error(
          "Received invalid data structure for intraday history."
        );
      }

      return response.data; // Now TypeScript knows response.data should be IntradayResponse
    } catch (error) {
      console.error("Error fetching intraday data:", error);
      // Consider returning a default error structure or re-throwing
      // For now, re-throwing is consistent with previous code
      throw error;
    }
  },
  sellPosition: async (
    portfolioId: string,
    ticker: string,
    shares: number,
    sellPrice: number
  ): Promise<Stock> => {
    return requestQueue.add(async () => {
      console.log(`Selling ${shares} shares of ${ticker} at $${sellPrice}`);

      try {
        // First get the current position
        const currentPortfolio = await apiClient.get<PortfolioResponseDto>(
          `/portfolios/${portfolioId}`
        );
        const currentPosition = currentPortfolio.data.positions.find(
          (p) => p.ticker === ticker
        );

        if (!currentPosition) {
          throw new Error(`Position ${ticker} not found`);
        }

        const currentShares =
          typeof currentPosition.shares === "string"
            ? parseFloat(currentPosition.shares)
            : currentPosition.shares;

        // Calculate new shares
        const remainingShares = currentShares - shares;

        if (remainingShares <= 0) {
          // If selling all shares, use delete endpoint
          await apiClient.delete(
            `/portfolios/${portfolioId}/positions/${ticker}`
          );
          invalidatePortfolioCache(portfolioId);

          // Return a blank position since it's been deleted
          return {
            ticker,
            name: currentPosition.name,
            shares: 0,
            avgPrice: 0,
            currentPrice: 0,
            marketValue: 0,
            percentOfPortfolio: 0,
            gainLoss: 0,
            gainLossPercent: 0,
          };
        } else {
          // If selling partial position, update with new share count
          const response = await apiClient.put<StockPositionResponseDto>(
            `/portfolios/${portfolioId}/positions/${ticker}`,
            {
              ticker,
              shares: remainingShares,
            }
          );

          invalidatePortfolioCache(portfolioId);
          return mapToStock(response.data);
        }
      } catch (error) {
        console.error("Error selling position:", error);
        throw error;
      }
    });
  },
  // Add this method to portfolioApi.ts
  getPortfoliosByVisibility: async (
    visibility: PortfolioVisibility
  ): Promise<PortfolioResponseDto[]> => {
    try {
      // Use the existing getBasicPortfoliosByVisibility method as the foundation
      let visibilityParam: "public" | "paid";

      if (visibility === PortfolioVisibility.PUBLIC) {
        visibilityParam = "public";
      } else if (visibility === PortfolioVisibility.PAID) {
        visibilityParam = "paid";
      } else {
        throw new Error(
          `Cannot fetch portfolios with visibility: ${visibility}`
        );
      }

      const response = await portfolioApi.getBasicPortfoliosByVisibility(
        visibilityParam
      );

      // Convert the basic portfolio info to the full portfolio response format
      return response.map((portfolio) => ({
        id: portfolio.id,
        name: portfolio.name,
        description: portfolio.description || "",
        visibility: portfolio.visibility,
        userId: portfolio.userId,
        totalValue: portfolio.totalValue,
        dayChange: portfolio.lastDayChange,
        dayChangePercent: portfolio.lastDayChange,
        positions: [],
        createdAt: portfolio.createdAt.toString(),
        updatedAt: new Date().toString(),
        previousDayValue: 0,
        lastPriceUpdate: null,
      }));
    } catch (error) {
      console.error(
        `Error getting portfolios by visibility ${visibility}:`,
        error
      );
      return [];
    }
  },
};

export default portfolioApi;
