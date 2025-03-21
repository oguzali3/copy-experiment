// // src/contexts/PortfolioContext.tsx
// import { 
//     createContext, 
//     useContext, 
//     useReducer, 
//     useEffect, 
//     useState,
//     ReactNode 
//   } from 'react';
//   import { 
//     Portfolio, 
//     StockPosition, 
//     PositionData,
//     CreatePortfolioData,
//     MarketStatus
//   } from '../models/portfolio.model';
//   import { portfolioService } from '../services/portfolio.service';
//   import { determineMarketStatus } from '../utils/data-normalizer';
//   import { toast } from 'sonner';
  
//   // Define the state shape
//   interface PortfolioState {
//     portfolios: Portfolio[];
//     selectedPortfolioId: string | null;
//     isLoading: boolean;
//     isRefreshing: boolean;
//     error: string | null;
//     marketStatus: MarketStatus;
//     lastRefreshTime: Date | null;
//   }
  
//   // Define action types
//   type PortfolioAction =
//     | { type: 'LOAD_PORTFOLIOS_REQUEST' }
//     | { type: 'LOAD_PORTFOLIOS_SUCCESS'; payload: Portfolio[] }
//     | { type: 'LOAD_PORTFOLIOS_FAILURE'; payload: string }
//     | { type: 'SET_SELECTED_PORTFOLIO'; payload: string | null }
//     | { type: 'CREATE_PORTFOLIO_REQUEST' }
//     | { type: 'CREATE_PORTFOLIO_SUCCESS'; payload: Portfolio }
//     | { type: 'CREATE_PORTFOLIO_FAILURE'; payload: string }
//     | { type: 'UPDATE_PORTFOLIO_REQUEST' }
//     | { type: 'UPDATE_PORTFOLIO_SUCCESS'; payload: Portfolio }
//     | { type: 'UPDATE_PORTFOLIO_FAILURE'; payload: string }
//     | { type: 'DELETE_PORTFOLIO_REQUEST'; payload: string }
//     | { type: 'DELETE_PORTFOLIO_SUCCESS'; payload: string }
//     | { type: 'DELETE_PORTFOLIO_FAILURE'; payload: string }
//     | { type: 'REFRESH_PRICES_REQUEST' }
//     | { type: 'REFRESH_PRICES_SUCCESS'; payload: Portfolio }
//     | { type: 'REFRESH_PRICES_FAILURE'; payload: string }
//     | { type: 'ADD_POSITION_REQUEST' }
//     | { type: 'ADD_POSITION_SUCCESS'; payload: { portfolioId: string; position: StockPosition } }
//     | { type: 'ADD_POSITION_FAILURE'; payload: string }
//     | { type: 'UPDATE_POSITION_REQUEST' }
//     | { type: 'UPDATE_POSITION_SUCCESS'; payload: { portfolioId: string; position: StockPosition } }
//     | { type: 'UPDATE_POSITION_FAILURE'; payload: string }
//     | { type: 'DELETE_POSITION_REQUEST' }
//     | { type: 'DELETE_POSITION_SUCCESS'; payload: { portfolioId: string; ticker: string } }
//     | { type: 'DELETE_POSITION_FAILURE'; payload: string }
//     | { type: 'SET_MARKET_STATUS'; payload: MarketStatus }
//     | { type: 'SET_REFRESH_TIME'; payload: Date };
  
//   // Define the context value shape
//   interface PortfolioContextValue extends PortfolioState {
//     loadPortfolios: (options?: { skipRefresh?: boolean; forceRefresh?: boolean }) => Promise<void>;
//     selectPortfolio: (id: string | null) => void;
//     createPortfolio: (data: CreatePortfolioData) => Promise<void>;
//     updatePortfolio: (id: string, name: string) => Promise<void>;
//     deletePortfolio: (id: string) => Promise<void>;
//     refreshPrices: (portfolioId: string) => Promise<void>;
//     addPosition: (portfolioId: string, position: PositionData) => Promise<void>;
//     updatePosition: (portfolioId: string, ticker: string, data: { shares?: number; avgPrice?: number }) => Promise<void>;
//     deletePosition: (portfolioId: string, ticker: string) => Promise<void>;
//   }
  
