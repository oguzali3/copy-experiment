import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/components/settings/UserSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { VisibilitySettings } from "@/components/settings/VisibilitySettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { HelpSettings } from "@/components/settings/HelpSettings";

const Settings = () => {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <>
      <DashboardSidebar />
      <div className="flex-1 flex flex-col">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

          <div className="space-y-8">
            <UserSettings />
            <AppearanceSettings darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} />
            <VisibilitySettings />
            <SubscriptionSettings />
            <BillingSettings />
            <HelpSettings />

            <Button 
              variant="destructive" 
              className="w-full" 
              onClick={handleLogout}
            >
              LOGOUT
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;