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
}

export const WatchlistHeader = ({
  watchlistName,
  onAddWatchlist,
  onCopyTable,
  onUpdateWatchlistName,
}: WatchlistHeaderProps) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [newWatchlistName, setNewWatchlistName] = useState(watchlistName);

  const handleUpdateWatchlistName = () => {
    onUpdateWatchlistName(newWatchlistName);
    setIsSettingsOpen(false);
  };

  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-semibold">{watchlistName}</h1>
      <div className="flex items-center gap-4">
        <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">
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
                />
              </div>
              <Button onClick={handleUpdateWatchlistName}>
                Save Changes
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        
        <Button variant="outline" onClick={onCopyTable}>
          <Copy className="mr-2 h-4 w-4" />
          Copy Table
        </Button>
        <Button variant="outline" className="text-green-600 border-green-600" onClick={onAddWatchlist}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Watchlist
        </Button>
      </div>
    </div>
  );
};