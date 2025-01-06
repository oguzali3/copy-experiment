import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PortfolioSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioName: string;
  onUpdateName: (name: string) => void;
}

export const PortfolioSettingsDialog = ({
  isOpen,
  onOpenChange,
  portfolioName,
  onUpdateName,
}: PortfolioSettingsDialogProps) => {
  const [newPortfolioName, setNewPortfolioName] = useState(portfolioName);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
              onChange={(e) => setNewPortfolioName(e.target.value)}
            />
          </div>
          <Button onClick={() => {
            onUpdateName(newPortfolioName);
            onOpenChange(false);
          }}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};