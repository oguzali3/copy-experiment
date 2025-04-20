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
import { 
  DollarSign, 
  Users, 
  CreditCard, 
  Settings,
  FileText,
  Download,
  CalendarDays,
  ExternalLink
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import CreatorSubscriptionDashboard from './CreatorSubscriptionDashboard';
import CreatorStripeConnect from './CreatorStripeConnect';
import PortfolioPricingManager from './PortfolioPricingManager';
import CreatorAnalyticsDashboard from './CreatorAnalyticsDashboard';

// Import our custom components

const CreatorPaymentsPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isStripeConnected, setIsStripeConnected] = useState(true);
  
  // Sample earnings data for the earnings tab
  const monthlyEarnings = [
    { month: 'Jan', earnings: 380.50 },
    { month: 'Feb', earnings: 420.75 },
    { month: 'Mar', earnings: 560.25 },
    { month: 'Apr', earnings: 670.50 },
    { month: 'May', earnings: 890.00 },
    { month: 'Jun', earnings: 1120.75 }
  ];
  
  // Payouts data
  const payouts = [
    { id: 'pmt-001', date: '2023-06-01', amount: 1120.75, status: 'Completed' },
    { id: 'pmt-002', date: '2023-05-01', amount: 890.00, status: 'Completed' },
    { id: 'pmt-003', date: '2023-04-01', amount: 670.50, status: 'Completed' },
    { id: 'pmt-004', date: '2023-03-01', amount: 560.25, status: 'Completed' }
  ];
  
  // Current earnings period stats
  const currentPeriod = {
    startDate: new Date(2023, 5, 1), // June 1, 2023
    endDate: new Date(2023, 5, 30),  // June 30, 2023
    currentEarnings: 840.50,
    estimatedTotal: 1250.00,
    daysLeft: 12,
    percentComplete: 60
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const renderCurrentPeriodCard = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Current Earnings Period</CardTitle>
          <CardDescription>
            {formatDate(currentPeriod.startDate)} - {formatDate(currentPeriod.endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Current Earnings</span>
              <span className="font-medium">{formatCurrency(currentPeriod.currentEarnings)}</span>
            </div>
            <Progress value={currentPeriod.percentComplete} className="h-2" />
            <div className="flex justify-between text-sm">
              <span>{currentPeriod.percentComplete}% of month complete</span>
              <span>Est. Total: {formatCurrency(currentPeriod.estimatedTotal)}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg flex items-center space-x-3">
            <CalendarDays className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-300">Next Payout</h3>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                {formatDate(currentPeriod.endDate)} ({currentPeriod.daysLeft} days left)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };
  
  const renderEarningsHistoryTable = () => {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            Your most recent payouts from subscription revenue
          </CardDescription>
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
                {payouts.map((payout) => (
                  <tr key={payout.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatDate(payout.date)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(payout.amount)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                        {payout.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" className="h-8 px-2">
                        <FileText className="h-4 w-4" />
                        <span className="sr-only">View invoice</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="justify-end">
          <Button variant="outline" size="sm" className="gap-2">
            <Download className="h-4 w-4" />
            Export History
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Creator Payments</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your subscription earnings, portfolio pricing, and payment settings
          </p>
        </div>
        
        {!isStripeConnected && (
          <Alert className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800">
            <AlertTitle>Connect Stripe to receive payments</AlertTitle>
            <AlertDescription>
              Before you can accept subscription payments, you need to connect your Stripe account.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
            <TabsTrigger value="settings">Pricing</TabsTrigger>
            <TabsTrigger value="connect">Connect</TabsTrigger>
          </TabsList>
          
          {/* Overview Tab */}
          <TabsContent value="overview">
            <CreatorSubscriptionDashboard />
          </TabsContent>
          {/* New Analytics Tab */}
          <TabsContent value="analytics">
            <CreatorAnalyticsDashboard />
          </TabsContent>
          {/* Earnings Tab */}
          <TabsContent value="earnings" className="space-y-6">
            {renderCurrentPeriodCard()}
            {renderEarningsHistoryTable()}
            
            <Card>
              <CardHeader>
                <CardTitle>Tax Documents</CardTitle>
                <CardDescription>
                  Access your tax forms and documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">2023 Form 1099-K</div>
                      <div className="text-sm text-gray-500">Not yet available</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Download
                  </Button>
                </div>
                
                <div className="flex justify-between items-center p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <FileText className="h-5 w-5 text-gray-500" />
                    <div>
                      <div className="font-medium">2022 Form 1099-K</div>
                      <div className="text-sm text-gray-500">Added Jan 31, 2023</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings">
            <PortfolioPricingManager />
          </TabsContent>
          
          {/* Connect Tab */}
          <TabsContent value="connect">
            <CreatorStripeConnect />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CreatorPaymentsPage;