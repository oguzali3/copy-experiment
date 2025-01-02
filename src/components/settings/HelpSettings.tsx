import { ChevronRight } from "lucide-react";

export const HelpSettings = () => {
  return (
    <section className="space-y-4">
      <h2 className="text-sm font-medium text-muted-foreground">HELP</h2>
      <div className="space-y-2">
        <div className="bg-card rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Contact Us</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card rounded-lg p-4 cursor-pointer hover:bg-accent/50 transition-colors">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">FAQs</span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </div>
      </div>
    </section>
  );
};