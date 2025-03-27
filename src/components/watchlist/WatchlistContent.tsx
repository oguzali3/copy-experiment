// src/components/watchlist/WatchlistContent.tsx
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { WatchlistEmpty } from "./WatchlistEmpty";
import { WatchlistCreate } from "./WatchlistCreate";
import { WatchlistView } from "./WatchlistView";
import { useWatchlist } from "@/contexts/WatchlistContext";
import { useNavigate } from "react-router-dom";

export const WatchlistContent = () => {
  const navigate = useNavigate();
  const { 
    watchlists, 
    selectedWatchlist, 
    availableMetrics,
    categorizedMetrics, 
    isLoading, 
    authError,
    setSelectedWatchlist,
    fetchWatchlists,
    createWatchlist,
    updateWatchlist,
    deleteWatchlist,
    addStock,
    deleteStock,
    refreshMetrics,
    addMetric,
    removeMetric
  } = useWatchlist();

  const [isCreating, setIsCreating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingOperation, setProcessingOperation] = useState("");
  
  // Add a ref to track if we've already initiated a fetch
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Only fetch once when the component mounts
    if (!hasFetchedRef.current && !isLoading) {
      hasFetchedRef.current = true;
      fetchWatchlists();
    }
  }, [fetchWatchlists, isLoading]);

  // Handle auth error
  if (authError) {
    return (
      <div className="text-center text-red-500 p-8">
        {authError}
        <div className="mt-4">
          <Button 
            onClick={() => navigate("/signin")}
            className="bg-[#f5a623] hover:bg-[#f5a623]/90 text-white"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  // Handle creating a new watchlist
  const handleCreateWatchlist = async (name: string) => {
    setIsProcessing(true);
    setProcessingOperation("Creating watchlist");
    try {
      await createWatchlist(name);
      setIsCreating(false);
    } catch (error) {
      console.error('Error in handleCreateWatchlist:', error);
    } finally {
      setIsProcessing(false);
      setProcessingOperation("");
    }
  };

  // Handle deleting a watchlist
  const handleDeleteWatchlist = async (id: string) => {
    setIsProcessing(true);
    setProcessingOperation("Deleting watchlist");
    try {
      await deleteWatchlist(id);
    } catch (error) {
      console.error('Error in handleDeleteWatchlist:', error);
    } finally {
      setIsProcessing(false);
      setProcessingOperation("");
    }
  };

  // Handle updating a watchlist
  const handleUpdateWatchlist = async (updatedWatchlist) => {
    setIsProcessing(true);
    setProcessingOperation("Updating watchlist");
    try {
      await updateWatchlist(updatedWatchlist);
    } catch (error) {
      console.error('Error in handleUpdateWatchlist:', error);
    } finally {
      setIsProcessing(false);
      setProcessingOperation("");
    }
  };

  // Handle adding a stock
  const handleAddStock = async (stock) => {
    try {
      await addStock(stock);
    } catch (error) {
      console.error('Error in handleAddStock:', error);
    }
  };

  // Handle deleting a stock
  const handleDeleteStock = async (ticker) => {
    try {
      await deleteStock(ticker);
    } catch (error) {
      console.error('Error in handleDeleteStock:', error);
    }
  };

  // Handle refreshing metrics
  const handleRefreshMetrics = async () => {
    try {
      await refreshMetrics();
    } catch (error) {
      console.error('Error in handleRefreshMetrics:', error);
    }
  };

  // Handle adding a metric
  const handleAddMetric = async (metricId) => {
    try {
      await addMetric(metricId);
    } catch (error) {
      console.error('Error in handleAddMetric:', error);
    }
  };

  // Handle removing a metric
  const handleRemoveMetric = async (metricId) => {
    try {
      await removeMetric(metricId);
    } catch (error) {
      console.error('Error in handleRemoveMetric:', error);
    }
  };

  // Loading state
  if (isLoading && watchlists.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Empty state - no watchlists
  if (watchlists.length === 0 && !isCreating) {
    return <WatchlistEmpty onCreateClick={() => setIsCreating(true)} />;
  }

  // Create state - creating a new watchlist
  if (isCreating) {
    return (
      <div className="relative">
        {/* Loading overlay for operations */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                <span>{processingOperation || "Processing..."}</span>
              </div>
            </div>
          </div>
        )}
        <WatchlistCreate 
          onSubmit={handleCreateWatchlist}
          onCancel={() => setIsCreating(false)}
          isSubmitting={isProcessing}
        />
      </div>
    );
  }

  // Main view - watchlist tabs and content
  return (
    <div className="space-y-6 relative">
      {/* Processing overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
              <span>{processingOperation || "Processing..."}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Watchlist tabs */}
      <div className="flex gap-2 border-b pb-4 overflow-x-auto">
        {watchlists.map((watchlist) => (
          <Button
            key={watchlist.id}
            variant={selectedWatchlist?.id === watchlist.id ? "default" : "ghost"}
            onClick={() => setSelectedWatchlist(watchlist)}
            className={selectedWatchlist?.id === watchlist.id ? "bg-[#f5a623] hover:bg-[#f5a623]/90 text-white" : ""}
            disabled={isProcessing}
          >
            {watchlist.name}
          </Button>
        ))}
        <Button 
          variant="outline" 
          className="text-green-600 border-green-600"
          onClick={() => setIsCreating(true)}
          disabled={isProcessing}
        >
          + New Watchlist
        </Button>
      </div>

      {/* Selected watchlist view - passing categorizedMetrics */}
      {selectedWatchlist && (
        <WatchlistView
          watchlist={selectedWatchlist}
          availableMetrics={availableMetrics}
          categorizedMetrics={categorizedMetrics}
          isLoading={isLoading || isProcessing}
          onAddWatchlist={() => setIsCreating(true)}
          onDeleteWatchlist={handleDeleteWatchlist}
          onUpdateWatchlist={handleUpdateWatchlist}
          onAddStock={handleAddStock}
          onDeleteStock={handleDeleteStock}
          onRefreshMetrics={handleRefreshMetrics}
          onAddMetric={handleAddMetric}
          onRemoveMetric={handleRemoveMetric}
        />
      )}
    </div>
  );
};