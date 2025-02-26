import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/components/settings/UserSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { VisibilitySettings } from "@/components/settings/VisibilitySettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { HelpSettings } from "@/components/settings/HelpSettings";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Settings = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Initialize dark mode state based on system preference or previous setting
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);
  
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };
  
  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      toast.success("You have been logged out successfully");
      // The navigation to home page will be handled in the AuthContext's signOut method
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "There was a problem logging out");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>
      
      <div className="space-y-8">
        <UserSettings />
        <AppearanceSettings 
          darkMode={darkMode}
          onDarkModeToggle={handleDarkModeToggle}
        />
        <VisibilitySettings />
        <SubscriptionSettings />
        <BillingSettings />
        <HelpSettings />
        
        <Button
          variant="destructive"
          className="w-full"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "LOGGING OUT..." : "LOGOUT"}
        </Button>
      </div>
    </div>
  );
};

export default Settings;