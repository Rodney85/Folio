import React, { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { CheckCircle, XCircle, Clock, AlertTriangle } from 'lucide-react';

export const SubscriptionStatusTest: React.FC = () => {
  // Test the subscription query
  const subscription = useQuery(api.subscriptions.getUserSubscription, {});

  useEffect(() => {
    console.log('Subscription data:', subscription);
  }, [subscription]);

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status Test</CardTitle>
          <CardDescription>Loading subscription data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Checking subscription status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status Test</CardTitle>
        <CardDescription>Real-time subscription data from Convex</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Status</h4>
            <div className="flex items-center mt-1">
              {subscription.status === 'active' ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              ) : subscription.status === 'trial' ? (
                <Clock className="w-4 h-4 text-blue-500 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span className="font-medium">{subscription.status}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Plan</h4>
            <p className="font-medium">{subscription.plan || 'None'}</p>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Active</h4>
            <div className="flex items-center mt-1">
              {subscription.isActive ? (
                <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500 mr-2" />
              )}
              <span>{subscription.isActive ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Trial</h4>
            <div className="flex items-center mt-1">
              {subscription.isInTrial ? (
                <Clock className="w-4 h-4 text-blue-500 mr-2" />
              ) : (
                <XCircle className="w-4 h-4 text-gray-500 mr-2" />
              )}
              <span>{subscription.isInTrial ? 'Yes' : 'No'}</span>
            </div>
          </div>
        </div>

        {subscription.daysRemaining > 0 && (
          <div>
            <h4 className="font-semibold text-sm text-gray-600 uppercase tracking-wide">Days Remaining</h4>
            <p className="font-medium">{subscription.daysRemaining} days</p>
          </div>
        )}

        {subscription.trialEnded && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center">
              <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mr-2" />
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Trial has ended
              </span>
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 mt-4">
          <p>Last updated: {new Date().toLocaleTimeString()}</p>
          <p>This data updates in real-time when webhooks are received</p>
        </div>
      </CardContent>
    </Card>
  );
};
