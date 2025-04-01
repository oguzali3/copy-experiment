// src/pages/ModernSettingsPage.tsx
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppearanceSettings } from "@/components/settings/AppearanceSettings";
import { BillingSettings } from "@/components/settings/BillingSettings";
import { HelpSettings } from "@/components/settings/HelpSettings";
import { SubscriptionSettings } from "@/components/settings/SubscriptionSettings";
import { UserSettings } from "@/components/settings/UserSettings";
import { VisibilitySettings } from "@/components/settings/VisibilitySettings";
import ManageSubscriptionComponent from "@/components/settings/ManageSubscriptionComponent";
import { SocialHeader } from "@/components/social/SocialHeader";
import { SocialSidebar } from "@/components/social/SocialSidebar";
import { ChevronRight, Settings, User, CreditCard, Bell, HelpCircle, Moon } from "lucide-react";

const ModernSettingsPage = () => {
  const { user } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("account");
  
  const handleDarkModeToggle = (checked: boolean) => {
    setDarkMode(checked);
    // Here you would implement the actual dark mode toggle
    // document.documentElement.classList.toggle('dark', checked);
  };
  
  // Navigation items for the settings page
  const navigationItems = [
    { id: "account", label: "Account", icon: <User className="h-5 w-5" /> },
    { id: "subscription", label: "Subscription", icon: <Settings className="h-5 w-5" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="h-5 w-5" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-5 w-5" /> },
    { id: "appearance", label: "Appearance", icon: <Moon className="h-5 w-5" /> },
    { id: "help", label: "Help & Support", icon: <HelpCircle className="h-5 w-5" /> },
  ];
  
  // Render the selected section
  const renderSection = () => {
    switch (activeSection) {
      case "account":
        return <UserSettings />;
      case "subscription":
        return <ManageSubscriptionComponent />;
      case "billing":
        return <BillingSettings />;
      case "notifications":
        return (
          <section>
            <h2 className="text-sm font-medium text-muted-foreground mb-4">NOTIFICATIONS</h2>
            <div className="space-y-4">
              <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-center">
                  <span>Email Notifications</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
              <div className="bg-white dark:bg-[#2b2b35] rounded-lg p-4 shadow-lg border border-gray-100 dark:border-gray-800 hover:shadow-xl transition-shadow">
                <div className="flex justify-between items-center">
                  <span>Push Notifications</span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </section>
        );
      case "appearance":
        return <AppearanceSettings darkMode={darkMode} onDarkModeToggle={handleDarkModeToggle} />;
      case "help":
        return <HelpSettings />;
      default:
        return <UserSettings />;
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="fixed left-0 top-0 h-full w-[68px] border-r border-gray-200 dark:border-gray-800">
        <SocialSidebar />
      </div>
      
      <div className="fixed left-1/2 transform -translate-x-1/2" style={{
        width: '680px',
        marginLeft: '34px'
      }}>
        <div className="border-x border-gray-200 dark:border-gray-800 h-screen flex flex-col bg-white dark:bg-gray-900">
          <SocialHeader />
          <div className="flex-1 overflow-y-auto">
            <div className="px-6 py-8">
              <h1 className="text-2xl font-bold mb-8">Settings</h1>
              
              <div className="flex">
                {/* Sidebar Navigation */}
                <div className="w-64 pr-8">
                  <nav className="space-y-1">
                    {navigationItems.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`flex items-center p-3 rounded-lg cursor-pointer ${
                          activeSection === item.id 
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                            : "hover:bg-gray-100 dark:hover:bg-gray-800"
                        }`}
                      >
                        <div className="mr-3">
                          {item.icon}
                        </div>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </nav>
                </div>
                
                {/* Content Area */}
                <div className="flex-1">
                  {renderSection()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernSettingsPage;