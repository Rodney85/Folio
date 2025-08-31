import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CheckCircle2, ChevronRight, Clock, CreditCard, AlertCircle, Loader, ShieldCheck } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { useCurrentSubscription, useStartUserTrial } from '@/lib/subscription-utils';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';

// Type definition for subscription to include subscriptionId
interface SubscriptionWithId {
  status: string;
  plan: string;
  isActive: boolean;
  isInTrial: boolean;
  daysRemaining: number;
  trialEnded: boolean;
  trialEndDate?: number;
  currentPeriodEnd?: number | string;
  subscriptionId?: string; // Make it optional to handle both cases
}

const SubscriptionPage = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const subscription = useCurrentSubscription() as SubscriptionWithId | undefined;
  const startTrial = useStartUserTrial();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if the user has an admin role
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Helper function to format date
  const formatDate = (timestamp?: number | string) => {
    if (!timestamp) return 'N/A';
    // Ensure we're working with a number
    const dateValue = typeof timestamp === 'string' ? parseInt(timestamp) : timestamp;
    return new Date(dateValue).toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Calculate days remaining in trial if applicable
  const calculateTrialDaysLeft = () => {
    if (!subscription || subscription.status !== 'trial') {
      return 0;
    }
    
    // Use the pre-calculated daysRemaining if available
    return subscription.daysRemaining || 0;
  };
  
  const trialDaysLeft = calculateTrialDaysLeft();
  
  // Handle checkout for subscription
  const handleCheckout = async (planType: 'monthly' | 'yearly') => {
    setIsLoading(true);
    try {
      // Implement the checkout flow using Lemon Squeezy
      window.location.href = `/api/create-checkout?plan=${planType}&userId=${user?.id}`;
    } catch (error) {
      console.error("Failed to start checkout process:", error);
      setIsLoading(false);
    }
  };

  // Handle starting a trial
  const handleStartTrial = async () => {
    setIsLoading(true);
    try {
      await startTrial();
      // Wait a moment for the UI to update
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to start trial:", error);
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold">Subscription</h1>
          {isAdmin && (
            <div className="ml-4 flex items-center bg-purple-500/10 text-purple-500 px-4 py-2 rounded-full text-sm font-medium">
              <ShieldCheck className="h-5 w-5 mr-2" />
              <span>Admin Access</span>
            </div>
          )}
        </div>
        {subscription?.status === 'active' && (
          <div className="flex items-center bg-green-500/10 text-green-500 px-4 py-2 rounded-full text-sm font-medium">
            <Crown className="h-5 w-5 mr-2" />
            <span>Active</span>
          </div>
        )}
        
        {subscription?.status === 'trial' && (
          <div className="flex items-center bg-blue-500/10 text-blue-500 px-4 py-2 rounded-full text-sm font-medium">
            <Clock className="h-5 w-5 mr-2" />
            <span>Trial • {trialDaysLeft} days left</span>
          </div>
        )}
        
        {subscription?.status === 'expired' && (
          <div className="flex items-center bg-red-500/10 text-red-500 px-4 py-2 rounded-full text-sm font-medium">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Expired</span>
          </div>
        )}
        
        {subscription?.status === 'canceled' && (
          <div className="flex items-center bg-slate-500/10 text-slate-500 px-4 py-2 rounded-full text-sm font-medium">
            <span>Canceled</span>
          </div>
        )}
      </div>

      {/* Subscription Details */}
      {subscription && (
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Your Subscription</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-700">
              <span className="text-slate-400">Status</span>
              <span className="font-medium">
                {subscription.status === 'active' ? 'Active' : 
                 subscription.status === 'trial' ? 'Trial' :
                 subscription.status === 'canceled' ? 'Canceled' : 'Expired'}
              </span>
            </div>
            
            {subscription.plan && (
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Plan</span>
                <span className="font-medium">
                  {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                </span>
              </div>
            )}
            
            {subscription.status === 'trial' && (
              <>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Trial Status</span>
                  <span className="font-medium">
                    {trialDaysLeft > 0 ? `${trialDaysLeft} days remaining` : 'Ending today'}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-700">
                  <span className="text-slate-400">Trial Ends</span>
                  <span className="font-medium">{formatDate(subscription.trialEndDate)}</span>
                </div>
              </>
            )}
            
            {subscription.currentPeriodEnd && subscription.status === 'active' && (
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Next Billing Date</span>
                <span className="font-medium">{formatDate(subscription.currentPeriodEnd)}</span>
              </div>
            )}
            
            {subscription.status === 'canceled' && (
              <div className="flex justify-between py-2 border-b border-slate-700">
                <span className="text-slate-400">Canceled</span>
                <span className="font-medium">Your subscription has been canceled</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin full access notice */}
      {isAdmin && (
        <div className="bg-purple-500/10 rounded-lg p-6 mb-8 border border-purple-500/20">
          <div className="flex items-start">
            <ShieldCheck className="h-6 w-6 text-purple-500 mr-3 mt-0.5" />
            <div>
              <h3 className="font-medium text-lg">Admin Full Access</h3>
              <p className="text-slate-400 mt-1">As an admin, you have full access to all premium features regardless of subscription status.</p>
            </div>
          </div>
        </div>
      )}
      
      {/* No subscription case */}
      {!subscription && !isAdmin && (
        <div className="bg-slate-800/50 rounded-lg p-8 text-center mb-8">
          <h2 className="text-xl font-medium mb-4">You don't have an active subscription yet</h2>
          <p className="text-slate-400 mb-6">Start your 14-day free trial to access all features</p>
          <Button 
            onClick={handleStartTrial}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Setting up trial...
              </>
            ) : (
              <>
                Start 14-Day Free Trial
              </>
            )}
          </Button>
        </div>
      )}

      {/* Pricing options - show if in trial or expired, but not for admins */}
      {(subscription?.status === 'trial' || subscription?.status === 'expired') && !isAdmin && (
        <div className="space-y-6">
          <h2 className="text-xl font-medium">Upgrade Your Subscription</h2>
          <p className="text-slate-400">
            {subscription.status === 'trial' 
              ? `Your trial ends in ${trialDaysLeft} days. Upgrade now to keep sharing your cars.` 
              : 'Your trial has expired. Subscribe now to restore access to all features.'}
          </p>
          
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            {/* Monthly Plan */}
            <div className="bg-slate-800/50 rounded-lg p-6 hover:border hover:border-blue-500/50 transition-all">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">Monthly</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold">$9.99</span>
                  <span className="text-slate-400 block text-sm">per month</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited car profiles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Public sharing links</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Analytics and insights</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => handleCheckout('monthly')}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Monthly
                  </>
                )}
              </Button>
            </div>
            
            {/* Yearly Plan */}
            <div className="bg-slate-800/50 rounded-lg p-6 relative hover:border hover:border-blue-500/50 transition-all">
              <div className="absolute -top-3 right-4 bg-blue-600 px-3 py-1 rounded-full text-xs font-medium">
                Save 20%
              </div>
              
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium">Yearly</h3>
                <div className="text-right">
                  <span className="text-2xl font-bold">$99.99</span>
                  <span className="text-slate-400 block text-sm">per year</span>
                </div>
              </div>
              
              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Unlimited car profiles</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Public sharing links</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Analytics and insights</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <Button 
                onClick={() => handleCheckout('yearly')}
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe Yearly
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Manage subscription - only show when active */}
      {subscription?.status === 'active' && (
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-4">Manage Subscription</h2>
          
          <div className="bg-slate-800/50 rounded-lg">
            <button 
              onClick={() => navigate('/subscription/manage')}
              className="w-full flex items-center justify-between px-6 py-4 text-white hover:bg-slate-800"
            >
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 mr-3" />
                <span>Manage Payment Methods</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
            
            <hr className="border-t border-slate-700" />
            
            <button 
              onClick={() => navigate('/subscription/billing')}
              className="w-full flex items-center justify-between px-6 py-4 text-white hover:bg-slate-800"
            >
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3" />
                <span>Billing History</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
            
            <hr className="border-t border-slate-700" />
            
            <button 
              onClick={() => {
                // Open Lemon Squeezy customer portal
                // Open the customer portal
                // Use optional chaining to safely access subscriptionId
                window.location.href = `/api/customer-portal?subscriptionId=${subscription?.subscriptionId || ''}`;
              }}
              className="w-full flex items-center justify-between px-6 py-4 text-white hover:bg-slate-800"
            >
              <div className="flex items-center text-red-500">
                <AlertCircle className="h-5 w-5 mr-3" />
                <span>Cancel Subscription</span>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
    </ResponsiveLayout>
  );
};

export default SubscriptionPage;
