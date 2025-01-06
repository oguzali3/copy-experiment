import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CompanySearch } from "../../CompanySearch";

interface AddPositionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddPosition: (company: any, shares: string, avgPrice: string) => void;
}

export const AddPositionDialog = ({
  isOpen,
  onOpenChange,
  onAddPosition,
}: AddPositionDialogProps) => {
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [shares, setShares] = useState("");
  const [avgPrice, setAvgPrice] = useState("");

  const handleAddPosition = () => {
    if (!selectedCompany || !shares || !avgPrice) return;
    onAddPosition(selectedCompany, shares, avgPrice);
    setSelectedCompany(null);
    setShares("");
    setAvgPrice("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Position to Portfolio</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {!selectedCompany ? (
            <CompanySearch onCompanySelect={setSelectedCompany} />
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-sm font-medium">Selected Stock</label>
                <div className="p-2 bg-gray-50 rounded">
                  {selectedCompany.name} ({selectedCompany.ticker})
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Number of Shares</label>
                <Input
                  type="number"
                  value={shares}
                  onChange={(e) => setShares(e.target.value)}
                  placeholder="Enter number of shares"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Average Price</label>
                <Input
                  type="number"
                  value={avgPrice}
                  onChange={(e) => setAvgPrice(e.target.value)}
                  placeholder="Enter average price"
                />
              </div>
              <Button onClick={handleAddPosition}>
                Add Position
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};