import { Button } from "@/components/ui/button";
import { Settings, PlusCircle, RefreshCw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface PortfolioHeaderProps {
  portfolioName: string;
  lastUpdated: Date | null;
  onOpenSettings: () => void;
  onOpenAddPosition: () => void;
  onRefreshData: () => void;
  isRefreshing?: boolean;
}

export const PortfolioHeader = ({
  portfolioName,
  lastUpdated,
  onOpenSettings,
  onOpenAddPosition,
  onRefreshData,
  isRefreshing
}: PortfolioHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{portfolioName}</h1>
        {lastUpdated && (
          <p className="text-sm text-gray-500">
            Last updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onRefreshData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
        <Button variant="outline" onClick={onOpenSettings}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Button>
        <Button onClick={onOpenAddPosition}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Position
        </Button>
      </div>
    </div>
  );
};