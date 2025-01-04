import { Search, Loader } from "lucide-react";

interface PortfolioSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  isLoading: boolean;
}

export const PortfolioSearchInput = ({ value, onChange, isLoading }: PortfolioSearchInputProps) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search stocks..."
      />
      {isLoading && (
        <Loader className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
      )}
    </div>
  );
};