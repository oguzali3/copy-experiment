// src/components/portfolio/dialogs/SellPositionDialog.tsx
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Stock } from "../types";
import { toast } from "sonner";

interface SellPositionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  position: Stock | null;
  onSellPosition: (ticker: string, shares: number, price: number) => void | Promise<void>;
}

export const SellPositionDialog = ({
  isOpen,
  onOpenChange,
  position,
  onSellPosition,
}: SellPositionDialogProps) => {
  const [shares, setShares] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when dialog opens with a new position
  useEffect(() => {
    if (isOpen && position) {
      setShares("");
    }
  }, [isOpen, position]);

  const handleSellPosition = async () => {
    if (!position) return;
    
    const sharesNum = Number(shares);
    const priceNum = position.currentPrice; // Always use the current price
    
    if (isNaN(sharesNum)) {
      toast.error("Please enter a valid number for shares");
      return;
    }

    if (sharesNum <= 0) {
      toast.error("Shares must be greater than zero");
      return;
    }

    if (sharesNum > position.shares) {
      toast.error(`You can't sell more than ${position.shares} shares`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onSellPosition(position.ticker, sharesNum, priceNum);
      onOpenChange(false);
    } catch (error) {
      console.error("Error selling position:", error);
      toast.error("Failed to sell position");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Sell {position?.ticker} - {position?.name}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Current Holdings:</label>
            <div className="text-sm">
              <div><span className="font-medium">Shares:</span> {position?.shares.toLocaleString()}</div>
              <div><span className="font-medium">Avg Price:</span> ${position?.avgPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
              <div><span className="font-medium">Current Value:</span> ${position?.marketValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Shares to Sell:</label>
            <Input
              type="number"
              placeholder="Enter number of shares"
              value={shares}
              onChange={(e) => setShares(e.target.value)}
              min="0"
              max={position?.shares.toString()}
              step="any"
            />
            {position && shares && (
              <div className="text-xs text-gray-500">
                {Number(shares) === position.shares ? 
                  "This will sell your entire position" : 
                  `You will have ${(position.shares - Number(shares)).toLocaleString()} shares remaining`}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sell Price:</label>
            <div className="p-3 border rounded-md bg-gray-50 text-gray-700">
              ${position?.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <div className="text-xs text-gray-500 mt-1">
                Market price (fixed)
              </div>
            </div>
            {position && shares && (
              <div className="text-xs text-gray-500">
                Sell value: ${(Number(shares) * position.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSellPosition}
            disabled={!shares || isSubmitting}
            className={Number(shares) === position?.shares ? "bg-red-600 hover:bg-red-700" : ""}
          >
            {isSubmitting ? 
              "Processing..." : 
              Number(shares) === position?.shares ? 
                "Sell Entire Position" : "Sell Partial Position"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};