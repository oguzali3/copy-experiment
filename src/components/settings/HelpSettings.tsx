import { ChevronRight } from "lucide-react";

export const HelpSettings = () => {
  return (
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-4">HELP</h2>
      <div className="space-y-2">
        <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center cursor-pointer">
            <span>Contact Us</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
        <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
          <div className="flex justify-between items-center cursor-pointer">
            <span>FAQs</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    </section>
  );
};