//   // Create the context
//   const PortfolioContext = createContext<PortfolioContextValue | undefined>(undefined);
  
//   // Initial state
//   const initialState: PortfolioState = {
//     portfolios: [],
//     selectedPortfolioId: null,
//     isLoading: false,
//     isRefreshing: false,
//     error: null,
//     marketStatus: 'closed',
//     lastRefreshTime: null,
//   };
  
//   // Reducer function
//   function portfolioReducer(state: PortfolioState, action: PortfolioAction): PortfolioState {
//     switch (action.type) {
//       case 'LOAD_PORTFOLIOS_REQUEST':
//         return {
//           ...state,
//           isLoading: true,
//           error: null,
//         };
//       case 'LOAD_PORTFOLIOS_SUCCESS':
//         return {
//           ...state,
//           portfolios: action.payload,
//           isLoading: false,
//           error: null,
//         };
//       case 'LOAD_PORTFOLIOS_FAILURE':
//         return {
//           ...state,
//           isLoading: false,
//           error: action.payload,
//         };
//       case 'SET_SELECTED_PORTFOLIO':
//         return {
//           ...state,
//           selectedPortfolioId: action.payload,
//         };
//       case 'CREATE_PORTFOLIO_REQUEST':
//         return {
//           ...state,
//           isLoading: true,
//           error: null,
//         };
//       case 'CREATE_PORTFOLIO_SUCCESS':
//         return {
//           ...state,
//           portfolios: [...state.portfolios, action.payload],
//           selectedPortfolioId: action.payload.id,
//           isLoading: false,
//           error: null,
//         };
//       case 'CREATE_PORTFOLIO_FAILURE':
//         return {
//           ...state,
//           isLoading: false,
//           error: action.payload,
//         };
//       case 'UPDATE_PORTFOLIO_REQUEST':
//         return {
//           ...state,
//           isLoading: true,
//           error: null,
//         };
//       case 'UPDATE_PORTFOLIO_SUCCESS':
//         return {
//           ...state,
//           portfolios: state.portfolios.map((portfolio) =>
//             portfolio.id === action.payload.id ? action.payload : portfolio
//           ),
//           isLoading: false,
//           error: null,
//         };
//       case 'UPDATE_PORTFOLIO_FAILURE':
//         return {
//           ...state,
//           isLoading: false,
//           error: action.payload,
//         };
//       case 'DELETE_PORTFOLIO_REQUEST':
//         return {
//           ...state,
//           isLoading: true,
//           error: null,
//         };
//       case 'DELETE_PORTFOLIO_SUCCESS':
//         return {
//           ...state,
//           portfolios: state.portfolios.filter((portfolio) => portfolio.id !== action.payload),
//           selectedPortfolioId:
//             state.selectedPortfolioId === action.payload
//               ? state.portfolios.find((p) => p.id !== action.payload)?.id || null
//               : state.selectedPortfolioId,
//           isLoading: false,
//           error: null,
//         };
//       case 'DELETE_PORTFOLIO_FAILURE':
//         return {
//           ...state,
//           isLoading: false,
//           error: action.payload,
//         };
//       case 'REFRESH_PRICES_REQUEST':
//         return {
//           ...state,
//           isRefreshing: true,
//           error: null,
//         };
//       case 'REFRESH_PRICES_SUCCESS':
//         return {
//           ...state,
//           portfolios: state.portfolios.map((portfolio) =>
//             portfolio.id === action.payload.id ? action.payload : portfolio
//           ),
//           isRefreshing: false,
//           error: null,
//         };
//       case 'REFRESH_PRICES_FAILURE':
//         return {
//           ...state,
//           isRefreshing: false,
//           error: action.payload,
//         };
//       case 'ADD_POSITION_REQUEST':
//         return {
//           ...state,
//           isLoading: true,
//           error: null,
//         };
//       case 'ADD_POSITION_SUCCESS': {
//         const { portfolioId, position } = action.payload;
//         return {
//           ...state,
//           portfolios: state.portfolios.map((portfolio) => {
//             if (portfolio.id !== portfolioId) return portfolio;
            
//             // Check if position already exists
//             const existingIndex = portfolio.positions.findIndex(p => p.ticker === position.ticker);
            
//             let updatedPositions;
//             if (existingIndex >= 0) {
//               // Replace existing position
//               updatedPositions = [...portfolio.positions];
//               updatedPositions[existingIndex] = position;
//             } else {
//               // Add new position
//               updatedPositions = [...portfolio.positions, position];
//             }
            
//             return {
//               ...portfolio,
//               positions: updatedPositions,
//             };
//           }),
//           isLoading: false,
//           error: null,
//         };
//       }
//       case 'ADD_POSITION_FAILURE':
//         return {
//           ...state,
//           isLoading: false,
//           error: action.payload,
//         };
//       case 'UPDATE_POSITION_REQUEST':
//         return {
//           ...state,
//           isLoading: true,
//           error: null,
//         };
//       case 'UPDATE_POSITION_SUCCESS': {
//         const { portfolioId, position } = action.payload;
//         return {
//           ...state,
//           portfolios: state.portfolios.map((portfolio) => {
//             if (portfolio.id !== portfolioId) return portfolio;
            
//             return {
//               ...portfolio,
//               positions: portfolio.positions.map((p) =>
//                 p.ticker === position.ticker ? position : p
//               ),
//             };
//           }),
//           isLoading: false,
//           error: null,
//         };
//       }
//       case 'UPDATE_POSITION_FAILURE':
//         return {
//           ...state,
//           isLoading: false,
//           error: action.payload,
//         };
//       case 'DELETE_POSITION_REQUEST':
//         return {
//           ...state,
//           isLoading: true,
//           error: null,
//         };
//       case 'DELETE_POSITION_SUCCESS': {
//         const { portfolioId, ticker } = action.payload;
//         return {
//           ...state,
//           portfolios: state.portfolios.map((portfolio) => {
//             if (portfolio.id !== portfolioId) return portfolio;
            
//             return {
//               ...portfolio,
//               positions: portfolio.positions.filter((p) => p.ticker !== ticker),
//             };
//           }),
//           isLoading: false,
//           error: null,
//         };
//       }
//       case 'DELETE_POSITION_FAILURE':
//         return {
//           ...state,
//           isLoading: false,
//           error: action.payload,
//         };
//       case 'SET_MARKET_STATUS':
//         return {
//           ...state,
//           marketStatus: action.payload,
//         };
//       case 'SET_REFRESH_TIME':
//         return {
//           ...state,
//           lastRefreshTime: action.payload,
//         };
//       default:
//         return state;
//     }
//   }
  
//   // Provider component
//   export function PortfolioProvider({ children }: { children: ReactNode }) {
//     const [state, dispatch] = useReducer(portfolioReducer, initialState);
    
//     // Setup market status polling
//     useEffect(() => {
//       const updateMarketStatus = () => {
//         const status = determineMarketStatus();
//         dispatch({ type: 'SET_MARKET_STATUS', payload: status });
//       };
      
//       // Update immediately and then every minute
//       updateMarketStatus();
//       const interval = setInterval(updateMarketStatus, 60 * 1000);
      
//       return () => clearInterval(interval);
//     }, []);
    
//     // Setup auto-refresh for open market
//     useEffect(() => {
//       let intervalId: NodeJS.Timeout | null = null;
      
//       const setupAutoRefresh = () => {
//         // Clear any existing interval
//         if (intervalId) {
//           clearInterval(intervalId);
//           intervalId = null;
//         }
        
//         // If no portfolio is selected, don't set up auto-refresh
//         if (!state.selectedPortfolioId) return;
        
//         // Determine refresh rate based on market status
//         const isMarketActive = state.marketStatus === 'open' || 
//                              state.marketStatus === 'pre-market' || 
//                              state.marketStatus === 'after-hours';
        
//         const refreshInterval = isMarketActive ? 5 * 60 * 1000 : 15 * 60 * 1000;
        
