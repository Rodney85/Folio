import React from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";
import { Badge } from "./badge";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { toast } from "sonner";

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: "month" | "year";
  description: string;
  features: string[];
  popular?: boolean;
  savings?: string;
}

const pricingPlans: PricingPlan[] = [
  {
    id: "monthly",
    name: "Monthly",
    price: 29.99,
    interval: "month",
    description: "Perfect for trying out Carfolio",
    features: [
      "Unlimited car listings",
      "Advanced search filters",
      "Image upload & storage",
      "Direct messaging",
      "24/7 customer support",
      "Mobile app access"
    ]
  },
  {
    id: "yearly",
    name: "Yearly",
    price: 29.99,
    interval: "year",
    description: "Best value - 2 months free!",
    features: [
      "Unlimited car listings",
      "Advanced search filters",
      "Image upload & storage",
      "Direct messaging",
      "24/7 customer support",
      "Mobile app access",
      "Priority support",
      "Advanced analytics"
    ],
    popular: true,
    savings: "Save $60/year"
  }
];

export const PricingSection: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();

  const handleSubscribe = async (plan: PricingPlan) => {
    if (!userId) {
      // Redirect to sign up if not authenticated
      navigate("/sign-up");
      return;
    }

    try {
      // Call our Convex function to create Dodo Payments checkout session
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: plan.id,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Redirect to Dodo Payments checkout
        window.location.href = data.checkoutUrl;
      } else {
        console.error("Failed to create checkout session:", data.error);
        toast.error("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast.error("Error creating checkout session. Please try again.");
    }
  };

  return (
    <div className="py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Start your journey with Carfolio today. Choose the plan that fits your needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative ${
                plan.popular
                  ? "border-primary shadow-lg scale-105"
                  : "border-gray-200 dark:border-gray-700"
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary">
                  Most Popular
                </Badge>
              )}

              {plan.savings && (
                <Badge variant="secondary" className="absolute -top-3 right-4">
                  {plan.savings}
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  <span className="text-gray-600 dark:text-gray-400">/{plan.interval}</span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  onClick={() => handleSubscribe(plan)}
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary hover:bg-primary/90"
                      : "bg-gray-900 dark:bg-gray-100 hover:bg-gray-800 dark:hover:bg-gray-200"
                  }`}
                  size="lg"
                >
                  Subscribe to {plan.name}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Need help choosing? <a href="/contact" className="text-primary hover:underline">Contact us</a>
          </p>
        </div>
      </div>
    </div>
  );
};
