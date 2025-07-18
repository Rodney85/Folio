import React, { useState, useEffect, useMemo } from 'react';
import { api } from '../../../convex/_generated/api';
import { useMutation, useQuery } from 'convex/react';
import { Download, BarChart2, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

// Helper function to get appropriate color for different event types
const getEventTypeColor = (eventType) => {
  if (!eventType) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  
  if (eventType.includes('error') || eventType.includes('failed'))
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  
  if (eventType.includes('login') || eventType.includes('access'))
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
  
  if (eventType.includes('create') || eventType.includes('add'))
    return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    
  if (eventType.includes('update') || eventType.includes('modify'))
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    
  if (eventType.includes('delete') || eventType.includes('remove'))
    return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    
  return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
};

const AdminOperationsPage = () => {
  const [activeTab, setActiveTab] = useState('system');
  const [timeRange, setTimeRange] = useState('day'); // day, week, month
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [actionType, setActionType] = useState('');
  const [isLogsModalOpen, setIsLogsModalOpen] = useState(false);
  const [selectedLogType, setSelectedLogType] = useState('all');
  const [selectedLog, setSelectedLog] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get analytics data from Convex
  const analyticsData = useQuery(api.admin.getAnalyticsData, { timeRange });

  // Since we don't have actual backend operations, these functions simulate operations
  const handleClearCache = async () => {
    // In a real implementation, this would call a Convex mutation
    // e.g., await useMutation(api.admin.clearSystemCache)();
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulating API call
    toast.success('System cache cleared successfully');
  };

  const handleCreateBackup = async () => {
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulating API call
    toast.success('Database backup created successfully');
  };

  const handlePurgeLogs = async () => {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulating API call
    toast.success('Logs purged successfully');
  };

  // Export analytics data as CSV
  const handleExportAnalytics = () => {
    if (!analyticsData) {
      toast.error('No data available to export');
      return;
    }

    try {
      // Create CSV header
      let csv = 'Date,EventType,UserId,Country,City\n';
      
      // Add data rows
      analyticsData.forEach(entry => {
        const date = new Date(entry.createdAt).toISOString();
        const eventType = entry.type || 'Unknown';
        const userId = entry.userId || '';
        const country = entry.country || '';
        const city = entry.city || '';
        
        csv += `"${date}","${eventType}","${userId}","${country}","${city}"\n`;
      });
      
      // Create download link
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('hidden', '');
      a.setAttribute('href', url);
      a.setAttribute('download', `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success('Analytics data exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export data');
    }
  };
  
  // Process analytics data for chart visualization
  const analyticsChartData = useMemo(() => {
    if (!analyticsData) return [];
    
    // Group analytics by type and count occurrences
    const typeCounts = analyticsData.reduce((acc, entry) => {
      const type = entry.type || 'Unknown';
      if (!acc[type]) acc[type] = 0;
      acc[type]++;
      return acc;
    }, {});
    
    // Convert to chart format
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type,
      count
    }));
  }, [analyticsData]);

  const handleActionClick = (action) => {
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };

  const confirmAction = async () => {
    try {
      setIsLoading(true);

      // Simulate API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Set success message based on action type
      if (actionType === 'clearCache') {
        setSuccessMessage('System cache cleared successfully!');
      } else if (actionType === 'backup') {
        setSuccessMessage('Database backup created successfully!');
      } else if (actionType === 'purgeLogs') {
        setSuccessMessage('Old logs purged successfully!');
      }

      // Show success notification (could implement with a toast system)
    } catch (error) {
      console.error('Operation failed:', error);
      // Show error notification
    } finally {
      setIsLoading(false);
      setIsConfirmDialogOpen(false);

      // Clear success message after 3 seconds
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Operations</h2>

      {/* Tab navigation */}
      <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab('system')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            System
          </button>
          <button
            onClick={() => setActiveTab('database')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'database'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Database
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Logs
          </button>
        </nav>
      </div>

      {/* Tab content */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {activeTab === 'system' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">System Operations</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium">Clear System Cache</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remove temporary files and refresh system cache</p>
                </div>
                <button
                  onClick={() => handleActionClick('clearCache')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Clear Cache
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium">System Status</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Check current system health and performance</p>
                </div>
                <button
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                >
                  Check Status
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'database' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Database Operations</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium">Backup Database</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Create a full backup of the database</p>
                </div>
                <button
                  onClick={() => handleActionClick('backup')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                >
                  Create Backup
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <h4 className="font-medium">Optimization</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Run database optimization routines</p>
                </div>
                <button
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-md"
                >
                  Optimize
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">System Logs</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-2">System Logs</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">View system operational logs</p>
                  <button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                    onClick={() => {
                      setSelectedLogType('system');
                      setIsLogsModalOpen(true);
                    }}
                  >
                    View Logs
                  </button>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-2">Access Logs</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">View user access and activity logs</p>
                  <button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                    onClick={() => {
                      setSelectedLogType('access');
                      setIsLogsModalOpen(true);
                    }}
                  >
                    View Logs
                  </button>
                </div>
                
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium mb-2">Error Logs</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">View application error logs</p>
                  <button 
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                    onClick={() => {
                      setSelectedLogType('error');
                      setIsLogsModalOpen(true);
                    }}
                  >
                    View Logs
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg mt-4">
                <div>
                  <h4 className="font-medium">Purge Old Logs</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Remove logs older than 30 days</p>
                </div>
                <button
                  onClick={() => handleActionClick('purgeLogs')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                >
                  Purge Logs
                </button>
              </div>
              
              {/* Analytics data display */}
              <div className="mt-6 p-4 bg-white dark:bg-gray-800 rounded-md shadow">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">System Analytics</h3>
                  <button 
                    onClick={() => handleExportAnalytics()}
                    className="flex items-center px-3 py-1.5 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
                  >
                    <Download size={16} className="mr-1" />
                    Export Data
                  </button>
                </div>
                <div className="flex space-x-2 mb-4">
                  <button
                    onClick={() => setTimeRange('day')}
                    className={`px-3 py-1 text-sm rounded ${timeRange === 'day' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    Last 24 Hours
                  </button>
                  <button
                    onClick={() => setTimeRange('week')}
                    className={`px-3 py-1 text-sm rounded ${timeRange === 'week' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    Last Week
                  </button>
                  <button
                    onClick={() => setTimeRange('month')}
                    className={`px-3 py-1 text-sm rounded ${timeRange === 'month' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'}`}
                  >
                    Last Month
                  </button>
                </div>
                {/* Analytics Chart */}
                <div className="h-60 mb-6">
                  {analyticsData === undefined ? (
                    <div className="flex justify-center items-center h-40">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
                    </div>
                  ) : analyticsData.length === 0 ? (
                    <div className="flex justify-center items-center h-40 text-gray-500 dark:text-gray-400">
                      No analytics data found for selected time range
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsChartData}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="count" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
                
                {/* Analytics Raw Data Table */}
                <div>
                  <h4 className="text-md font-semibold mb-2">Raw Analytics Data</h4>
                  <div className="p-3 bg-gray-900 text-green-400 rounded font-mono text-sm h-40 overflow-y-auto">
                    {analyticsData === undefined ? (
                      <div className="flex justify-center items-center h-20">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-white"></div>
                      </div>
                    ) : analyticsData.length === 0 ? (
                      <div className="text-center py-5">No analytics data found for selected time range</div>
                    ) : (
                      analyticsData.map((entry, index) => (
                        <div key={index}>
                          [{new Date(entry.createdAt).toLocaleString()}] 
                          Event: {entry.type || 'Unknown'} | 
                          User: {entry.userId}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      {isConfirmDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Confirm Action</h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Are you sure you want to perform this action? This cannot be undone.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsConfirmDialogOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={confirmAction}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Logs Detail Modal */}
      {isLogsModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                {selectedLogType === 'system' && 'System Logs'}
                {selectedLogType === 'access' && 'Access Logs'}
                {selectedLogType === 'error' && 'Error Logs'}
              </h2>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setIsLogsModalOpen(false)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-4">
              {/* Log filtering options */}
              <div className="mb-4 flex flex-wrap gap-2">
                <button
                  className={`px-3 py-1 text-sm rounded ${timeRange === 'day' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                  onClick={() => setTimeRange('day')}
                >
                  Last 24 Hours
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded ${timeRange === 'week' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                  onClick={() => setTimeRange('week')}
                >
                  Last Week
                </button>
                <button
                  className={`px-3 py-1 text-sm rounded ${timeRange === 'month' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'}`}
                  onClick={() => setTimeRange('month')}
                >
                  Last Month
                </button>
              </div>
              
              {/* Log entries table */}
              <div className="bg-white dark:bg-gray-900 shadow overflow-hidden rounded-md">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Timestamp</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Event Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Details</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                    {analyticsData ? (
                      analyticsData
                        .filter(entry => {
                          if (selectedLogType === 'all') return true;
                          if (selectedLogType === 'system') return entry.type?.includes('system');
                          if (selectedLogType === 'access') return entry.type?.includes('login') || entry.type?.includes('access');
                          if (selectedLogType === 'error') return entry.type?.includes('error');
                          return true;
                        })
                        .map((log, index) => (
                          <tr 
                            key={index} 
                            className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                            onClick={() => setSelectedLog(log)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {new Date(log.createdAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              <span className={`px-2 py-1 rounded text-xs ${getEventTypeColor(log.type)}`}>
                                {log.type || 'Unknown'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{log.userId}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {log.country && `${log.country}${log.city ? `, ${log.city}` : ''}`}
                              <button className="ml-2 text-blue-600 hover:text-blue-800 text-xs">
                                View Details
                              </button>
                            </td>
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          Loading logs...
                        </td>
                      </tr>
                    )}
                    {analyticsData && analyticsData.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                          No logs found for the selected time period.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => handleExportAnalytics()}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                <Download size={16} className="mr-2" />
                Export Logs
              </button>
              <button
                className="ml-2 px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setIsLogsModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Selected Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Log Details</h2>
              <button
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={() => setSelectedLog(null)}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4">
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Timestamp</div>
                <div className="mt-1">{new Date(selectedLog.createdAt).toLocaleString()}</div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Event Type</div>
                <div className="mt-1">
                  <span className={`px-2 py-1 rounded ${getEventTypeColor(selectedLog.type)}`}>
                    {selectedLog.type || 'Unknown'}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</div>
                <div className="mt-1">{selectedLog.userId}</div>
              </div>
              
              {selectedLog.country && (
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Location</div>
                  <div className="mt-1">{selectedLog.country}{selectedLog.city ? `, ${selectedLog.city}` : ''}</div>
                </div>
              )}
              
              <div className="mb-4">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Additional Details</div>
                <div className="mt-1 bg-gray-100 dark:bg-gray-700 p-3 rounded overflow-x-auto">
                  <pre className="text-xs text-gray-900 dark:text-gray-100">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                onClick={() => setSelectedLog(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};



export default AdminOperationsPage;
