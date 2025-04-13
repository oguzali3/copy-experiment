// src/pages/Settings.tsx
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import ManageSubscriptionComponent from "@/components/settings/ManageSubscriptionComponent";
import { useLocation, useNavigate } from "react-router-dom";
import { Spinner } from "@/components/ui/loaders";
import { 
  CreditCard, 
  User, 
  Bell, 
  Settings as SettingsIcon, 
  FileText, 
  DollarSign, 
  Wallet, 
  ShoppingBag, 
} from "lucide-react";
import SubscriptionAPI from "@/services/subscriptionApi";

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const navigate = useNavigate();
  const location = useLocation();
  
  // Example settings states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  
  // Profile settings
  const [username, setUsername] = useState(user?.displayName || "");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  
  // Subscription states
  const [loadingSubscription, setLoadingSubscription] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [subscriptionLoaded, setSubscriptionLoaded] = useState(false);
  
  // Load user's current subscription
  useEffect(() => {
    const loadSubscription = async () => {
      try {
        setLoadingSubscription(true);
        const currentSubscription = await SubscriptionAPI.getCurrentSubscription();
        setSubscription(currentSubscription);
      } catch (error) {
        console.error('Error loading subscription data:', error);
      } finally {
        setLoadingSubscription(false);
        setSubscriptionLoaded(true);
      }
    };
    
    loadSubscription();
  }, []);
  
  // Handle URL params for tab selection
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const tabParam = urlParams.get('tab');
    
    if (tabParam && ['account', 'profile', 'notifications', 'subscription', 'billing', 'creator'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location]);
  
  // Update URL when tab changes without page reload
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update URL without navigating
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('tab', value);
    
    const newUrl = `${location.pathname}?${urlParams.toString()}`;
    window.history.pushState({ path: newUrl }, '', newUrl);
  };
  
  const handleSaveGeneral = () => {
    toast.success("Settings saved successfully");
  };
  
  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };
  
  const handleSaveNotifications = () => {
    toast.success("Notification preferences updated");
  };
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="account" className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Subscription</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <DollarSign className="h-4 w-4" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="creator" className="flex items-center gap-2" onClick={(e) => e.preventDefault()}>
            <Wallet className="h-4 w-4" />
            <span className="hidden sm:inline">Creator</span>
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account preferences and settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <div className="flex items-center justify-between">
                  <span>Dark Mode</span>
                  <Switch 
                    checked={darkMode} 
                    onCheckedChange={setDarkMode} 
                    id="theme"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <select 
                  id="language" 
                  className="w-full p-2 border rounded-md"
                  defaultValue="en"
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                </select>
              </div>
              
              <Button onClick={handleSaveGeneral}>Save Changes</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Profile Settings */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information and public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                />
              </div>
              
              <Button onClick={handleSaveProfile}>Update Profile</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifs">Email Notifications</Label>
                  <Switch 
                    id="emailNotifs" 
                    checked={emailNotifications} 
                    onCheckedChange={setEmailNotifications} 
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive notifications about your account activity via email
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifs">Push Notifications</Label>
                  <Switch 
                    id="pushNotifs" 
                    checked={pushNotifications} 
                    onCheckedChange={setPushNotifications} 
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications on your devices
                </p>
              </div>
              
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscription Settings */}
        <TabsContent value="subscription">
          <ManageSubscriptionComponent />
        </TabsContent>
        
        {/* Billing Settings */}
        <TabsContent value="billing">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Manage your payment methods for subscriptions and purchases</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingSubscription ? (
                  <div className="flex items-center justify-center p-8">
                    <Spinner size="md" label="Loading payment methods..." />
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between mb-4">
                      <h3 className="text-lg font-medium">Your Payment Methods</h3>
                      <Button variant="outline" onClick={() => navigate('/payment')}>
                        Add Payment Method
                      </Button>
                    </div>

                    {/* Display payment methods if available */}
                    <div className="space-y-4">
                      {subscriptionLoaded && subscription?.paymentMethods?.length > 0 ? (
                        subscription.paymentMethods.map((method) => (
                          <div 
                            key={method.id}
                            className="p-4 border rounded-lg flex items-center justify-between"
                          >
                            <div className="flex items-center">
                              <CreditCard className="h-5 w-5 mr-3 text-gray-500" />
                              <div>
                                <div className="font-medium">
                                  {method.brand} •••• {method.last4}
                                  {method.isDefault && (
                                    <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Expires {method.expiryMonth}/{method.expiryYear}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex space-x-2">
                              {!method.isDefault && (
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                >
                                  Set Default
                                </Button>
                              )}
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                disabled={method.isDefault}
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <CreditCard className="h-8 w-8 mx-auto mb-2" />
                          <p className="mb-4">No payment methods found</p>
                          <Button onClick={() => navigate('/payment')}>
                            Add Payment Method
                          </Button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>View and download your invoices and transaction history</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingSubscription ? (
                  <div className="flex items-center justify-center p-8">
                    <Spinner size="md" label="Loading billing history..." />
                  </div>
                ) : (
                  <>
                    {subscriptionLoaded && subscription?.billingHistory?.length > 0 ? (
                      <div className="overflow-x-auto rounded-md border">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {subscription.billingHistory.map((item) => (
                              <tr key={item.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {new Date(item.date).toLocaleDateString()}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {item.description}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  ${item.amount.toFixed(2)}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <Button variant="ghost" size="sm">
                                    <FileText className="h-4 w-4 mr-1" />
                                    Receipt
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <FileText className="h-8 w-8 mx-auto mb-2" />
                        <p>No billing history available</p>
                      </div>
                    )}
                    
                    <div className="mt-4 text-center">
                      <Button variant="outline" className="flex items-center mx-auto">
                        <FileText className="h-4 w-4 mr-2" />
                        View Billing Portal
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Creator Settings */}
        <TabsContent value="creator">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Creator Subscription Settings</CardTitle>
                <CardDescription>Manage how others can subscribe to your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between mb-4">
                  <h3 className="text-lg font-medium">Portfolio Visibility & Pricing</h3>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/portfolio-pricing')}
                  >
                    Manage Pricing
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <ShoppingBag className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <div className="font-medium">Portfolio Subscriptions</div>
                          <div className="text-sm text-gray-500">
                            Control which portfolios are available to subscribers
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/portfolio-subscriptions')}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <div className="font-medium">Subscription Pricing</div>
                          <div className="text-sm text-gray-500">
                            Set subscription prices and plans for your portfolios
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/portfolio-pricing')}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Wallet className="h-5 w-5 mr-3 text-gray-500" />
                        <div>
                          <div className="font-medium">Payment Processing</div>
                          <div className="text-sm text-gray-500">
                            Connect Stripe to receive subscription payments
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate('/creator/connect')}
                      >
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    className="w-full"
                    onClick={() => navigate('/creator/payments')}
                  >
                    <SettingsIcon className="h-4 w-4 mr-2" />
                    Go to Creator Dashboard
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Analytics</CardTitle>
                <CardDescription>Track performance of your subscription content</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 border rounded-lg mb-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">Total Subscribers</div>
                      <div className="text-2xl font-bold">0</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">Monthly Revenue</div>
                      <div className="text-2xl font-bold">$0</div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  className="w-full" 
                  onClick={() => navigate('/creator/payments?tab=overview')}
                >
                  View Full Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;