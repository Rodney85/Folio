import React, { useEffect } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { useAuth, useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { CheckCircle, CreditCard, Webhook, TestTube, Activity } from "lucide-react";
import { SubscriptionStatusTest } from "./SubscriptionStatusTest";

export const DodoPaymentsTestPage: React.FC = () => {
  const { userId } = useAuth();
  const { user } = useUser();
  const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || "";
  const name =
    user?.fullName ||
    (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.firstName) ||
    (email ? email.split("@")[0] : "Carfolio User");

  const testMonthlyCheckout = async () => {
    if (!userId) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
      const response = await fetch(`${CONVEX_URL}/checkoutSession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "monthly", userId, email, name }),
      });
  
      const data = await response.json();
      const redirectUrl = data.checkout_url || data.checkoutUrl;
  
      if (response.ok && redirectUrl) {
        toast.success("Redirecting to Dodo Payments...");
        window.location.href = redirectUrl;
      } else {
        toast.error(`Checkout failed: ${data.error || "No checkout URL returned"}`);
      }
    } catch (error) {
      toast.error("Network error occurred");
    }
  };

  const testYearlyCheckout = async () => {
    if (!userId) {
      toast.error("Please sign in first");
      return;
    }

    try {
      const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
      const response = await fetch(`${CONVEX_URL}/checkoutSession`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "yearly", userId, email, name }),
      });
  
      const data = await response.json();
      const redirectUrl = data.checkout_url || data.checkoutUrl;
  
      if (response.ok && redirectUrl) {
        toast.success("Redirecting to Dodo Payments...");
        window.location.href = redirectUrl;
      } else {
        toast.error(`Checkout failed: ${data.error || "No checkout URL returned"}`);
      }
    } catch (error) {
      toast.error("Network error occurred");
    }
  };

  const testWebhook = async () => {
    try {
      const CONVEX_URL = import.meta.env.VITE_CONVEX_URL;
      const response = await fetch(`${CONVEX_URL}/dodoWebhooks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_id: "test_business",
          timestamp: new Date().toISOString(),
          type: "subscription.active",
          data: {
            subscription_id: "test_sub_123",
            customer_id: userId || "test_customer",
            status: "active",
            plan: "monthly",
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            cancel_at_period_end: false,
            created_at: new Date().toISOString(),
          }
        }),
      });

      if (response.ok) {
        toast.success("Webhook test sent successfully");
      } else {
        toast.error("Webhook test failed");
      }
    } catch (error) {
      toast.error("Webhook test error");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          Dodo Payments Integration Test
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Test the Dodo Payments integration with your provided credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Checkout */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2" />
              Checkout Tests
            </CardTitle>
            <CardDescription>
              Test the subscription checkout flow
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button onClick={testMonthlyCheckout} className="w-full">
                Test Monthly Plan ($29.99)
              </Button>
              <Button onClick={testYearlyCheckout} variant="outline" className="w-full">
                Test Yearly Plan ($29.99)
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Test Webhooks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Webhook className="w-5 h-5 mr-2" />
              Webhook Tests
            </CardTitle>
            <CardDescription>
              Test webhook event handling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={testWebhook} variant="outline" className="w-full">
              <TestTube className="w-4 h-4 mr-2" />
              Test Subscription Active Webhook
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Environment Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Environment Configuration</CardTitle>
          <CardDescription>
            Current Dodo Payments setup information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">API Configuration</h4>
              <div className="space-y-1 text-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                  API Key: {process.env.VITE_DODO_API_KEY ? "Set" : "Missing"}
                </div>
                <div>Webhook URL: https://play.svix.com/in/e_q9wlnpkGbe4vNIagVUJEIGIc4eT/</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Product IDs</h4>
              <div className="space-y-1 text-sm">
                <div>Monthly: prod_monthly_2999 ($29.99)</div>
                <div>Yearly: prod_yearly_2999_2free ($29.99)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Subscription Status */}
      <div className="mt-8">
        <SubscriptionStatusTest />
      </div>

      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
          Testing Instructions
        </h3>
        <ol className="list-decimal list-inside text-blue-800 dark:text-blue-200 space-y-1 text-sm">
          <li>Make sure you're signed in with Clerk authentication</li>
          <li>Click "Test Monthly Plan" to test the monthly subscription flow</li>
          <li>Click "Test Yearly Plan" to test the yearly subscription flow</li>
          <li>Use the webhook test to verify event handling works</li>
          <li>Check the browser console for any errors</li>
        </ol>
      </div>
    </div>
  );
};
export default DodoPaymentsTestPage;
