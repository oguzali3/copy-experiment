import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/components/settings/UserSettings";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { VisibilitySettings } from "@/components/settings/VisibilitySettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { HelpSettings } from "@/components/settings/HelpSettings";

const Settings = () => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    navigate("/");
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Account Settings</h1>

      <div className="space-y-8">
        <UserSettings />
        <AppearanceSettings />
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
  );
};

export default Settings;