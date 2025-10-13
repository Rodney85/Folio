import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Crown, ArrowRight } from 'lucide-react';
import ResponsiveLayout from '@/components/layout/ResponsiveLayout';
import { Button } from '@/components/ui/button';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const subscription = useQuery(api.subscriptions.getUserSubscription, {});

  useEffect(() => {
    // Refresh subscription status after successful payment
    // The query will automatically refetch when this component mounts
  }, []);

  return (
    <ResponsiveLayout>
      <div className="max-w-2xl mx-auto p-8 text-center">
        <div className="mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to Carfolio Premium!
          </h1>
          
          <p className="text-slate-300 text-lg mb-8">
            Your subscription has been activated successfully. You now have access to all premium features.
          </p>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-yellow-500 mr-3" />
            <h2 className="text-xl font-semibold text-white">Premium Features Unlocked</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4 text-left">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Unlimited car profiles</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Public sharing links</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Advanced analytics</span>
            </div>
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-slate-300">Priority support</span>
            </div>
          </div>
        </div>

        {subscription && (
          <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4 mb-8">
            <p className="text-green-400 text-sm">
              ✅ <strong>Status:</strong> {subscription.isActive ? 'Active' : subscription.isInTrial ? 'Trial' : 'Processing'} 
              {subscription.plan && ` • ${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            onClick={() => navigate('/cars')}
            className="bg-blue-600 hover:bg-blue-700 flex items-center"
          >
            Start Building Your Collection
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          <Button 
            onClick={() => navigate('/subscription')}
            variant="outline"
            className="text-white border-slate-600 hover:bg-slate-800"
          >
            View Subscription Details
          </Button>
        </div>

        <div className="mt-8 p-4 bg-blue-500/10 rounded-lg">
          <p className="text-blue-400 text-sm">
            🎉 <strong>Pro Tip:</strong> Check your email for a confirmation receipt and next steps.
          </p>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default SubscriptionSuccessPage;
