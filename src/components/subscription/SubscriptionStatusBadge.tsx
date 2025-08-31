import React from 'react';
import { Crown, Clock, AlertCircle } from 'lucide-react';
import { useCurrentSubscription } from '@/lib/subscription-utils';
import { SubscriptionStatus } from '../../../convex/subscriptions';

/**
 * A badge that shows the user's current subscription status
 * Used in the header/profile area and subscription page
 */
export const SubscriptionStatusBadge = () => {
  const subscription = useCurrentSubscription();
  
  if (!subscription) {
    return null; // Don't show anything if loading or no subscription data
  }
  
  // Display different badge based on subscription status
  switch (subscription.status) {
    case 'active':
      return (
        <div className="flex items-center bg-green-500/10 text-green-500 px-3 py-1 rounded-full text-xs font-medium">
          <Crown className="h-3.5 w-3.5 mr-1.5" />
          <span>Active</span>
        </div>
      );
    
    case 'trial':
      // Calculate days remaining in trial
      const now = Date.now();
      const trialEndDate = subscription.trialEndDate;
      const daysRemaining = trialEndDate ? Math.max(0, Math.ceil((Number(trialEndDate) - now) / (1000 * 60 * 60 * 24))) : 0;
      
      if (daysRemaining <= 3) {
        // Warning color for trial ending soon
        return (
          <div className="flex items-center bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full text-xs font-medium">
            <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
            <span>{daysRemaining === 0 ? 'Trial ending today' : `${daysRemaining} days left`}</span>
          </div>
        );
      }
      
      return (
        <div className="flex items-center bg-blue-500/10 text-blue-500 px-3 py-1 rounded-full text-xs font-medium">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          <span>Trial • {daysRemaining} days left</span>
        </div>
      );
      
    case 'canceled':
      return (
        <div className="flex items-center bg-slate-500/10 text-slate-500 px-3 py-1 rounded-full text-xs font-medium">
          <span>Canceled</span>
        </div>
      );
      
    case 'expired':
      return (
        <div className="flex items-center bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-xs font-medium">
          <AlertCircle className="h-3.5 w-3.5 mr-1.5" />
          <span>Expired</span>
        </div>
      );
    
    default:
      return null;
  }
};

export default SubscriptionStatusBadge;
