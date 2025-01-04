import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CompanySearch } from "@/components/CompanySearch";
import { Stock } from "../PortfolioContent";

interface PortfolioDialogsProps {
  isSettingsOpen: boolean;
  isAddingTicker: boolean;
  newPortfolioName: string;
  selectedCompany: any;
  shares: string;
  avgPrice: string;
  onSettingsClose: () => void;
  onAddTickerClose: () => void;
  onPortfolioNameChange: (name: string) => void;
  onUpdatePortfolioName: () => void;
  onAddTicker: (company: any) => void;
  onAddPosition: () => void;
  onSharesChange: (value: string) => void;
  onAvgPriceChange: (value: string) => void;
}

export const PortfolioDialogs = ({
  isSettingsOpen,
  isAddingTicker,
  newPortfolioName,
  selectedCompany,
  shares,
  avgPrice,
  onSettingsClose,
  onAddTickerClose,
  onPortfolioNameChange,
  onUpdatePortfolioName,
  onAddTicker,
  onAddPosition,
  onSharesChange,
  onAvgPriceChange,
}: PortfolioDialogsProps) => {
  return (
    <>
      <Dialog open={isSettingsOpen} onOpenChange={onSettingsClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Portfolio Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Portfolio Name
              </label>
              <Input
                id="name"
                value={newPortfolioName}
                onChange={(e) => onPortfolioNameChange(e.target.value)}
              />
            </div>
            <Button onClick={onUpdatePortfolioName}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isAddingTicker} onOpenChange={onAddTickerClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Position to Portfolio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {!selectedCompany ? (
              <CompanySearch onCompanySelect={onAddTicker} />
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
                    onChange={(e) => onSharesChange(e.target.value)}
                    placeholder="Enter number of shares"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Average Price</label>
                  <Input
                    type="number"
                    value={avgPrice}
                    onChange={(e) => onAvgPriceChange(e.target.value)}
                    placeholder="Enter average price"
                  />
                </div>
                <Button onClick={onAddPosition}>
                  Add Position
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};