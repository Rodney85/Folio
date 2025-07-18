import React, { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useToast } from "@/components/ui/use-toast";
import {
  Search,
  Users,
  UserCheck,
  UserX,
  Shield,
  Activity,
  ChevronLeft,
  ChevronRight,
  Award,
  User,
  X,
  Eye,
  Edit,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { formatDistanceToNow } from 'date-fns';

// User role options for the dropdown
const userRoleOptions = [
  { value: "user", label: "User" },
  { value: "admin", label: "Admin" },
  { value: "mod", label: "Moderator" },
];

// Extended user type with subscription tier
type UserWithSubscription = Doc<'users'> & { 
  subscriptionPlan?: string;
  updatedAt?: number | string;
};

// User stats type
type UserStats = {
  totalCars: number;
  totalParts: number;
  lastLogin: number | null;
  activityLast7Days: number;
  activityLast30Days: number;
  profileViews: number;
  productClicks: number;
  topCar?: {
    name: string;
    views: number;
    id?: string;
  };
};

// User details type returned from API
type UserDetailsType = {
  stats?: UserStats;
  recentActivity?: ActivityItem[];
  name?: string;
  email?: string;
  role?: string;
  tokenIdentifier?: string;
  subscriptionTier?: string;
  _creationTime?: number;
  _id?: Id<'users'>;
  createdAt?: number;
};

// Type for activity data
type ActivityItem = {
  date?: string;
  type?: string;
  count?: number;
  _creationTime?: number;
  timestamp?: number;
};

// Types for query results
type FilteredUsersResult = {
  users: UserWithSubscription[];
  nextCursor?: string;
};

type TotalUsersCount = {
  count: number;
};

/**
 * Admin Users Management Page
 * Route: /admin/users
 */
const AdminUsersPage = () => {
  // State for search, filtering, and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [activityFilter, setActivityFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc'); // Added type annotation
  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null); // Added state for nextCursor
  const [selectedUserId, setSelectedUserId] = useState<Id<"users"> | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserWithSubscription | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);
  
  // State for user editing
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<UserWithSubscription | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedSubscription, setSelectedSubscription] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'details' | 'activity' | 'content'>('details');
  const usersPerPage = 10;

  // Fetch filtered user data from Convex
  const filteredUsersResult = useQuery(api.adminUsers.getFilteredUsers, {
    roleFilter: roleFilter || undefined,
    subscriptionFilter: subscriptionFilter || undefined,
    activityFilter: activityFilter || undefined,
    sortBy: sortBy || undefined,
    sortDirection: sortDirection || undefined,
    limit: usersPerPage,
    cursor: cursor || undefined
  }) as FilteredUsersResult | undefined;
  
  // For total users count, we'll make a separate query without pagination
  const allUsersQuery = useQuery(api.adminUsers.getFilteredUsers, {
    roleFilter: roleFilter || undefined,
    subscriptionFilter: subscriptionFilter || undefined,
    activityFilter: activityFilter || undefined,
    // We don't need pagination for counting
    limit: 1000 // Set a reasonably high limit to get all users
  }) as FilteredUsersResult | undefined;
  
  // Convert the result to the expected TotalUsersCount type
  const totalUsersCount: TotalUsersCount = useMemo(() => {
    return { count: allUsersQuery?.users?.length || 0 };
  }, [allUsersQuery]);
  
  // For user details, we use the "skip" pattern to avoid unnecessary queries
  const userDetailsQuery = useQuery(
    api.adminUsers.getUserDetails, 
    selectedUserId ? { userId: selectedUserId } : "skip"
  );
  
  // For user stats, we'll get it from user details since getUserStats doesn't exist
  // The user details already contains stats information
  
  // For timeline data, also use the "skip" pattern
  const userActivityQuery = useQuery(
    api.adminUsers.getUserActivityTimeline, 
    (selectedUserId && activeTab === 'activity') ? 
      { userId: selectedUserId, timeRange: 'month' as const } : 
      "skip"
  );
  
  // Then create derived state based on the query results with proper type casting
  const selectedUserDetails = selectedUserId ? userDetailsQuery as unknown as UserDetailsType : null;
  const userActivityTimeline = (selectedUserId && activeTab === 'activity') ? 
    userActivityQuery as unknown as { recentActivity?: ActivityItem[] } : null;
  
  // Reset cursor when filters change
  // This hook must be called unconditionally
  useEffect(() => {
    setCursor(null);
  }, [roleFilter, subscriptionFilter, activityFilter, sortBy, sortDirection]);

  useEffect(() => {
    if (filteredUsersResult?.nextCursor) {
      setNextCursor(filteredUsersResult.nextCursor);
    } else {
      setNextCursor(null);
    }
  }, [filteredUsersResult]);

  // Search functionality - for local filtering
  const filteredUsers = useMemo(() => {
    if (!filteredUsersResult || !filteredUsersResult.users) return [];
    
    if (!searchTerm || !searchTerm.trim()) return filteredUsersResult.users;
    
    const term = searchTerm.toLowerCase();
    return filteredUsersResult.users.filter(user => 
      (user.name?.toLowerCase() || '').includes(term) || 
      (user.email?.toLowerCase() || '').includes(term) ||
      (user.role?.toLowerCase() || '').includes(term)
    );
  }, [filteredUsersResult, searchTerm]);
  
  // Mutations for user management
  // These must be called unconditionally at the top level
  const deleteUser = useMutation(api.mutations.admin.deleteUser);
  const updateUserRole = useMutation(api.adminUsers.updateUserRole);
  const updateUserSubscription = useMutation(api.adminUsers.updateUserSubscription);
  const updateUserDetails = useMutation(api.adminUsers.updateUserDetails);

  // Pagination
  const handleNextPage = () => {
    if (nextCursor) {
      setCursor(nextCursor);
    }
  };

  const handlePrevPage = () => {
    // Go back to the previous page by resetting cursor
    // Since API doesn't provide prevCursor
    setCursor(null);
  };

  // User selection handlers
  const handleViewUser = (userId: Id<"users">) => {
    setSelectedUserId(userId);
  };

  const closeUserDetail = () => {
    setSelectedUserId(null);
  };

  // Role management
  const handleRoleClick = (user: UserWithSubscription) => {
    // Set the user we want to update and their current role
    const userToUpdate = user;
    setUserToDelete(userToUpdate); // Set this for the modal to access
    setSelectedRole(userToUpdate.role || 'user');
    setIsRoleModalOpen(true);
  };

  const { toast } = useToast();
  
  const handleConfirmRoleChange = async () => {
    if (!userToDelete) return;
    
    try {
      await updateUserRole({ userId: userToDelete._id, role: selectedRole });
      toast({
        title: "Success",
        description: `User role updated to ${selectedRole}`
      });
      setIsRoleModalOpen(false);
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to update user role'
      });
    }
  };

  // Subscription management
  const handleSubscriptionClick = (user: UserWithSubscription) => {
    // Set the user we want to update and their current subscription
    const userToUpdate = user;
    setUserToDelete(userToUpdate); // We're reusing the userToDelete state for modals
    setSelectedSubscription(userToUpdate.subscriptionPlan || 'free');
    setIsSubscriptionModalOpen(true);
  };

  const handleConfirmSubscriptionChange = async () => {
    if (!userToDelete) return;
    
    try {
      await updateUserSubscription({ 
        userId: userToDelete._id, 
        subscriptionTier: selectedSubscription 
      });
      toast({
        title: "Success",
        description: `User subscription updated to ${selectedSubscription}`
      });
      setIsSubscriptionModalOpen(false);
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to update user subscription'
      });
    }
  };

  // Delete handlers
  const handleDeleteClick = (user: UserWithSubscription) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      await deleteUser({ userId: userToDelete._id });
      toast({
        title: "Success",
        description: 'User deleted successfully'
      });
      setIsDeleteModalOpen(false);
      
      // Close detail view if the deleted user was selected
      if (selectedUserId === userToDelete._id) {
        setSelectedUserId(null);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to delete user'
      });
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
  };

  // User edit handlers
  const handleEditClick = (user: UserWithSubscription) => {
    setUserToEdit(user);
    setEditUserName(user.name || '');
    setEditUserEmail(user.email);
    setIsEditModalOpen(true);
  };

  const handleConfirmEdit = async () => {
    if (!userToEdit) return;
    
    try {
      await updateUserDetails({
        userId: userToEdit._id,
        name: editUserName,
        email: editUserEmail,
      });
      
      toast({
        title: "Success",
        description: 'User details updated successfully'
      });
      setIsEditModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: 'Failed to update user details'
      });
    }
  };

  const handleCancelEdit = () => {
    setIsEditModalOpen(false);
    setUserToEdit(null);
  };

  // Format date for display
  const formatDate = (timestamp: number | string | null | undefined) => {
    if (!timestamp) return null;
    try {
      // Ensure timestamp is a valid input for Date constructor
      const date = typeof timestamp === 'number' || typeof timestamp === 'string'
        ? new Date(timestamp)
        : null;
      
      if (!date) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid date';
    }
  };
  
  // Get appropriate icon for subscription tier
  const getSubscriptionIcon = (tier: string | undefined) => {
    return <Award size={14} className="mr-1" />;
  };
  
  // Get appropriate icon and color for role
  const getRoleIcon = (role: string | undefined) => {
    return role === 'admin' 
      ? <Shield size={14} className="text-purple-500" /> 
      : <User size={14} className="text-blue-500" />;
  };

  // Detailed user card
  const renderUserDetails = () => {
    if (!selectedUserId || !selectedUserDetails) {
      return <div className="text-center">Select a user to view details</div>;
    }
    
    // Access the user stats safely with all required properties
    const stats = selectedUserDetails?.stats || {
      totalCars: 0,
      totalParts: 0,
      lastLogin: 0,
      activityLast7Days: 0,
      activityLast30Days: 0,
      profileViews: 0,
      productClicks: 0,
      topCar: {
        name: 'None',
        views: 0
      }
    } as UserStats;
    const lastLoginTime = stats.lastLogin ? new Date(Number(stats.lastLogin)).toISOString() : undefined;
    
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg mb-2">User Information</h3>
          <p><span className="font-semibold">Name:</span> {selectedUserDetails?.name || 'N/A'}</p>
          <p><span className="font-semibold">Email:</span> {selectedUserDetails?.email || 'N/A'}</p>
          <p><span className="font-semibold">Role:</span> {selectedUserDetails?.role || 'user'}</p>
          <p><span className="font-semibold">Subscription:</span> {selectedUserDetails?.subscriptionTier || 'Free'}</p>
          <p><span className="font-semibold">Joined:</span> {formatDate(selectedUserDetails?._creationTime || selectedUserDetails?.createdAt)}</p>
          <p><span className="font-semibold">Last active:</span> {formatDate(lastLoginTime) || 'Never'}</p>
        </div>
        
        {/* User Stats */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg mb-2">Content Statistics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">User's content in the Carfolio platform</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-blue-600 dark:text-blue-400 flex items-center">
                  <span title="Total number of cars added by this user">Cars Created</span>
                </span>
                <span className="text-lg font-bold">{stats?.totalCars || 0}</span>
              </div>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
              <div className="flex flex-col">
                <span className="text-xs text-purple-600 dark:text-purple-400 flex items-center">
                  <span title="Total number of parts added by this user">Parts Listed</span>
                </span>
                <span className="text-lg font-bold">{stats?.totalParts || 0}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Analytics */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg mb-2">User Analytics</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Interaction metrics for this user</p>
          
          {/* Activity Metrics */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Activity Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="Total number of tracked user interactions in the last 7 days">
                  Recent Activity (7 days)
                </span>
                <span className="font-semibold">{stats?.activityLast7Days || 0} interactions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="Total number of tracked user interactions in the last 30 days">
                  Recent Activity (30 days)
                </span>
                <span className="font-semibold">{stats?.activityLast30Days || 0} interactions</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="Percentage of 30-day activity that occurred in the last 7 days">
                  Activity Rate (7d/30d)
                </span>
                <span className="font-semibold">
                  {stats && stats.activityLast30Days && stats.activityLast30Days > 0 ? 
                    `${Math.round((stats.activityLast7Days / stats.activityLast30Days) * 100)}%` : 
                    '0%'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Engagement Metrics */}
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Engagement Metrics</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="Number of times this user's profile has been viewed">
                  Profile Views
                </span>
                <span className="font-semibold">{stats?.profileViews || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="Number of clicks on products/parts this user has listed">
                  Product Clicks
                </span>
                <span className="font-semibold">{stats?.productClicks || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="Engagement rate based on views to interaction conversion">
                  Engagement Rate
                </span>
                <span className="font-semibold">
                  {stats && stats.profileViews && stats.profileViews > 0 ? 
                    `${Math.round((stats.activityLast30Days / stats.profileViews) * 100)}%` : 
                    '0%'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Top Content */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Content</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="The car listed by this user with the most views">
                  Most Viewed Car
                </span>
                <span className="font-semibold">{stats?.topCar?.name || 'None'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="Number of views for their most popular car">
                  Top Car Views
                </span>
                <span className="font-semibold">{stats?.topCar?.views || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400" title="Count of distinct activity events recorded">
                  Recent Activity Events
                </span>
                <span className="font-semibold">{selectedUserDetails.recentActivity?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
// ...
  };

  // Activity timeline
  const renderUserActivity = () => {
    if (!selectedUserId || !userActivityTimeline) {
      return <div className="text-center">Select a user to view activity</div>;
    }
    
    // Get the activity data - handle different potential formats
    let activityItems: ActivityItem[] = [];
    
    if (Array.isArray(userActivityTimeline)) {
      activityItems = userActivityTimeline as unknown as ActivityItem[];
    } else if (userActivityTimeline && 'recentActivity' in userActivityTimeline && 
               Array.isArray((userActivityTimeline as any).recentActivity)) {
      activityItems = (userActivityTimeline as any).recentActivity as ActivityItem[];
    }
    
    const hasActivityData = activityItems && activityItems.length > 0;
    
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
          <h3 className="font-medium text-lg mb-2">Recent Activity</h3>
          {hasActivityData ? (
            <ul className="space-y-2">
              {activityItems.map((activity: ActivityItem, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Activity size={16} className="mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-sm">{activity.date || activity.type || 'Activity'}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(activity._creationTime || activity.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">User Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List Panel */}
        <div className={selectedUserId ? "lg:col-span-1" : "lg:col-span-3"}>
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Users List</h2>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => {
                    setRoleFilter('');
                    setSubscriptionFilter('');
                    setActivityFilter('');
                    setSearchTerm('');
                    setCursor(null);
                  }}
                  className="flex items-center px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <X size={12} className="mr-1" />
                  Reset Filters
                </button>
              </div>
            </div>
            
            {/* Search input */}
            <div className="relative mb-4">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search users..."
                className="w-full p-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
            </div>

            {/* Users table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {Array.isArray(filteredUsers) && filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-3 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.pictureUrl ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.pictureUrl}
                                alt={user.name || 'User'}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <User size={20} className="text-gray-500 dark:text-gray-300" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.name || 'Unnamed User'}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-300">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-sm">
                        <span className="inline-flex items-center">
                          {getRoleIcon(user.role)}
                          <span className="ml-1">{user.role || 'User'}</span>
                        </span>
                      </td>
                      <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            title="View Details"
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleRoleClick(user)}
                            title="Change Role"
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          >
                            <Shield size={16} />
                          </button>
                          <button
                            onClick={() => handleSubscriptionClick(user)}
                            title="Change Subscription"
                            className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                          >
                            <Award size={16} />
                          </button>
                          <button
                            onClick={() => handleEditClick(user)}
                            title="Edit User"
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            title="Delete User"
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
            <div className="flex justify-between items-center mt-4">
              <div className="text-sm text-gray-500 dark:text-gray-300">
                Showing {filteredUsers?.length || 0} of {totalUsersCount?.count || '?'} users
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrevPage}
                  disabled={!cursor} // Only disable if we're on the first page (no cursor)
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-gray-600 dark:text-gray-300"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!filteredUsersResult || !filteredUsersResult.nextCursor}
                  className="px-3 py-1 border rounded-md text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Details Panel (shown when a user is selected) */}
        {selectedUserId && (
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 relative">
              <button
                onClick={closeUserDetail}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <X size={20} />
              </button>
              
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">User Details</h2>
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('details')}
                    className="px-3 py-1 rounded-md"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('activity')}
                    className="px-3 py-1 rounded-md"
                  >
                    Activity
                  </button>
                </div>
              </div>
              
              {activeTab === 'details' && renderUserDetails()}
              {activeTab === 'activity' && renderUserActivity()}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <AlertCircle className="mr-2 text-red-500" size={20} />
              Confirm Delete
            </h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Are you sure you want to delete user <span className="font-semibold">{userToDelete?.name || userToDelete?.email || 'this user'}</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCancelDelete}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Edit className="mr-2" size={20} />
              Edit User Details
            </h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="editName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  id="editName"
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="editEmail" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="editEmail"
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Shield className="mr-2 text-blue-500" size={20} />
              Change User Role
            </h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Update role for user <span className="font-semibold">{userToDelete?.name || userToDelete?.email || 'this user'}</span>
            </p>
            <div className="mb-4">
              <label htmlFor="roleSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Role
              </label>
              <select
                id="roleSelect"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                {userRoleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRoleChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subscription Change Modal */}
      {isSubscriptionModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              <Award className="mr-2 text-yellow-500" size={20} />
              Update Subscription
            </h3>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Change subscription for <span className="font-semibold">{userToDelete?.name || userToDelete?.email || 'this user'}</span>
            </p>
            <div className="mb-4">
              <label htmlFor="subscriptionSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Select Plan
              </label>
              <select
                id="subscriptionSelect"
                value={selectedSubscription}
                onChange={(e) => setSelectedSubscription(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setIsSubscriptionModalOpen(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubscriptionChange}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Update Subscription
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
