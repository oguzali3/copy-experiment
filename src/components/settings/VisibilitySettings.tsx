import { Switch } from "@/components/ui/switch";
import { Lock } from "lucide-react";

export const VisibilitySettings = () => {
  return (
    <div className="bg-card rounded-lg p-4">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Owner Mode</span>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Hides all stock prices to analyze businesses like an owner would.
          </p>
        </div>
        <Switch />
      </div>
    </div>
  );
};