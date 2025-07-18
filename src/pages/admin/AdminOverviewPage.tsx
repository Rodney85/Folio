import React, { useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Users, Car, Package2, Activity, Clock, TrendingUp, Eye, BarChart2 } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminOverviewPage = () => {
  // State for chart time range
  const [timeRange, setTimeRange] = useState('30d');
  
  // Fetch basic metrics
  const totalUsers = useQuery(api.admin.getTotalUsers);
  const newUsersCount = useQuery(api.admin.getNewUsersCount);
  const monthlyActiveUsers = useQuery(api.admin.getMonthlyActiveUsers);
  const dailyActiveUsers = useQuery(api.admin.getDailyActiveUsers);
  
  // Fetch metrics from our new dashboard-specific endpoints
  const totalCars = useQuery(api.adminDashboard.getTotalCars);
  const totalParts = useQuery(api.adminDashboard.getTotalParts);
  const newContentCount = useQuery(api.adminDashboard.getNewContentCount);
  const recentActivities = useQuery(api.adminDashboard.getRecentActivities, { limit: 15 });
  const userGrowthData = useQuery(api.adminDashboard.getUserGrowthData);
  const subscriptionMetrics = useQuery(api.adminDashboard.getSubscriptionMetrics);
  const quickStats = useQuery(api.adminDashboard.getQuickStats);
  
  // Format data for user growth chart
  const chartData = userGrowthData?.map(item => ({
    name: item.date.split('T')[0].split('-').slice(1).join('/'), // Format as MM/DD
    users: item.count,
  })) || [];
  
  // Calculate overall stats
  const totalContent = (totalCars || 0) + (totalParts || 0);
  const newContent = newContentCount ? newContentCount.cars + newContentCount.parts : 0;
  
  // Helper function to format date
  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };
  
  // Helper function to get icon and color for activity type
  const getActivityIcon = (type) => {
    if (!type) return { icon: <Activity size={16} />, color: 'bg-gray-100 text-gray-800' };
    
    if (type.includes('view')) {
      return { icon: <Eye size={16} />, color: 'bg-blue-100 text-blue-800' };
    } else if (type.includes('create') || type.includes('add')) {
      return { icon: <TrendingUp size={16} />, color: 'bg-green-100 text-green-800' };
    } else if (type.includes('delete')) {
      return { icon: <Activity size={16} />, color: 'bg-red-100 text-red-800' };
    } else {
      return { icon: <Clock size={16} />, color: 'bg-purple-100 text-purple-800' };
    }
  };
  
  // Format activity description
  const getActivityDescription = (activity) => {
    if (!activity) return 'Unknown activity';
    
    const userName = activity.user?.name || 'Unknown user';
    
    switch (activity.type) {
      case 'profile_view':
        return `${userName}'s profile was viewed`;
      case 'car_view':
        return `${userName}'s ${activity.item?.title || 'car'} was viewed`;
      case 'create_car':
        return `${userName} added a new car: ${activity.item?.title || 'Unknown'}`;
      case 'create_part':
        return `${userName} added a new part: ${activity.item?.title || 'Unknown'}`;
      default:
        return `${activity.type} by ${userName}`;
    }
  };
  
  return (
    <div className="space-y-8">
      {/* Header with quick actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Dashboard Overview</h2>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition">
            Add New Car
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            View Reports
          </button>
        </div>
      </div>
      
      {/* Main metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900">
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Users</h3>
              <p className="text-3xl font-bold">
                {quickStats?.totalUsers ?? totalUsers ?? 'Loading...'}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{newUsersCount ?? 0} in last 24h
              </p>
            </div>
          </div>
        </div>

        {/* Total Cars Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <Car className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Cars</h3>
              <p className="text-3xl font-bold">
                {quickStats?.totalCars ?? totalCars ?? 'Loading...'}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{newContentCount?.cars ?? 0} in last 7d
              </p>
            </div>
          </div>
        </div>

        {/* Total Parts Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900">
              <Package2 className="h-8 w-8 text-purple-600 dark:text-purple-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Total Parts</h3>
              <p className="text-3xl font-bold">
                {quickStats?.totalParts ?? totalParts ?? 'Loading...'}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                +{newContentCount?.parts ?? 0} in last 7d
              </p>
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-orange-100 dark:bg-orange-900">
              <Activity className="h-8 w-8 text-orange-600 dark:text-orange-300" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-500 dark:text-gray-400">Active Users</h3>
              <p className="text-3xl font-bold">
                {quickStats?.activeUsers ?? dailyActiveUsers ?? 'Loading...'}
              </p>
              <p className="text-sm text-green-600 dark:text-green-400">
                {quickStats ? `${quickStats.conversionRate}% of total` : 'Calculating...'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Chart section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Growth Chart - Takes 2/3 of the space */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">User Growth</h3>
            <div className="flex space-x-2">
              <button 
                onClick={() => setTimeRange('7d')}
                className={`px-3 py-1 rounded ${timeRange === '7d' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                7d
              </button>
              <button 
                onClick={() => setTimeRange('30d')}
                className={`px-3 py-1 rounded ${timeRange === '30d' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}`}
              >
                30d
              </button>
            </div>
          </div>
          
          <div className="h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#3B82F6" fillOpacity={1} fill="url(#colorUsers)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Loading chart data...</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Recent Activity Feed - Takes 1/3 of the space */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
          
          {recentActivities ? (
            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
              {recentActivities.length > 0 ? (
                recentActivities.map((activity, index) => {
                  const { icon, color } = getActivityIcon(activity.type);
                  return (
                    <div key={activity.id || index} className="flex items-start space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md">
                      <div className={`p-1.5 rounded-full ${color}`}>
                        {icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {getActivityDescription(activity)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(activity.timestamp)}
                          {activity.country && ` • ${activity.country}${activity.city ? `, ${activity.city}` : ''}`}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center p-4">No recent activity recorded</p>
              )}
            </div>
          ) : (
            <div className="animate-pulse space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <div className="rounded-full bg-gray-200 dark:bg-gray-700 h-10 w-10"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-center">
              View All Activity
            </button>
          </div>
        </div>
      </div>
      
      {/* Subscription Data and Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Subscription Metrics - Takes 1/3 of the space */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Subscription Metrics</h3>
          
          {subscriptionMetrics ? (
            <div className="space-y-4">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Free', value: subscriptionMetrics.free },
                    { name: 'Starter', value: subscriptionMetrics.starter },
                    { name: 'Pro', value: subscriptionMetrics.pro },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Free</p>
                  <p className="text-lg font-bold">{subscriptionMetrics.free}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((subscriptionMetrics.free / subscriptionMetrics.total) * 100)}%
                  </p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Starter</p>
                  <p className="text-lg font-bold">{subscriptionMetrics.starter}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((subscriptionMetrics.starter / subscriptionMetrics.total) * 100)}%
                  </p>
                </div>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded">
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pro</p>
                  <p className="text-lg font-bold">{subscriptionMetrics.pro}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {Math.round((subscriptionMetrics.pro / subscriptionMetrics.total) * 100)}%
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-pulse space-y-4">
              <div className="h-44 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="grid grid-cols-3 gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        {/* Quick Links and Stats - Takes 2/3 of the space */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-bold mb-4">Quick Links & Tools</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="/admin/users" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <p className="font-medium">Manage Users</p>
            </a>
            <a href="/admin/content" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
              <Car className="h-8 w-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <p className="font-medium">Edit Content</p>
            </a>
            <a href="/admin/operations" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
              <BarChart2 className="h-8 w-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <p className="font-medium">View Analytics</p>
            </a>
            <a href="/admin/operations" className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-center">
              <Activity className="h-8 w-8 mx-auto mb-2 text-red-600 dark:text-red-400" />
              <p className="font-medium">System Logs</p>
            </a>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium mb-3">At a Glance</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Content Health</h5>
                <p className="mb-2">
                  <span className="font-bold text-xl">{totalContent || 'Loading...'}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">total items</span>
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                  <div className="bg-green-500 h-full" style={{ width: `${totalContent ? Math.min(100, (newContent / totalContent) * 100) : 0}%` }}></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {newContent} new items added in the last 7 days
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">User Engagement</h5>
                <p className="mb-2">
                  <span className="font-bold text-xl">{dailyActiveUsers || 'Loading...'}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">daily active users</span>
                </p>
                <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full" style={{ 
                    width: `${totalUsers && dailyActiveUsers ? Math.min(100, (dailyActiveUsers / totalUsers) * 100) : 0}%` 
                  }}></div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {monthlyActiveUsers || 0} monthly active users ({totalUsers ? Math.round((monthlyActiveUsers / totalUsers) * 100) : 0}%)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverviewPage;