//         // Set up new interval
//         intervalId = setInterval(async () => {
//           if (state.selectedPortfolioId) {
//             try {
//               // Use light refresh instead of full refresh
//               const refreshedPortfolio = await portfolioService.getLightRefresh(state.selectedPortfolioId);
              
//               dispatch({
//                 type: 'UPDATE_PORTFOLIO_SUCCESS',
//                 payload: refreshedPortfolio
//               });
              
//               dispatch({
//                 type: 'SET_REFRESH_TIME',
//                 payload: new Date()
//               });
              
//               console.log('Auto-refresh completed for portfolio', state.selectedPortfolioId);
//             } catch (error) {
//               console.error('Auto-refresh failed:', error);
//             }
//           }
//         }, refreshInterval);
//       };
      
//       setupAutoRefresh();
      
//       // Update interval when selectedPortfolioId or marketStatus changes
//       return () => {
//         if (intervalId) {
//           clearInterval(intervalId);
//         }
//       };
//     }, [state.selectedPortfolioId, state.marketStatus]);
    
//     // Action creators
//     const loadPortfolios = async (options?: { skipRefresh?: boolean; forceRefresh?: boolean }) => {
//       dispatch({ type: 'LOAD_PORTFOLIOS_REQUEST' });
      
//       try {
//         const portfolios = await portfolioService.getPortfolios(options);
//         dispatch({ type: 'LOAD_PORTFOLIOS_SUCCESS', payload: portfolios });
        
//         // If we have portfolios but none selected, select the first one
//         if (portfolios.length > 0 && !state.selectedPortfolioId) {
//           dispatch({ type: 'SET_SELECTED_PORTFOLIO', payload: portfolios[0].id });
//         }
        
//         dispatch({ type: 'SET_REFRESH_TIME', payload: new Date() });
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to load portfolios';
//         dispatch({ type: 'LOAD_PORTFOLIOS_FAILURE', payload: errorMessage });
//         toast.error(errorMessage);
//       }
//     };
    
//     const selectPortfolio = (id: string | null) => {
//       dispatch({ type: 'SET_SELECTED_PORTFOLIO', payload: id });
//     };
    
//     const createPortfolio = async (data: CreatePortfolioData) => {
//       dispatch({ type: 'CREATE_PORTFOLIO_REQUEST' });
      
//       try {
//         const portfolio = await portfolioService.createPortfolio(data);
//         dispatch({ type: 'CREATE_PORTFOLIO_SUCCESS', payload: portfolio });
//         toast.success('Portfolio created successfully');
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to create portfolio';
//         dispatch({ type: 'CREATE_PORTFOLIO_FAILURE', payload: errorMessage });
//         toast.error(errorMessage);
//         throw error;
//       }
//     };
    
//     const updatePortfolio = async (id: string, name: string) => {
//       dispatch({ type: 'UPDATE_PORTFOLIO_REQUEST' });
      
//       try {
//         const portfolio = await portfolioService.updatePortfolio(id, name);
//         dispatch({ type: 'UPDATE_PORTFOLIO_SUCCESS', payload: portfolio });
//         toast.success('Portfolio updated successfully');
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to update portfolio';
//         dispatch({ type: 'UPDATE_PORTFOLIO_FAILURE', payload: errorMessage });
//         toast.error(errorMessage);
//         throw error;
//       }
//     };
    
//     const deletePortfolio = async (id: string) => {
//       dispatch({ type: 'DELETE_PORTFOLIO_REQUEST', payload: id });
      
//       try {
//         await portfolioService.deletePortfolio(id);
//         dispatch({ type: 'DELETE_PORTFOLIO_SUCCESS', payload: id });
//         toast.success('Portfolio deleted successfully');
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to delete portfolio';
//         dispatch({ type: 'DELETE_PORTFOLIO_FAILURE', payload: errorMessage });
//         toast.error(errorMessage);
//         throw error;
//       }
//     };
    
//     const refreshPrices = async (portfolioId: string) => {
//       dispatch({ type: 'REFRESH_PRICES_REQUEST' });
      
