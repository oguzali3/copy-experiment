// // src/pages/PortfolioPage.tsx
// import React, { useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { usePortfolio } from '../contexts/PortfolioContext';
// import PortfolioView from '../components/portfolio/PortfolioView';
// import PortfolioEmpty from '../components/portfolio/PortfolioEmpty';
// import PortfolioCreate from '../components/portfolio/PortfolioCreate';
// import PortfolioSelector from '../components/portfolio/PortfolioSelector';
// import { Loader2 } from 'lucide-react';

// interface PortfolioPageProps {
//   showCreate?: boolean;
// }

// const PortfolioPage: React.FC<PortfolioPageProps> = ({ showCreate = false }) => {
//   const { portfolioId } = useParams<{ portfolioId: string }>();
//   const navigate = useNavigate();
  
//   const { 
//     portfolios, 
//     selectedPortfolioId, 
//     isLoading, 
//     error,
//     loadPortfolios, 
//     selectPortfolio,
//     createPortfolio,
//     marketStatus,
//     lastRefreshTime
//   } = usePortfolio();
  
//   // Load portfolios on mount
//   useEffect(() => {
//     loadPortfolios();
//   }, [loadPortfolios]);
  
//   // Set selected portfolio when URL parameter changes
//   useEffect(() => {
//     if (portfolioId && portfolioId !== selectedPortfolioId) {
//       selectPortfolio(portfolioId);
//     }
//   }, [portfolioId, selectedPortfolioId, selectPortfolio]);
  
//   // Update URL when selected portfolio changes
//   useEffect(() => {
//     if (selectedPortfolioId && selectedPortfolioId !== portfolioId) {
//       navigate(`/portfolios/${selectedPortfolioId}`);
//     }
//   }, [selectedPortfolioId, portfolioId, navigate]);
  
//   // Handle initial portfolio selection
//   useEffect(() => {
//     // If we have portfolios but none selected, select the first one
//     if (portfolios.length > 0 && !selectedPortfolioId) {
//       selectPortfolio(portfolios[0].id);
//     }
//   }, [portfolios, selectedPortfolioId, selectPortfolio]);
  
//   // Handle loading state
//   if (isLoading && portfolios.length === 0) {
//     return (
//       <div className="flex items-center justify-center h-64">
//         <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-2" />
//         <span>Loading portfolios...</span>
//       </div>
//     );
//   }
  
//   // Handle error state
//   if (error && portfolios.length === 0) {
//     return (
//       <div className="flex flex-col items-center justify-center h-64">
//         <p className="text-red-500 mb-4">{error}</p>
//         <button 
//           onClick={() => loadPortfolios({ forceRefresh: true })}
//           className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
//         >
//           Retry
//         </button>
//       </div>
//     );
//   }
  
//   // Handle creating a new portfolio
//   if (showCreate) {
//     return <PortfolioCreate onCancel={() => navigate('/portfolios')} />;
//   }
  
//   // Handle empty portfolios
//   if (portfolios.length === 0) {
//     return <PortfolioEmpty onCreate={() => navigate('/portfolios/create')} />;
//   }
  
//   // Find the selected portfolio
//   const selectedPortfolio = portfolios.find(p => p.id === selectedPortfolioId);
  
//   return (
//     <div className="space-y-6">
//       {/* Portfolio selector */}
//       <PortfolioSelector
//         portfolios={portfolios}
//         selectedId={selectedPortfolioId}
//         onChange={selectPortfolio}
//         onAdd={() => navigate('/portfolios/create')}
//       />
      
//       {/* Portfolio view or empty state */}
//       {selectedPortfolio ? (
//         <PortfolioView
//           portfolio={selectedPortfolio}
//           marketStatus={marketStatus}
//           lastRefreshTime={lastRefreshTime}
//         />
//       ) : (
//         <div className="text-center py-10">
//           <p className="text-gray-500 mb-6">
//             No portfolio selected. Please select a portfolio from the dropdown above.
//           </p>
//           <button
//             onClick={() => navigate('/portfolios/create')}
//             className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 inline-flex items-center"
//           >
//             <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
//             </svg>
//             Create New Portfolio
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PortfolioPage;