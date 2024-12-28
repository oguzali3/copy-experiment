import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface PortfolioEmptyProps {
  onCreateClick: () => void;
}

export const PortfolioEmpty = ({ onCreateClick }: PortfolioEmptyProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)] space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-gray-900">Select a portfolio above to view your investments</h2>
        <p className="text-gray-500">Or</p>
        <p className="text-gray-500">Click 'Create Portfolio' to start tracking your investments</p>
      </div>
      <Button
        onClick={onCreateClick}
        className="bg-[#f5a623] hover:bg-[#f5a623]/90 text-white"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Portfolio
      </Button>
    </div>
  );
};