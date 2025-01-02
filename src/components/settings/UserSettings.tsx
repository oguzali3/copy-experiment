import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

export const UserSettings = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    toast({
      title: "Email updated",
      description: "Your email has been successfully updated.",
    });
  };

  return (
    <div className="bg-card rounded-lg p-6">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">Email</span>
        <Input
          type="email"
          value={email}
          onChange={handleEmailChange}
          className="max-w-[300px]"
          placeholder="Enter your email"
        />
      </div>
    </div>
  );
};