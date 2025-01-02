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
    <div className="flex justify-between items-center space-x-4">
      <span className="text-base font-medium">Email</span>
      <Input
        type="email"
        value={email}
        onChange={handleEmailChange}
        className="max-w-[300px]"
        placeholder="Enter your email"
      />
    </div>
  );
};