import { ChevronRight } from "lucide-react";

export const SubscriptionSettings = () => {
  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-4">SUBSCRIPTION</h2>
      <div className="space-y-2">
        <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center">
            <span>Current Plan</span>
            <span className="text-muted-foreground">Free</span>
          </div>
        </div>
        <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center cursor-pointer">
            <span>Upgrade</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
};