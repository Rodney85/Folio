import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./alert-dialog";
import { Progress } from "./progress";
import { Separator } from "./separator";
import { toast } from "sonner";
import {
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Crown,
  TrendingUp,
  Users,
  Car,
  Download,
  ArrowUp,
  Zap,
  Loader,
  ShieldCheck
} from "lucide-react";

interface SubscriptionData {
  status: string;
  plan: string;
  isActive: boolean;
  isInTrial: boolean;
  trialEnded: boolean;
  daysRemaining: number;
  trialEndDate: string | null;
  currentPeriodEnd: string | null;
}

export const SubscriptionManagement: React.FC = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);

  // Check if user has admin role
  const isAdmin = user?.publicMetadata?.role === 'admin';

  // Fetch user's subscription data
  const subscription = useQuery(api.subscriptions.getUserSubscription, {}) as SubscriptionData | null;
  
  // Mutation to start trial
  const startTrial = useMutation(api.subscriptions.startUserTrial);

  // Handle checkout for subscription
  const handleCheckout = async (planType: 'monthly' | 'yearly') => {
    if (!userId || !user) {
      toast.error("Please sign in to continue");
      return;
    }

    // Admin users bypass payment and get direct access
    if (isAdmin) {
      toast.info("As an admin, you have full access to all features without payment.");
      return;
    }

    setIsLoading(true);
    try {
      const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
      const response = await fetch(`${CONVEX_URL}/createCheckoutSession`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planType,
          userId: userId,
          email: user.primaryEmailAddress?.emailAddress || "",
          name: user.fullName || user.firstName || undefined
        }),
      });

      const data = await response.json();

      if (response.ok && data.checkout_url) {
        toast.success("Redirecting to checkout...");
        window.location.href = data.checkout_url;
      } else {
        toast.error(`Checkout failed: ${data.error || "Unknown error"}`);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to start checkout process:", error);
      toast.error("Failed to start checkout. Please try again.");
      setIsLoading(false);
    }
  };

  const handleStartTrial = async () => {
    if (!userId) {
      toast.error("Please sign in to start your trial");
      return;
    }
    
    setIsLoading(true);
    try {
      await startTrial();
      toast.success("Trial started successfully! Welcome to Carfolio Premium.");
      setIsLoading(false);
    } catch (error) {
      console.error("Failed to start trial:", error);
      toast.error("Failed to start trial. Please try again.");
      setIsLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!userId || !subscription) return;
    toast.info("Please contact support to cancel your subscription, or manage it directly through your payment provider.");
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  const getStatusBadge = (status: string, isActive: boolean, isInTrial: boolean) => {
    if (isInTrial) {
      return (
        <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300">
          <Calendar className="w-3 h-3 mr-1" />
          Free Trial
        </Badge>
      );
    }

    if (isActive) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </Badge>
      );
    }

    switch (status) {
      case "canceled":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        );
      case "expired":
        return (
          <Badge variant="destructive" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 border-orange-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Expired
          </Badge>
        );
      case "on_hold":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300">
            <AlertTriangle className="w-3 h-3 mr-1" />
            On Hold
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border-gray-300">
            Unknown
          </Badge>
        );
    }
  };

  const getPlanDisplayName = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "monthly":
        return "Monthly Plan";
      case "yearly":
        return "Yearly Plan";
      default:
        return plan || "No Plan";
    }
  };

  const getPlanPrice = (plan: string) => {
    switch (plan.toLowerCase()) {
      case "monthly":
        return "$29.99";
      case "yearly":
        return "$299.99"; // 2 months free - effectively $25/month
      default:
        return "$0";
    }
  };

  // Loading state while fetching subscription
  if (!subscription) {
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8 animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-gray-200 dark:bg-gray-700 h-48 rounded-lg animate-pulse"></div>
          <div className="bg-gray-200 dark:bg-gray-700 h-48 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  // If user doesn't have any subscription (even trial) and is NOT admin
  if (subscription.status === "none" && !isAdmin) {

    // Regular user without subscription
    return (
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="text-center">
          <Crown className="w-16 h-16 mx-auto text-yellow-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Start Your Carfolio Journey
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Get started with a 14-day free trial to unlock all premium features
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20">
              <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
              <h3 className="font-semibold">Premium Features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Access all features</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
              <Zap className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold">Public Sharing</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Share your car profiles</p>
            </div>
            <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
              <h3 className="font-semibold">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Track your build performance</p>
            </div>
          </div>
          <Button 
            onClick={handleStartTrial} 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Starting Trial...
              </>
            ) : (
              "Start 14-Day Free Trial"
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Subscription Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your Carfolio subscription and billing
            </p>
          </div>
          {isAdmin && (
            <div className="flex items-center bg-purple-500/10 text-purple-500 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/20">
              <ShieldCheck className="h-5 w-5 mr-2" />
              <span>Admin Access</span>
            </div>
          )}
        </div>
        
        {/* Admin Full Access Notice */}
        {isAdmin && (
          <div className="bg-purple-500/10 rounded-lg p-4 mb-6 border border-purple-500/20">
            <div className="flex items-start">
              <Crown className="h-6 w-6 text-purple-500 mr-3 mt-0.5" />
              <div>
                <h3 className="font-medium text-lg text-gray-900 dark:text-white">Admin Full Access</h3>
                <p className="text-purple-400 mt-1">You have administrative privileges with full access to all premium features regardless of subscription status.</p>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Overview Section */}
      <div id="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Plan */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  <Crown className="w-5 h-5 mr-2 text-yellow-500" />
                  Current Plan
                </CardTitle>
                {getStatusBadge(subscription.status, subscription.isActive, subscription.isInTrial)}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold">{getPlanDisplayName(subscription.plan)}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{getPlanPrice(subscription.plan)}/month</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Next billing</p>
                  <p className="font-medium">
                    {subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : "N/A"}
                  </p>
                </div>
              </div>

              {subscription.isInTrial && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Trial Progress</span>
                    <span>{subscription.daysRemaining} days left</span>
                  </div>
                  <Progress
                    value={(14 - subscription.daysRemaining) / 14 * 100}
                    className="h-2"
                  />
                </div>
              )}

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold">Active Features</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">All premium features enabled</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <Zap className="w-8 h-8 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
                  <h4 className="font-semibold">Priority Support</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">24/7 customer support</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  const element = document.getElementById('plans');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <ArrowUp className="w-4 h-4 mr-2" />
                Upgrade Plan
              </Button>

              <Button
                className="w-full justify-start"
                variant="outline"
                onClick={() => {
                  const element = document.getElementById('billing');
                  element?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Manage Billing
              </Button>


              {subscription.isActive && !subscription.isInTrial && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full justify-start">
                      <XCircle className="w-4 h-4 mr-2" />
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your subscription? You'll retain access
                        until {formatDate(subscription.currentPeriodEnd)}, but won't be charged for the next billing cycle.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleCancelSubscription}>
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Trial Warning */}
        {subscription.trialEnded && !subscription.isActive && (
          <Card className="border-yellow-200 dark:border-yellow-800">
            <CardContent className="pt-6">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mr-3" />
                <div>
                  <h3 className="font-semibold text-yellow-800 dark:text-yellow-200">
                    Trial Expired
                  </h3>
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    Your free trial has ended. Subscribe to continue using Carfolio's premium features.
                  </p>
                </div>
                <Button className="ml-auto" onClick={() => window.location.href = "/pricing"}>
                  Upgrade Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Plans Section */}
      <div id="plans" className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className={`${subscription.plan === "monthly" ? "ring-2 ring-blue-500" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Monthly Plan
                {subscription.plan === "monthly" && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Current
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Perfect for trying out Carfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">$29.99<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/month</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Unlimited car profiles</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Public sharing links</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Advanced analytics</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Priority support</li>
              </ul>
              {subscription.plan !== "monthly" && (
                <Button 
                  className="w-full" 
                  onClick={() => handleCheckout('monthly')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Switch to Monthly"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className={`${subscription.plan === "yearly" ? "ring-2 ring-blue-500" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div>
                  Yearly Plan
                  <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    Best Value
                  </Badge>
                </div>
                {subscription.plan === "yearly" && (
                  <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    Current
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Best value - 2 months free!</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">$29.99<span className="text-lg font-normal text-gray-600 dark:text-gray-400">/year</span></div>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Everything in Monthly</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />2 months free ($60 savings)</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />Early access to new features</li>
                <li className="flex items-center"><CheckCircle className="w-4 h-4 text-green-500 mr-2" />VIP support</li>
              </ul>
              {subscription.plan !== "yearly" && (
                <Button 
                  className="w-full" 
                  onClick={() => handleCheckout('yearly')}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Switch to Yearly"
                  )}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Billing Section */}
      <div id="billing" className="space-y-6 mt-12">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Billing</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center">
                  <CreditCard className="w-5 h-5 mr-3 text-gray-400" />
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Update
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Download Invoices
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>Your recent payments and invoices</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Monthly Subscription</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">September 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$29.99</p>
                    <Badge variant="secondary" className="text-xs">Paid</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Monthly Subscription</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">August 2024</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">$29.99</p>
                    <Badge variant="secondary" className="text-xs">Paid</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
};
