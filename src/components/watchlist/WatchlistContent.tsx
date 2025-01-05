import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { WatchlistEmpty } from "./WatchlistEmpty";
import { WatchlistCreate } from "./WatchlistCreate";
import { WatchlistView } from "./WatchlistView";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Stock = {
  ticker: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
  metrics: {
    [key: string]: string | number;
  };
};

export type Watchlist = {
  id: string;
  name: string;
  stocks: Stock[];
  selectedMetrics: string[];
};

export const WatchlistContent = () => {
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    try {
      const { data: watchlistsData, error: watchlistsError } = await supabase
        .from('watchlists')
        .select('*');

      if (watchlistsError) throw watchlistsError;

      const watchlistsWithStocks = await Promise.all(
        watchlistsData.map(async (watchlist) => {
          const { data: stocksData, error: stocksError } = await supabase
            .from('watchlist_stocks')
            .select('*')
            .eq('watchlist_id', watchlist.id);

          if (stocksError) throw stocksError;

          return {
            ...watchlist,
            stocks: stocksData || [],
            selectedMetrics: [], // You might want to store this in the database as well
          };
        })
      );

      setWatchlists(watchlistsWithStocks);
    } catch (error) {
      console.error('Error fetching watchlists:', error);
      toast({
        title: "Error",
        description: "Failed to fetch watchlists",
        variant: "destructive",
      });
    }
  };

  const handleCreateWatchlist = async (name: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('watchlists')
        .insert([
          { name, user_id: user.user.id }
        ])
        .select()
        .single();

      if (error) throw error;

      const newWatchlist: Watchlist = {
        id: data.id,
        name: data.name,
        stocks: [],
        selectedMetrics: []
      };

      setWatchlists([...watchlists, newWatchlist]);
      setSelectedWatchlist(newWatchlist);
      setIsCreating(false);
      toast({
        title: "Success",
        description: "Watchlist created successfully",
      });
    } catch (error) {
      console.error('Error creating watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to create watchlist",
        variant: "destructive",
      });
    }
  };

  const handleDeleteWatchlist = async (id: string) => {
    try {
      const { error } = await supabase
        .from('watchlists')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setWatchlists(watchlists.filter(w => w.id !== id));
      if (selectedWatchlist?.id === id) {
        setSelectedWatchlist(null);
      }
      toast({
        title: "Success",
        description: "Watchlist deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to delete watchlist",
        variant: "destructive",
      });
    }
  };

  const handleUpdateWatchlist = async (updatedWatchlist: Watchlist) => {
    try {
      const { error } = await supabase
        .from('watchlists')
        .update({ name: updatedWatchlist.name })
        .eq('id', updatedWatchlist.id);

      if (error) throw error;

      setWatchlists(watchlists.map(w => 
        w.id === updatedWatchlist.id ? updatedWatchlist : w
      ));
      setSelectedWatchlist(updatedWatchlist);
      toast({
        title: "Success",
        description: "Watchlist updated successfully",
      });
    } catch (error) {
      console.error('Error updating watchlist:', error);
      toast({
        title: "Error",
        description: "Failed to update watchlist",
        variant: "destructive",
      });
    }
  };

  if (watchlists.length === 0 && !isCreating) {
    return (
      <WatchlistEmpty onCreateClick={() => setIsCreating(true)} />
    );
  }

  if (isCreating) {
    return (
      <WatchlistCreate 
        onSubmit={handleCreateWatchlist}
        onCancel={() => setIsCreating(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2 border-b pb-4">
        {watchlists.map((watchlist) => (
          <Button
            key={watchlist.id}
            variant={selectedWatchlist?.id === watchlist.id ? "default" : "ghost"}
            onClick={() => setSelectedWatchlist(watchlist)}
            className={selectedWatchlist?.id === watchlist.id ? "bg-[#f5a623] hover:bg-[#f5a623]/90 text-white" : ""}
          >
            {watchlist.name}
          </Button>
        ))}
      </div>

      {selectedWatchlist && (
        <WatchlistView
          watchlist={selectedWatchlist}
          onAddWatchlist={() => setIsCreating(true)}
          onDeleteWatchlist={handleDeleteWatchlist}
          onUpdateWatchlist={handleUpdateWatchlist}
        />
      )}
    </div>
  );
};