import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const SearchBar = () => {
  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input 
        type="text"
        placeholder="Search stocks..."
        className="pl-10 bg-white border-none text-black placeholder:text-gray-400 focus-visible:ring-white/20"
      />
    </div>
  );
};