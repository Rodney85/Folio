import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { useCurrentSubscription } from '@/lib/subscription-utils';

const SubscriptionSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const subscription = useCurrentSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const orderId = searchParams.get('order_id');

  // Check if subscription data is loaded
  useEffect(() => {
    // Set a timeout to ensure we give Convex enough time to update the subscription data
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [subscription]);

  return (
    <div className="container max-w-3xl mx-auto px-4 py-12">
      <div className="bg-slate-800/50 rounded-lg p-8">
        <div className="flex flex-col items-center justify-center text-center">
          {isLoading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
              <h1 className="text-2xl font-bold mb-2">Processing your subscription...</h1>
              <p className="text-slate-400 mb-6">
                Please wait while we confirm your subscription details.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Subscription Activated!</h1>
              <p className="text-slate-400 mb-6">
                Thank you for subscribing to Carfolio Pro. Your subscription has been successfully activated.
              </p>
              
              {orderId && (
                <div className="bg-slate-700/50 px-4 py-3 rounded-md mb-6">
                  <p className="text-sm text-slate-300">Order ID: <span className="font-mono">{orderId}</span></p>
                </div>
              )}
              
              <div className="grid gap-4">
                <Button 
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Go to your profile
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/analytics/pro')}
                >
                  Explore Pro Analytics
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessPage;
