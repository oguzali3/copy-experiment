import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Settings, 
  Calendar,
  ArrowDown,
  ArrowUp,
  Download,
  BarChart,
  PieChart,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import CreatorSubscriptionAPI from '@/services/creatorSubscriptionApi';
import StripeConnectService from '@/services/stripeConnectApi';
import CreatorAnalyticsAPI from '@/services/creatorAnalyticsApi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('6m');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [stripeAccountStatus, setStripeAccountStatus] = useState({
    isConnected: false,
    needsOnboarding: true,
    isActive: false
  });
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState('');
  const [subscriberStatusFilter, setSubscriberStatusFilter] = useState('all');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  useEffect(() => {
   // Robust error handling for the fetchDashboardData function
const fetchDashboardData = async () => {
  try {
    setIsLoading(true);
    setError(null);
    
    // Initialize with default values
    let analyticsData = {
      totalSubscribers: 0,
      activeSubscribers: 0,
      monthlyRevenue: 0,
      subscriberGrowth: [],
      revenueByPortfolio: []
    };
    
    let accountStatus = {
      isConnected: false,
      needsOnboarding: true,
      isActive: false
    };
    
    // Fetch analytics data from the Creator Analytics API
    try {
      const analytics = await CreatorAnalyticsAPI.getCreatorAnalytics();
      if (analytics) {
        analyticsData = {
          totalSubscribers: analytics.totalSubscribers || 0,
          activeSubscribers: analytics.activeSubscribers || 0,
          monthlyRevenue: analytics.totalRevenue || 0,
          subscriberGrowth: [], // This would need transformation from analytics data
          revenueByPortfolio: analytics.portfolioAnalytics.map(p => ({
            portfolioId: p.portfolioId,
            portfolioName: p.portfolioName,
            revenue: p.revenue,
            subscriberCount: p.subscriberCount
          }))
        };
      }
      setAnalyticsData(analyticsData);
    } catch (analyticsError) {
      console.error('Error fetching analytics data:', analyticsError);
      // Continue execution to fetch other data
    }
    
    // Fetch Stripe Connect account status
    try {
      const status = await StripeConnectService.getAccountStatus();
      if (status) {
        accountStatus = status;
      }
      setStripeAccountStatus(accountStatus);
    } catch (stripeError) {
      console.error('Error fetching Stripe account status:', stripeError);
      // Continue execution with default status values
    }
    
    // Fetch subscribers if there are portfolios with revenue data
    if (analyticsData.revenueByPortfolio && analyticsData.revenueByPortfolio.length > 0) {
      try {
        const firstPortfolioId = analyticsData.revenueByPortfolio[0].portfolioId;
        if (firstPortfolioId) {
          const subscribersData = await CreatorSubscriptionAPI.getPortfolioSubscribers(firstPortfolioId);
          setSubscribers(Array.isArray(subscribersData) ? subscribersData : []);
        }
      } catch (subscribersError) {
        console.error('Error fetching subscribers:', subscribersError);
        setSubscribers([]);
      }
    } else {
      setSubscribers([]);
    }
    
    setIsLoading(false);
  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    setError('Failed to load dashboard data. Please try again later.');
    setIsLoading(false);
    
    // Set default empty data to prevent UI errors
    setAnalyticsData({
      totalSubscribers: 0,
      activeSubscribers: 0,
      monthlyRevenue: 0,
      subscriberGrowth: [],
      revenueByPortfolio: []
    });
    setSubscribers([]);
  }
};

    fetchDashboardData();
  }, [refreshTrigger]);
  
  const handleRefreshData = () => {
    // Clear cache to ensure fresh data
    CreatorSubscriptionAPI.clearCache();
    // Increment trigger to force a refresh
    setRefreshTrigger(prev => prev + 1);
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Trial':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Churned':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  const handleExportSubscribers = () => {
    // In a real app, this would generate and download a CSV file
    alert('Exporting subscribers data...');
  };
  
  // Filter subscribers based on search query and status filter
  const filteredSubscribers = subscribers.filter(subscriber => {
    // Filter by search query
    const matchesSearch = subscriberSearchQuery === '' ||
      subscriber.name.toLowerCase().includes(subscriberSearchQuery.toLowerCase()) ||
      subscriber.email.toLowerCase().includes(subscriberSearchQuery.toLowerCase());
    
    // Filter by status
    const matchesStatus = subscriberStatusFilter === 'all' || 
                          subscriber.status.toLowerCase() === subscriberStatusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });
  
  // If no analytics data is loaded, show loading or error state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <RefreshCw className="h-12 w-12 text-gray-300 animate-spin mb-4" />
        <p className="text-gray-600 dark:text-gray-400">Loading dashboard data...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (!stripeAccountStatus.isConnected || !stripeAccountStatus.isActive) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-1">Creator Dashboard</h2>
            <p className="text-gray-600 dark:text-gray-400">Set up payments to start accepting subscriptions</p>
          </div>
        </div>
        
        <Alert className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Connect payment processing</AlertTitle>
          <AlertDescription>
            Before you can view your dashboard and accept subscription payments, you need to connect your Stripe account.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Set Up Payments with Stripe</CardTitle>
            <CardDescription>
              Connect your Stripe account to start accepting payments from subscribers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>
                To start monetizing your content, you'll need to connect with Stripe, our payment processor.
              </p>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                <p className="font-medium mb-2">Here's what you'll need:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your legal name and address</li>
                  <li>Your bank account details for receiving payments</li>
                  <li>A valid government ID for verification</li>
                </ul>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => window.location.href = '/creator/payments?tab=connect'}>
              Connect with Stripe
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  // Calculate subscription metrics
  const totalSubscribers = analyticsData?.totalSubscribers || 0;
  const activeSubscribers = analyticsData?.activeSubscribers || 0;
  const monthlyRevenue = analyticsData?.monthlyRevenue || 0;
  const subscriberGrowth = analyticsData?.subscriberGrowth || [];
  const revenueByPortfolio = analyticsData?.revenueByPortfolio || [];
  
  // Calculate growth rate (comparing the last two months)
  const calculateGrowthRate = () => {
    if (subscriberGrowth.length < 2) return 0;
    
    const lastMonth = subscriberGrowth[subscriberGrowth.length - 1];
    const previousMonth = subscriberGrowth[subscriberGrowth.length - 2];
    
    const lastMonthNet = lastMonth.newSubscribers - lastMonth.churned;
    const previousMonthNet = previousMonth.newSubscribers - previousMonth.churned;
    
    if (previousMonthNet === 0) return lastMonthNet > 0 ? 100 : 0;
    
    return ((lastMonthNet - previousMonthNet) / Math.abs(previousMonthNet)) * 100;
  };
  
  const growthRate = calculateGrowthRate();
  
  // Calculate churn rate
  const calculateChurnRate = () => {
    if (totalSubscribers === 0) return 0;
    
    const totalChurned = subscriberGrowth.reduce((sum, month) => sum + month.churned, 0);
    return (totalChurned / (totalSubscribers + totalChurned)) * 100;
  };
  
  const churnRate = calculateChurnRate();
  
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-1">Creator Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscribers and subscription revenue
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1w">Last week</SelectItem>
              <SelectItem value="1m">Last month</SelectItem>
              <SelectItem value="3m">Last 3 months</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" className="flex items-center gap-2" onClick={handleRefreshData}>
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          
          <Button variant="outline" className="flex items-center gap-2" onClick={() => window.location.href = '/creator/payments'}>
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>
        
        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid gap-3 grid-cols-2 md:grid-cols-4"> {/* Reduced gap */}

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Total Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold">{totalSubscribers}</span>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  {growthRate > 0 ? (
                    <>
                      <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-600">{growthRate.toFixed(1)}% this month</span>
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-600">{Math.abs(growthRate).toFixed(1)}% this month</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Monthly Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-2xl font-bold">${monthlyRevenue}</span>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">
                    {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Active Subscribers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-purple-600 mr-2" />
                  <span className="text-2xl font-bold">{activeSubscribers}</span>
                </div>
                <div className="text-sm mt-2 text-gray-500">
                  {totalSubscribers > 0 ? 
                    `${((activeSubscribers / totalSubscribers) * 100).toFixed(0)}% of total subscribers` : 
                    'No subscribers yet'}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Churn Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-orange-600 mr-2" />
                  <span className="text-2xl font-bold">{churnRate.toFixed(1)}%</span>
                </div>
                <div className="text-sm mt-2 text-gray-500">
                  {churnRate <= 5 ? 'Healthy retention' : 'Needs improvement'}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Charts */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Growth</CardTitle>
                <CardDescription>Monthly new and churned subscribers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart
                      data={subscriberGrowth}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" tickFormatter={(date) => {
                        const d = new Date(date);
                        return `${d.toLocaleString('default', { month: 'short' })}`;
                      }} />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="newSubscribers" name="New Subscribers" fill="#82ca9d" />
                      <Bar dataKey="churned" name="Churned" fill="#ff8042" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Portfolio</CardTitle>
                <CardDescription>How your portfolios contribute to revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={revenueByPortfolio}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="portfolioName"
                        label={({ portfolioName, percent }) => `${portfolioName} ${(percent * 100).toFixed(0)}%`}
                      >
                        {revenueByPortfolio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [`$${value}`, name]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your subscription business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 p-2">
                  <BarChart className="h-6 w-6 mb-2" />
                  <span>View Analytics</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 p-2" onClick={() => setActiveTab('subscribers')}>
                  <Users className="h-6 w-6 mb-2" />
                  <span>Manage Subscribers</span>
                </Button>
                <Button variant="outline" className="flex flex-col items-center justify-center h-24 p-2" onClick={() => window.location.href = '/creator/payments?tab=settings'}>
                  <Settings className="h-6 w-6 mb-2" />
                  <span>Update Pricing</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Subscribers Tab */}
        <TabsContent value="subscribers" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <CardTitle>Subscriber List</CardTitle>
                <CardDescription>
                  Manage your current subscribers
                </CardDescription>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Search subscribers..."
                    className="pl-8 w-full sm:w-[200px] lg:w-[300px]"
                    value={subscriberSearchQuery}
                    onChange={(e) => setSubscriberSearchQuery(e.target.value)}
                  />
                  <Users className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                </div>
                
                <Select
                  value={subscriberStatusFilter}
                  onValueChange={setSubscriberStatusFilter}
                >
                  <SelectTrigger className="w-full sm:w-[150px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="trial">Trial</SelectItem>
                    <SelectItem value="churned">Churned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subscriber</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Join Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Lifetime Value</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredSubscribers.length > 0 ? (
                      filteredSubscribers.map((subscriber) => (
                        <tr key={subscriber.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {/* <Avatar className="h-8 w-8 mr-3">
                                <AvatarFallback>{subscriber.name.slice(0, 2)}</AvatarFallback>
                              </Avatar> */}
                              <div className="flex flex-col">
                                <div className="font-medium text-gray-900 dark:text-white">{subscriber.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{subscriber.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                            {new Date(subscriber.joinDate).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(subscriber.status)}`}>
                              {subscriber.status}
                            </span>
                          </td>
                          
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                  <span className="sr-only">Open menu</span>
                                  <ChevronDown className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Email Subscriber</DropdownMenuItem>
                                <DropdownMenuItem>View Payment History</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                          {subscriberSearchQuery || subscriberStatusFilter !== 'all' ? 
                            'No subscribers match your filters' : 
                            'No subscribers yet'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <div className="text-sm text-gray-500">
                Showing {filteredSubscribers.length} of {subscribers.length} subscribers
              </div>
              <Button variant="outline" size="sm" onClick={handleExportSubscribers}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </CardFooter>
          </Card>
          
          {/* Subscriber Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Subscriber Retention</CardTitle>
                <CardDescription>Retention rate by subscription month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 1, retention: 100 },
                        { month: 2, retention: 85 },
                        { month: 3, retention: 75 },
                        { month: 4, retention: 70 },
                        { month: 5, retention: 65 },
                        { month: 6, retention: 60 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip formatter={(value) => [`${value}%`, 'Retention']} />
                      <Line type="monotone" dataKey="retention" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Lifetime Value</CardTitle>
                <CardDescription>Average revenue per subscriber over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: 1, ltv: 9.99 },
                        { month: 2, ltv: 19.98 },
                        { month: 3, ltv: 29.97 },
                        { month: 4, ltv: 39.96 },
                        { month: 5, ltv: 49.95 },
                        { month: 6, ltv: 59.94 }
                      ]}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" label={{ value: 'Month', position: 'insideBottom', offset: -5 }} />
                      <YAxis label={{ value: 'LTV ($)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip formatter={(value) => [`$${value}`, 'Avg. LTV']} />
                      <Line type="monotone" dataKey="ltv" stroke="#82ca9d" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Monthly Recurring Revenue */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Monthly Recurring Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-2xl font-bold">${monthlyRevenue}</span>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-600">
                    {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}% from last month
                  </span>
                </div>
              </CardContent>
            </Card>
            
            {/* Annual Recurring Revenue */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Annual Recurring Revenue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <DollarSign className="h-5 w-5 text-green-600 mr-2" />
                  <span className="text-2xl font-bold">${monthlyRevenue * 12}</span>
                </div>
                <div className="text-sm mt-2 text-gray-500">
                  Projected for the next 12 months
                </div>
              </CardContent>
            </Card>
            
            {/* Average Revenue Per User */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Revenue Per User
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="text-2xl font-bold">
                    ${totalSubscribers > 0 ? (monthlyRevenue / totalSubscribers).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="text-sm mt-2 text-gray-500">
                  Monthly revenue per subscriber
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Revenue Charts */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Portfolio contribution to total revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="h-64 md:col-span-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={revenueByPortfolio}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="revenue"
                        nameKey="portfolioName"
                      >
                        {revenueByPortfolio.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value, name) => [`${value}`, name]} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="md:col-span-2">
                  <div className="space-y-4">
                    {revenueByPortfolio.map((portfolio, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div 
                            className="h-3 w-3 rounded-full mr-2" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span>{portfolio.portfolioName}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className="font-medium">${portfolio.revenue}</span>
                          <span className="text-sm text-gray-500">
                            {Math.round((portfolio.revenue / monthlyRevenue) * 100)}%
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4 border-t">
                      <div className="flex justify-between font-medium">
                        <span>Total Monthly Revenue</span>
                        <span>${monthlyRevenue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Earnings Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>Detailed breakdown of your subscription revenue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Total Revenue This Month</span>
                    <span className="font-medium text-black dark:text-white">${monthlyRevenue.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Platform Fees (10%)</span>
                    <span className="font-medium text-red-600">-${(monthlyRevenue * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Payment Processing Fees</span>
                    <span className="font-medium text-red-600">-${(monthlyRevenue * 0.029 + activeSubscribers * 0.3).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium pt-2 border-t">
                    <span>Net Earnings</span>
                    <span className="text-green-600">
                      ${(monthlyRevenue - (monthlyRevenue * 0.1) - (monthlyRevenue * 0.029 + activeSubscribers * 0.3)).toFixed(2)}
                    </span>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <h3 className="font-medium mb-2">Payment Processor Breakdown</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Stripe Connect Fee (2.9% + $0.30 per transaction)</span>
                      <span>${(monthlyRevenue * 0.029 + activeSubscribers * 0.3).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Platform Fee (10% of total revenue)</span>
                      <span>${(monthlyRevenue * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-sm text-blue-800 dark:text-blue-300">
                  <p className="font-medium">Next Payout: {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
                  <p>Your earnings are automatically deposited to your connected bank account on a weekly basis.</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Portfolio Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Pricing</CardTitle>
              <CardDescription>Manage subscription prices for your portfolios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {revenueByPortfolio.map((portfolio, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h3 className="font-medium">{portfolio.portfolioName}</h3>
                        <p className="text-sm text-gray-500">Monthly revenue: ${portfolio.revenue}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                          $9.99/month
                        </Badge>
                        <Badge variant="outline">
                          $99.99/year
                        </Badge>
                      </div>
                      
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/creator/payments?tab=settings'}>
                        Edit Pricing
                      </Button>
                    </div>
                  </div>
                ))}
                
                {revenueByPortfolio.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No portfolios with pricing set up yet.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => window.location.href = '/creator/payments?tab=settings'}
                    >
                      Set Up Portfolio Pricing
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => window.location.href = '/creator/payments?tab=settings'}>
                Manage All Pricing Settings
              </Button>
            </CardFooter>
          </Card>
          
          {/* Payouts and Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Payouts & Reports</CardTitle>
              <CardDescription>Your payment history and financial reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                    {[
                      { id: 'pmt-001', date: '2023-06-01', amount: 1120.75, status: 'Completed' },
                      { id: 'pmt-002', date: '2023-05-01', amount: 890.00, status: 'Completed' },
                      { id: 'pmt-003', date: '2023-04-01', amount: 670.50, status: 'Completed' },
                    ].map((payout) => (
                      <tr key={payout.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(payout.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          ${payout.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                            {payout.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm" className="h-8 px-2">
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/creator/payments?tab=connect'}>
                <ExternalLink className="h-4 w-4 mr-2" />
                Stripe Dashboard
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Download All Reports
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreatorDashboard;