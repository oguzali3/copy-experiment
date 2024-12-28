import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

interface WatchlistCreateProps {
  onSubmit: (name: string) => void;
  onCancel: () => void;
}

export const WatchlistCreate = ({ onSubmit, onCancel }: WatchlistCreateProps) => {
  const [name, setName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit(name.trim());
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-20">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Create New Watchlist</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-orange-500 font-medium">Watchlist Title</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New Watchlist Title"
              className="border-b-orange-500 border-b-2"
            />
            <p className="text-sm text-gray-500">
              This is the title for your new Watchlist (can change later)
            </p>
          </div>
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={!name.trim()}
            >
              Next
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};