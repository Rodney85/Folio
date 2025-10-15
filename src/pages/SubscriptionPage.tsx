import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink, Crown, Calendar, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

export default function SubscriptionPage() {
  const { user } = useUser();
  const subscription = useQuery(api.subscriptions.getUserSubscription);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async (plan: "monthly" | "yearly") => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Convert .convex.cloud to .convex.site for HTTP routes
      const httpUrl = import.meta.env.VITE_CONVEX_URL.replace('.convex.cloud', '.convex.site');
      const response = await fetch(`${httpUrl}/checkoutSession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan,
          userId: user.id,
          email: user.emailAddresses[0]?.emailAddress,
          name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress.split("@")[0],
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutUrl) {
        // Redirect to Dodo Payments checkout
        window.location.href = data.checkoutUrl;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  const handleManageSubscription = async () => {
    if (!subscription || !subscription.isActive) return;

    setIsLoading(true);
    try {
      // Use the customerId from the subscription record, not the userId
      const customerId = (subscription as any).customerId || user?.id;

      if (!customerId) {
        toast.error("Customer ID not found. Please contact support.");
        setIsLoading(false);
        return;
      }

      // Get the subscription data to find customerId
      // Convert .convex.cloud to .convex.site for HTTP routes
      const httpUrl = import.meta.env.VITE_CONVEX_URL.replace('.convex.cloud', '.convex.site');
      const subscriptionData = await fetch(`${httpUrl}/customerPortal`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerId: customerId,
        }),
      });

      const data = await subscriptionData.json();

      if (data.portal_url) {
        // Redirect to Dodo Payments customer portal
        window.location.href = data.portal_url;
      } else {
        throw new Error("Failed to get portal URL");
      }
    } catch (error) {
      console.error("Error accessing customer portal:", error);
      toast.error("Failed to access subscription portal. Please try again.");
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Please sign in to view your subscription</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (subscription === undefined) {
    return (
      <div className="container max-w-4xl mx-auto py-12 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading subscription details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (subscription.isActive) {
      return (
        <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    if (subscription.isInTrial) {
      return (
        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">
          <Crown className="h-3 w-3 mr-1" />
          Free Trial
        </Badge>
      );
    }
    if (subscription.trialEnded) {
      return (
        <Badge variant="destructive">
          <XCircle className="h-3 w-3 mr-1" />
          Trial Ended
        </Badge>
      );
    }
    return (
      <Badge variant="secondary">
        <AlertCircle className="h-3 w-3 mr-1" />
        No Subscription
      </Badge>
    );
  };

  const getPlanName = () => {
    if (!subscription.plan) return "No active plan";
    return subscription.plan === "monthly" ? "Monthly Plan" : "Yearly Plan";
  };

  const getPlanPrice = () => {
    if (!subscription.plan) return "";
    return subscription.plan === "monthly" ? "$29.99/month" : "$299.99/year";
  };

  return (
    <div className="container max-w-4xl mx-auto py-12 px-4 space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Your Subscription</CardTitle>
              <CardDescription>Manage your Carfolio subscription</CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active Subscription */}
          {subscription.isActive && (
            <>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start space-x-3">
                  <Crown className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Plan</p>
                    <p className="text-sm text-muted-foreground">{getPlanName()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CreditCard className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Price</p>
                    <p className="text-sm text-muted-foreground">{getPlanPrice()}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Next Billing Date</p>
                    <p className="text-sm text-muted-foreground">
                      {subscription.currentPeriodEnd
                        ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-sm text-muted-foreground">Active & Renewing</p>
                  </div>
                </div>
              </div>
              <Button
                onClick={handleManageSubscription}
                disabled={isLoading}
                className="w-full md:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    Manage Subscription
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </>
          )}

          {/* Free Trial */}
          {subscription.isInTrial && (
            <>
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-2">
                  <Crown className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-blue-500">Free Trial Active</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  You have {subscription.daysRemaining} days remaining in your free trial.
                </p>
                <p className="text-xs text-muted-foreground">
                  Trial ends on {subscription.trialEndDate ? new Date(subscription.trialEndDate).toLocaleDateString() : "N/A"}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Upgrade to a paid plan to continue enjoying premium features after your trial ends.
              </p>
            </>
          )}

          {/* Trial Ended / No Subscription */}
          {(subscription.trialEnded || subscription.status === "none") && (
            <div className="bg-muted/50 border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <AlertCircle className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold">No Active Subscription</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Subscribe to unlock premium features including advanced analytics, unlimited cars, and more.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      {(!subscription.isActive || subscription.status === "none" || subscription.trialEnded) && (
        <div className="grid gap-6 md:grid-cols-2">
          {/* Monthly Plan */}
          <Card className="relative overflow-hidden">
            <CardHeader>
              <CardTitle>Monthly</CardTitle>
              <CardDescription>Perfect for trying out premium features</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$29.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  Advanced Analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited Cars
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  Custom Branding
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  Priority Support
                </li>
              </ul>
              <Button
                className="w-full"
                onClick={() => handleCheckout("monthly")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe Monthly"
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Yearly Plan */}
          <Card className="relative overflow-hidden border-primary">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
              SAVE 17%
            </div>
            <CardHeader>
              <CardTitle>Yearly</CardTitle>
              <CardDescription>Best value for committed users</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$299.99</span>
                <span className="text-muted-foreground">/year</span>
              </div>
              <p className="text-sm text-muted-foreground">$24.99/month when billed annually</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  Advanced Analytics
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  Unlimited Cars
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  Custom Branding
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  Priority Support
                </li>
                <li className="flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-500 mr-2" />
                  <span className="font-semibold">2 Months FREE</span>
                </li>
              </ul>
              <Button
                className="w-full"
                variant="default"
                onClick={() => handleCheckout("yearly")}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Subscribe Yearly"
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-sm mb-1">Can I cancel anytime?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can cancel your subscription at any time from the customer portal. You'll continue to have access until the end of your billing period.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">What happens after my trial ends?</h4>
            <p className="text-sm text-muted-foreground">
              Your trial lasts 7 days. After that, you'll need to subscribe to continue using premium features.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-sm mb-1">Can I change my plan?</h4>
            <p className="text-sm text-muted-foreground">
              Yes, you can upgrade or downgrade your plan at any time through the customer portal.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
