import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Stock } from "../types";
import { toast } from "sonner";

interface TrimPositionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stocks: Stock[];
  onTrimPosition: (stock: Stock, sharesToTrim: number) => void;
}

export const TrimPositionDialog = ({
  isOpen,
  onOpenChange,
  stocks,
  onTrimPosition,
}: TrimPositionDialogProps) => {
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [sharesToTrim, setSharesToTrim] = useState("");

  const handleTrimPosition = () => {
    if (!selectedStock || !sharesToTrim) {
      toast.error("Please select a stock and enter shares to trim");
      return;
    }

    const trimAmount = Number(sharesToTrim);
    if (trimAmount <= 0) {
      toast.error("Please enter a valid number of shares to trim");
      return;
    }

    if (trimAmount >= selectedStock.shares) {
      toast.error("Cannot trim more shares than you own");
      return;
    }

    onTrimPosition(selectedStock, trimAmount);
    setSelectedStock(null);
    setSharesToTrim("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Trim Position</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Stock</label>
            <select
              className="w-full p-2 border rounded"
              value={selectedStock?.ticker || ""}
              onChange={(e) => {
                const stock = stocks.find(s => s.ticker === e.target.value);
                setSelectedStock(stock || null);
              }}
            >
              <option value="">Select a stock</option>
              {stocks.map(stock => (
                <option key={stock.ticker} value={stock.ticker}>
                  {stock.name} ({stock.ticker}) - Current shares: {stock.shares}
                </option>
              ))}
            </select>
          </div>
          {selectedStock && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Shares to Trim</label>
              <Input
                type="number"
                value={sharesToTrim}
                onChange={(e) => setSharesToTrim(e.target.value)}
                placeholder="Enter number of shares to trim"
                max={selectedStock.shares - 1}
                min={1}
              />
            </div>
          )}
          <Button onClick={handleTrimPosition}>
            Trim Position
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};