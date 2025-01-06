import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface CompanySearchProps {
  onCompanySelect: (company: any) => void;
}

export const CompanySearch = ({ onCompanySelect }: CompanySearchProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleBulkPopulate = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('bulk-populate');
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: data.message,
      });
    } catch (error) {
      console.error('Error populating companies:', error);
      toast({
        title: "Error",
        description: "Failed to populate companies",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button 
          onClick={handleBulkPopulate} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? "Populating..." : "Populate Companies"}
        </Button>
      </div>
    </div>
  );
};