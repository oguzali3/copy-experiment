import { Button } from "@/components/ui/button";
import { Settings, PlusCircle } from "lucide-react";

interface PortfolioHeaderProps {
  portfolioName: string;
  lastUpdated: Date | null;
  onOpenSettings: () => void;
  onOpenAddPosition: () => void;
}

export const PortfolioHeader = ({
  portfolioName,
  lastUpdated,
  onOpenSettings,
  onOpenAddPosition
}: PortfolioHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{portfolioName}</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onOpenSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Portfolio Settings
        </Button>
        <Button 
          variant="outline" 
          className="text-green-600 border-green-600"
          onClick={onOpenAddPosition}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>
    </div>
  );
};