//       try {
//         const portfolio = await portfolioService.refreshPrices(portfolioId);
//         dispatch({ type: 'REFRESH_PRICES_SUCCESS', payload: portfolio });
//         dispatch({ type: 'SET_REFRESH_TIME', payload: new Date() });
//         toast.success('Prices refreshed successfully');
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to refresh prices';
//         dispatch({ type: 'REFRESH_PRICES_FAILURE', payload: errorMessage });
//         toast.error(errorMessage);
//         throw error;
//       }
//     };
    
//     const addPosition = async (portfolioId: string, position: PositionData) => {
//       dispatch({ type: 'ADD_POSITION_REQUEST' });
      
//       try {
//         const newPosition = await portfolioService.addPosition(portfolioId, position);
//         dispatch({
//           type: 'ADD_POSITION_SUCCESS',
//           payload: { portfolioId, position: newPosition }
//         });
        
//         // Also refresh the portfolio to get updated totals
//         const updatedPortfolio = await portfolioService.getPortfolio(portfolioId);
//         dispatch({ type: 'UPDATE_PORTFOLIO_SUCCESS', payload: updatedPortfolio });
//         dispatch({ type: 'SET_REFRESH_TIME', payload: new Date() });
        
//         toast.success(`Position ${position.ticker} added successfully`);
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to add position';
//         dispatch({ type: 'ADD_POSITION_FAILURE', payload: errorMessage });
//         toast.error(errorMessage);
//         throw error;
//       }
//     };
    
//     const updatePosition = async (
//       portfolioId: string,
//       ticker: string,
//       data: { shares?: number; avgPrice?: number }
//     ) => {
//       dispatch({ type: 'UPDATE_POSITION_REQUEST' });
      
//       try {
//         const updatedPosition = await portfolioService.updatePosition(portfolioId, ticker, data);
//         dispatch({
//           type: 'UPDATE_POSITION_SUCCESS',
//           payload: { portfolioId, position: updatedPosition }
//         });
        
//         // Also refresh the portfolio to get updated totals
//         const updatedPortfolio = await portfolioService.getPortfolio(portfolioId);
//         dispatch({ type: 'UPDATE_PORTFOLIO_SUCCESS', payload: updatedPortfolio });
//         dispatch({ type: 'SET_REFRESH_TIME', payload: new Date() });
        
//         toast.success(`Position ${ticker} updated successfully`);
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to update position';
//         dispatch({ type: 'UPDATE_POSITION_FAILURE', payload: errorMessage });
//         toast.error(errorMessage);
//         throw error;
//       }
//     };
    
//     const deletePosition = async (portfolioId: string, ticker: string) => {
//       dispatch({ type: 'DELETE_POSITION_REQUEST' });
      
//       try {
//         await portfolioService.deletePosition(portfolioId, ticker);
//         dispatch({
//           type: 'DELETE_POSITION_SUCCESS',
//           payload: { portfolioId, ticker }
//         });
        
//         // Also refresh the portfolio to get updated totals
//         const updatedPortfolio = await portfolioService.getPortfolio(portfolioId);
//         dispatch({ type: 'UPDATE_PORTFOLIO_SUCCESS', payload: updatedPortfolio });
//         dispatch({ type: 'SET_REFRESH_TIME', payload: new Date() });
        
//         toast.success(`Position ${ticker} deleted successfully`);
//       } catch (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to delete position';
//         dispatch({ type: 'DELETE_POSITION_FAILURE', payload: errorMessage });
//         toast.error(errorMessage);
//         throw error;
//       }
//     };
    
//     const value: PortfolioContextValue = {
//       ...state,
//       loadPortfolios,
//       selectPortfolio,
//       createPortfolio,
//       updatePortfolio,
//       deletePortfolio,
//       refreshPrices,
//       addPosition,
//       updatePosition,
//       deletePosition,
//     };
    
//     return (
//       <PortfolioContext.Provider value={value}>
//         {children}
//       </PortfolioContext.Provider>
//     );
//   }
  
//   // Custom hook for using the context
//   export function usePortfolio() {
//     const context = useContext(PortfolioContext);
    
//     if (context === undefined) {
//       throw new Error('usePortfolio must be used within a PortfolioProvider');
//     }
    
//     return context;
//   }