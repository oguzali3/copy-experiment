import { Input } from "@/components/ui/input";

interface PortfolioHeaderProps {
  name: string;
  onNameChange: (name: string) => void;
}

export const PortfolioHeader = ({ name, onNameChange }: PortfolioHeaderProps) => {
  return (
    <div className="space-y-2">
      <label className="text-orange-500 font-medium">Portfolio Name</label>
      <Input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Enter Portfolio Name"
        className="border-b-orange-500 border-b-2"
      />
    </div>
  );
};