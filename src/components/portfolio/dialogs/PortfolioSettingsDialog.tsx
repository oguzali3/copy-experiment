// src/components/portfolio/dialogs/PortfolioSettingsDialog.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PortfolioVisibilityToggle } from '../PortfolioVisibilityToggle';
import { PortfolioVisibility } from '@/constants/portfolioVisibility';

interface PortfolioSettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  portfolioName: string;
  portfolioVisibility: PortfolioVisibility;
  portfolioId: string;
  onUpdateName: (newName: string) => void;
  onUpdateVisibility?: (newVisibility: PortfolioVisibility) => void;
}

export const PortfolioSettingsDialog: React.FC<PortfolioSettingsDialogProps> = ({
  isOpen,
  onOpenChange,
  portfolioName,
  portfolioVisibility,
  portfolioId,
  onUpdateName,
  onUpdateVisibility
}) => {
  const [name, setName] = useState(portfolioName);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    if (!name.trim()) return;
    
    setIsSaving(true);
    
    // Only update if name changed
    if (name !== portfolioName) {
      onUpdateName(name);
    }
    
    setIsSaving(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Portfolio Settings</DialogTitle>
          <DialogDescription>
            Update your portfolio details and visibility settings
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="portfolio-name">Portfolio Name</Label>
            <Input
              id="portfolio-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter portfolio name"
            />
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-2">
            <Label htmlFor="portfolio-visibility">Visibility</Label>
            <div className="flex items-center justify-between">
              <PortfolioVisibilityToggle
                portfolioId={portfolioId}
                portfolioName={portfolioName}
                currentVisibility={portfolioVisibility}
                onVisibilityChange={onUpdateVisibility}
                disabled={isSaving}
              />
              <div className="text-sm text-gray-500">
                {portfolioVisibility === PortfolioVisibility.PRIVATE && "Only visible to you"}
                {portfolioVisibility === PortfolioVisibility.PUBLIC && "Visible to everyone"}
                {portfolioVisibility === PortfolioVisibility.PAID && "Visible to subscribers only"}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};