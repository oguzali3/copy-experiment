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
    <section>
      <h2 className="text-sm font-medium text-muted-foreground mb-4">USER SETTINGS</h2>
      <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center">
          <span>Email</span>
          <Input
            type="email"
            value={email}
            onChange={handleEmailChange}
            className="max-w-[300px]"
          />
        </div>
      </div>
    </section>
  );
};