import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Copy, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WatchlistHeaderProps {
  watchlistName: string;
  onAddWatchlist: () => void;
  onCopyTable: () => void;
  onUpdateWatchlistName: (name: string) => void;
  isDisabled?: boolean; // New prop to disable interactions during operations
}

export const WatchlistHeader = ({
  watchlistName,
  onAddWatchlist,
  onCopyTable,
  onUpdateWatchlistName,
  isDisabled = false
}: WatchlistHeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState(watchlistName);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateWatchlistName = async () => {
    if (isDisabled || newWatchlistName === watchlistName) {
      setIsSettingsOpen(false);
      return;
    }
    
    setIsUpdating(true);
    try {
      await onUpdateWatchlistName(newWatchlistName);
      setIsSettingsOpen(false);
    } catch (error) {
      console.error('Error updating watchlist name:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{watchlistName}</h1>
      <div className="flex items-center gap-4">
        <Dialog open={isSettingsOpen} onOpenChange={isDisabled ? undefined : setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" disabled={isDisabled}>
              <Settings className="mr-2 h-4 w-4" />
              Watchlist Settings
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Watchlist Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Watchlist Name
                </label>
                <Input
                  id="name"
                  value={newWatchlistName}
                  onChange={(e) => setNewWatchlistName(e.target.value)}
                  disabled={isUpdating}
                />
              </div>
              <Button 
                onClick={handleUpdateWatchlistName} 
                disabled={isUpdating || newWatchlistName.trim() === ''}
                className={isUpdating ? 'opacity-70 cursor-not-allowed' : ''}
              >
                {isUpdating ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white rounded-full border-t-transparent"></div>
                    Updating...
                  </div>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" onClick={onCopyTable} disabled={isDisabled}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Table
        </Button>
        <Button 
          variant="outline" 
          className={`${isDisabled ? 'border-gray-300 text-gray-400' : 'text-green-600 border-green-600'}`} 
          onClick={onAddWatchlist} 
          disabled={isDisabled}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Watchlist
        </Button>
      </div>
    </div>
  );
};