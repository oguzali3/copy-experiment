// src/components/analytics/CreatorAnalyticsDashboard.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import CreatorAnalyticsAPI from '@/services/creatorAnalyticsApi';
import { CreatorAnalyticsDto, PortfolioAnalyticsDto } from '@/types/analytics';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
};

const StatCard = ({ title, value, description, isLoading = false }: { 
  title: string, 
  value: string | number, 
  description?: string,
  isLoading?: boolean
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      {isLoading ? (
        <Skeleton className="h-8 w-32" />
      ) : (
        <>
          <div className="text-2xl font-bold">{value}</div>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </>
      )}
    </CardContent>
  </Card>
);

const CreatorAnalyticsDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<CreatorAnalyticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [portfolioAnalytics, setPortfolioAnalytics] = useState<PortfolioAnalyticsDto | null>(null);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [portfolioError, setPortfolioError] = useState<string | null>(null);


  // Fetch overall analytics
  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await CreatorAnalyticsAPI.getCreatorAnalytics({ timeframe });
        setAnalytics(data);
        
        // Default to first portfolio if one exists and none is selected
        if (data.portfolioAnalytics.length > 0 && !selectedPortfolioId) {
          setSelectedPortfolioId(data.portfolioAnalytics[0].portfolioId);
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeframe]);

  // Fetch specific portfolio analytics when selected
  useEffect(() => {
    if (!selectedPortfolioId) return;

    const fetchPortfolioAnalytics = async () => {
      setPortfolioLoading(true);
      setPortfolioError(null);
      try {
        const data = await CreatorAnalyticsAPI.getPortfolioAnalytics(
          selectedPortfolioId,
          { timeframe }
        );
        setPortfolioAnalytics(data);
      } catch (err) {
        console.error('Error fetching portfolio analytics:', err);
        setPortfolioError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
      } finally {
        setPortfolioLoading(false);
      }
    };

    fetchPortfolioAnalytics();
  }, [selectedPortfolioId, timeframe]);



  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Creator Analytics</h2>
        <Select value={timeframe} onValueChange={(value: any) => setTimeframe(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
            <SelectItem value="year">Yearly</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Overview Stats */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Subscribers" 
          value={isLoading ? '...' : analytics?.totalSubscribers || 0} 
          isLoading={isLoading}
        />
        <StatCard 
          title="Active Subscribers" 
          value={isLoading ? '...' : analytics?.activeSubscribers || 0}
          description={`${analytics?.churnRate?.toFixed(1) || 0}% churn rate`}
          isLoading={isLoading}
        />
        <StatCard 
          title="Revenue" 
          value={isLoading ? '...' : formatCurrency(analytics?.totalRevenue || 0)}
          isLoading={isLoading}
        />
        <StatCard 
          title="Projected Monthly" 
          value={isLoading ? '...' : formatCurrency(analytics?.projectedMonthlyRevenue || 0)}
          isLoading={isLoading}
        />
      </div>
      
      {/* Charts */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue</CardTitle>
            <CardDescription>Revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.revenueTimeSeries || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis tickFormatter={(value) => `$${value}`} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Revenue"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Subscribers</CardTitle>
            <CardDescription>Subscriber growth over time</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <p>Loading chart data...</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.subscriberTimeSeries || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="value"
                    name="Subscribers"
                    stroke="#82ca9d"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Portfolio Analysis */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Portfolio Performance</CardTitle>
            {analytics?.portfolioAnalytics.length > 0 && (
              <Select 
                value={selectedPortfolioId || ''} 
                onValueChange={(value) => setSelectedPortfolioId(value)}
              >
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Select a portfolio" />
                </SelectTrigger>
                <SelectContent>
                  {analytics?.portfolioAnalytics.map((portfolio) => (
                    <SelectItem key={portfolio.portfolioId} value={portfolio.portfolioId}>
                      {portfolio.portfolioName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <CardDescription>Compare revenue and subscribers across portfolios</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="revenue">
            <TabsList>
              <TabsTrigger value="revenue">Revenue</TabsTrigger>
              <TabsTrigger value="subscribers">Subscribers</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>
            
            <TabsContent value="revenue">
              {portfolioLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading revenue data...</p>
                </div>
              ) : selectedPortfolioId && portfolioAnalytics ? (
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-3">
                    <StatCard 
                      title="Total Revenue" 
                      value={formatCurrency(portfolioAnalytics.revenue)} 
                    />
                    <StatCard 
                      title="Transactions" 
                      value={portfolioAnalytics.transactions} 
                    />
                    <StatCard 
                      title="Average Value" 
                      value={formatCurrency(
                        portfolioAnalytics.subscriberCount > 0 
                          ? portfolioAnalytics.revenue / portfolioAnalytics.subscriberCount 
                          : 0
                      )} 
                    />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={portfolioAnalytics.timeSeries?.revenue || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis tickFormatter={(value) => `$${value}`} />
                      <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Revenue"
                        stroke="#ff7300"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p>Select a portfolio to view revenue details</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="subscribers">
              {portfolioLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading subscriber data...</p>
                </div>
              ) : selectedPortfolioId && portfolioAnalytics ? (
                <div className="space-y-4">
                  <div className="grid gap-4 grid-cols-3">
                    <StatCard 
                      title="Total Subscribers" 
                      value={portfolioAnalytics.subscriberCount} 
                    />
                    <StatCard 
                      title="Active Subscribers" 
                      value={portfolioAnalytics.activeSubscriberCount} 
                    />
                    <StatCard 
                      title="Growth" 
                      value={`${portfolioAnalytics.growth?.toFixed(1) || 0}%`} 
                    />
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={portfolioAnalytics.timeSeries?.subscribers || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name="Subscribers"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p>Select a portfolio to view subscriber details</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="comparison">
              {isLoading ? (
                <div className="h-64 flex items-center justify-center">
                  <p>Loading comparison data...</p>
                </div>
              ) : analytics?.portfolioAnalytics && analytics.portfolioAnalytics.length > 0 ? (
                <div className="space-y-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={analytics.portfolioAnalytics.map(p => ({
                        name: p.portfolioName,
                        revenue: p.revenue,
                        subscribers: p.subscriberCount
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip formatter={(value, name) => [
                        name === 'revenue' ? formatCurrency(value as number) : value,
                        name === 'revenue' ? 'Revenue' : 'Subscribers'
                      ]} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="revenue" name="Revenue" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="subscribers" name="Subscribers" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 text-left">Portfolio</th>
                          <th className="py-2 text-right">Subscribers</th>
                          <th className="py-2 text-right">Revenue</th>
                          <th className="py-2 text-right">Avg. Revenue/Sub</th>
                          <th className="py-2 text-right">Growth</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.portfolioAnalytics.map((portfolio) => (
                          <tr key={portfolio.portfolioId} className="border-b">
                            <td className="py-2">{portfolio.portfolioName}</td>
                            <td className="py-2 text-right">{portfolio.subscriberCount}</td>
                            <td className="py-2 text-right">{formatCurrency(portfolio.revenue)}</td>
                            <td className="py-2 text-right">
                              {formatCurrency(
                                portfolio.subscriberCount > 0
                                  ? portfolio.revenue / portfolio.subscriberCount
                                  : 0
                              )}
                            </td>
                            <td className="py-2 text-right">
                              {portfolio.growth ? `${portfolio.growth.toFixed(1)}%` : '0%'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <p>No portfolios available for comparison</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorAnalyticsDashboard;