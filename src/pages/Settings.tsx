import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronRight, Lock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("oguzzerkan@gmail.com");
  const [darkMode, setDarkMode] = useState(false);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    toast({
      title: "Email updated",
      description: "Your email has been successfully updated.",
    });
  };

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
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

        <div className="space-y-8">
          {/* User Settings */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">USER SETTINGS</h2>
            <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
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

          {/* Appearance */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">APPEARANCE</h2>
            <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span>Dark Mode</span>
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
            </div>
          </section>

          {/* Visibility */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">VISIBILITY</h2>
            <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="flex items-center gap-2">
                    <span>Owner Mode</span>
                    <Lock className="h-4 w-4" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Hides all stock prices to analyze businesses like an owner would.
                  </p>
                </div>
                <Switch />
              </div>
            </div>
          </section>

          {/* Subscription */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">SUBSCRIPTION</h2>
            <div className="space-y-2">
              <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span>Current Plan</span>
                  <span className="text-muted-foreground">Free</span>
                </div>
              </div>
              <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
                <div className="flex justify-between items-center cursor-pointer">
                  <span>Upgrade</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </section>

          {/* Billing */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">BILLING</h2>
            <div className="space-y-2">
              <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
                <div className="flex justify-between items-center cursor-pointer">
                  <span>Payment Method</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
                <div className="flex justify-between items-center cursor-pointer">
                  <span>Invoices</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </section>

          {/* Help */}
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">HELP</h2>
            <div className="space-y-2">
              <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
                <div className="flex justify-between items-center cursor-pointer">
                  <span>Contact Us</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <div className="bg-card dark:bg-[#2b2b35] rounded-lg p-4">
                <div className="flex justify-between items-center cursor-pointer">
                  <span>FAQs</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </section>

          {/* Logout */}
          <Button 
            variant="destructive" 
            className="w-full" 
            onClick={handleLogout}
          >
            LOGOUT
          </Button>
        </div>
      </div>
    </>
  );
};

export default Settings;