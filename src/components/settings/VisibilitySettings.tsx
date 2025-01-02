import { Switch } from "@/components/ui/switch";
import { Lock } from "lucide-react";

export const VisibilitySettings = () => {
  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-4">VISIBILITY</h2>
      <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <span>Owner Mode</span>
              <Lock className="h-4 w-4" />
            </div>
            <p className="text-sm text-muted-foreground">
              Hides all stock prices to analyze businesses like an owner would.
            </p>
          </div>
          <Switch />
        </div>
      </div>
    </section>
  );
};