import { Card } from "@/components/ui/card";
import { ChevronRight, Lock, Star } from "lucide-react";
import { SubscriptionPlan } from "../../../convex/subscriptions";

interface PlanUpgradePromptProps {
  currentPlan: string;
}

const PlanUpgradePrompt = ({ currentPlan }: PlanUpgradePromptProps) => {
  // Determine which tier to promote
  const isFreePlan = !currentPlan || currentPlan === SubscriptionPlan.FREE;

  return (
    <Card className="p-6">
      <div className="flex flex-col items-center text-center">
        <div className="p-3 bg-muted rounded-full mb-4">
          <Lock className="h-8 w-8 text-muted-foreground" />
        </div>
        
        <h3 className="text-xl font-bold mb-2">
          {isFreePlan ? 'Starter Analytics' : 'Pro Analytics'} Required
        </h3>
        
        <p className="text-muted-foreground mb-6 max-w-md">
          {isFreePlan
            ? 'Upgrade to our Starter plan to unlock detailed analytics for your profile and cars.'
            : 'Take your analytics to the next level with our Pro plan for advanced insights and features.'}
        </p>
        
        <div className="bg-muted/50 p-4 rounded-lg w-full mb-6">
          <h4 className="font-semibold mb-3 flex items-center">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            {isFreePlan ? 'Starter Plan Features' : 'Pro Plan Features'}
          </h4>
          
          <ul className="space-y-2 text-left">
            {isFreePlan ? (
              // Starter plan features
              <>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Profile views – total + last 7 / 30 days</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Unique visitors (approx.)</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Car views – per car & total</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Product-link clicks – per car & top 3 products</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Last activity timestamp</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Simple trend ("views by day" bar for last 14 days)</span>
                </li>
              </>
            ) : (
              // Pro plan features
              <>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Everything in starter plan</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Click-through-rate (CTR) per product</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Time-series charts with period comparison</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Traffic sources (Instagram, TikTok, direct, etc.)</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Geo breakdown (country or city)</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Real-time active viewers (last 30 min)</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Trend alerts ("views up 25% vs. last week")</span>
                </li>
                <li className="flex items-center">
                  <ChevronRight className="h-4 w-4 mr-2 text-primary" />
                  <span>Export data (CSV) + scheduled email digest</span>
                </li>
              </>
            )}
          </ul>
        </div>
        
        <div className="flex flex-col w-full">
          <button className="bg-primary text-primary-foreground py-3 rounded-lg mb-2">
            Upgrade to {isFreePlan ? 'Starter' : 'Pro'} Plan
          </button>
          <p className="text-sm text-muted-foreground">
            Starting at ${isFreePlan ? '9.99' : '19.99'}/month
          </p>
        </div>
      </div>
    </Card>
  );
};

export default PlanUpgradePrompt;
