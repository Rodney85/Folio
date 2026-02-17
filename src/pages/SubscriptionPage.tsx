import { useNavigate } from "react-router-dom";
import type { Variants } from "framer-motion";
import { motion } from "framer-motion";
import { Check, X, Crown, Zap, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { useAction, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { SEO } from "@/components/SEO";
import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout";
import { useUser } from "@clerk/clerk-react";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import MobileLayout from "@/components/layout/MobileLayout";

// ─── Feature comparison table (matches landing page exactly) ──────────────────
interface FeatureRow {
    label: string;
    free: boolean | string;
    pro: boolean | string;
    og: boolean | string;
}

const features: FeatureRow[] = [
    { label: "Car Slots", free: "3", pro: "Unlimited", og: "Unlimited" },
    { label: "Public Profile & Link", free: true, pro: true, og: true },
    { label: "Explore Feed", free: true, pro: true, og: true },
    { label: "Shoppable Builds", free: false, pro: true, og: true },
    { label: "Analytics Dashboard", free: false, pro: true, og: true },
    { label: "Ad-Free Profile", free: false, pro: true, og: true },
    { label: "OG Badge", free: false, pro: false, og: true },
    { label: "Lifetime Access", free: false, pro: false, og: true },
];

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.15, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number] },
    }),
};

function FeatureValue({ value }: { value: boolean | string }) {
    if (typeof value === "string") {
        return <span className="text-white font-semibold text-sm">{value}</span>;
    }
    return value ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500/15 flex items-center justify-center">
            <Check className="w-3 h-3 text-emerald-400" />
        </div>
    ) : (
        <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center">
            <X className="w-3 h-3 text-slate-600" />
        </div>
    );
}

const SubscriptionPage = () => {
    const navigate = useNavigate();
    const { isSignedIn } = useUser();
    const isMobile = useMediaQuery("(max-width: 767px)");

    // Fix: Define missing state and action
    const [loadingPlan, setLoadingPlan] = useState<"monthly" | "lifetime" | null>(null);
    const createCheckout = useAction(api.dodo.createCheckoutSession);
    const ogUserCount = useQuery(api.dodo.getOgUserCount) || 0;
    const remainingSpots = Math.max(0, 100 - (ogUserCount as number));

    const userProfile = useQuery(api.users.getProfile);
    const isSubscribed = userProfile?.subscriptionStatus === "active";
    const planName = userProfile?.planId?.includes("lifetim") ? "OG Member" : "Pro Member"; // Simple heuristic for now

    const handleUpgrade = async (planType: "monthly" | "lifetime") => {
        setLoadingPlan(planType);
        try {
            const { checkoutUrl } = await createCheckout({
                planType,
                successUrl: `${window.location.origin}/subscription/success`,
                cancelUrl: `${window.location.origin}/subscription`,
            });
            window.location.href = checkoutUrl;
        } catch (error) {
            console.error("Checkout error:", error);
            alert("Failed to start checkout. Please try again.");
        } finally {
            setLoadingPlan(null);
        }
    };

    const [loadingPortal, setLoadingPortal] = useState(false);
    const createPortal = useAction(api.dodo.createCustomerPortalSession);

    const handleManageSubscription = async () => {
        setLoadingPortal(true);
        try {
            const { portalUrl } = await createPortal({
                returnUrl: window.location.href,
            });
            window.location.href = portalUrl;
        } catch (error) {
            console.error("Portal error:", error);
            alert("Failed to access billing portal. Please contact support.");
        } finally {
            setLoadingPortal(false);
        }
    };

    const pageContent = (
        <div className="min-h-screen bg-background text-white relative overflow-hidden">
            <SEO
                title="Pricing - CarFolio"
                description="Choose your CarFolio plan. Monthly Pro or Lifetime OG options available."
                image="/og-image.png"
            />

            <div className="max-w-6xl mx-auto px-6 py-12 relative z-10">
                {/* Back button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors cursor-pointer mb-12"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                </button>

                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        {isSubscribed ? "Your Subscription" : "Unlock Your Build's Potential"}
                    </h1>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg">
                        {isSubscribed
                            ? "Manage your plan and billing details."
                            : "Start free. Upgrade when you're ready to monetize."}
                    </p>
                </div>

                {isSubscribed ? (
                    /* ─── MANAGE SUBSCRIPTION VIEW ─── */
                    <div className="max-w-md mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-sm p-8 flex flex-col items-center text-center"
                        >
                            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                                <Check className="w-8 h-8 text-emerald-500" />
                            </div>

                            <h3 className="text-2xl font-bold text-white mb-2">{planName}</h3>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                Active Subscription
                            </div>

                            <div className="w-full space-y-4">
                                <button
                                    onClick={handleManageSubscription}
                                    disabled={loadingPortal}
                                    className="w-full py-3 rounded-xl border border-white/10 text-white font-medium hover:bg-white/5 transition-colors flex items-center justify-center gap-2"
                                >
                                    {loadingPortal ? <Loader2 className="h-4 w-4 animate-spin" /> : "Manage Billing"}
                                </button>
                                <p className="text-xs text-slate-500">
                                    Need to cancel or update payment method? Contact support.
                                </p>
                            </div>
                        </motion.div>
                    </div>
                ) : (
                    /* ─── PRICING TIERS (Unsubscribed) ─── */
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

                        {/* ─── FREE ─── */}
                        <motion.div
                            custom={0}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm p-6 md:p-8 flex flex-col"
                        >
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles className="w-5 h-5 text-slate-400" />
                                    <span className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Free</span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-bold text-white">$0</span>
                                    <span className="text-slate-500 text-sm">/forever</span>
                                </div>
                                <p className="text-slate-500 text-sm">Showcase your cars to the world.</p>
                            </div>

                            <div className="space-y-3 flex-1 mb-8">
                                {features.map((f) => (
                                    <div key={f.label} className="flex items-center justify-between py-1.5">
                                        <span className="text-slate-400 text-sm">{f.label}</span>
                                        <FeatureValue value={f.free} />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate("/profile")}
                                className="w-full py-3 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                            >
                                Current Plan
                            </button>
                        </motion.div>

                        {/* ─── PRO — Featured ─── */}
                        <motion.div
                            custom={1}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative rounded-2xl border border-blue-500/20 bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 flex flex-col ring-1 ring-blue-500/10"
                        >
                            {/* Accent bar */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                            {/* Popular badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-500/30">
                                    Most Popular
                                </span>
                            </div>

                            <div className="mb-6 mt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <Zap className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Pro</span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-bold text-white">$5.99</span>
                                    <span className="text-slate-500 text-sm">/month</span>
                                </div>
                                <p className="text-slate-500 text-sm">Monetize your builds & track performance.</p>
                            </div>

                            <div className="space-y-3 flex-1 mb-8">
                                {features.map((f) => (
                                    <div key={f.label} className="flex items-center justify-between py-1.5">
                                        <span className="text-slate-300 text-sm">{f.label}</span>
                                        <FeatureValue value={f.pro} />
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => handleUpgrade("monthly")}
                                disabled={loadingPlan !== null}
                                className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loadingPlan === "monthly" ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    "Upgrade to Pro"
                                )}
                            </button>
                        </motion.div>

                        {/* ─── OG ─── */}
                        <motion.div
                            custom={2}
                            variants={cardVariants}
                            initial="hidden"
                            animate="visible"
                            className="relative rounded-2xl border border-amber-500/15 bg-slate-900/40 backdrop-blur-sm p-6 md:p-8 flex flex-col"
                        >
                            {/* Accent bar */}
                            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500 to-transparent" />

                            {/* Launch Offer badge */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <span className="px-3 py-1 rounded-full bg-amber-500 text-black text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/30">
                                    Launch Offer
                                </span>
                            </div>

                            <div className="mb-6 mt-2">
                                <div className="flex items-center gap-2 mb-3">
                                    <Crown className="w-5 h-5 text-amber-400" />
                                    <span className="text-sm font-semibold text-amber-400 uppercase tracking-wider">OG</span>
                                </div>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-bold text-white">$49</span>
                                    <span className="text-slate-500 text-sm">/one-time</span>
                                </div>
                                <p className="text-slate-500 text-sm">Launch price — everything in Pro, forever.</p>
                            </div>

                            <div className="space-y-3 flex-1 mb-8">
                                {features.map((f) => (
                                    <div key={f.label} className="flex items-center justify-between py-1.5">
                                        <span className="text-slate-400 text-sm">{f.label}</span>
                                        <FeatureValue value={f.og} />
                                    </div>
                                ))}
                            </div>

                            {/* Urgency */}
                            <div className="mb-4 text-center space-y-1">
                                <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                                    {remainingSpots} of 100 spots left
                                </span>
                                <p className="text-amber-400/60 text-xs animate-pulse">Limited to first 100 members</p>
                            </div>

                            <button
                                onClick={() => handleUpgrade("lifetime")}
                                disabled={loadingPlan !== null}
                                className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                            >
                                {loadingPlan === "lifetime" ? (
                                    <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                                ) : (
                                    "Become an OG"
                                )}
                            </button>
                        </motion.div>
                    </div>
                )}


                {/* Secure payment note */}
                <div className="text-center mt-12 space-y-2">
                    <p className="text-xs text-slate-500">
                        🔒 Secure payment powered by Dodo Payments
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="text-slate-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto group"
                    >
                        Not sure yet? <span className="underline decoration-slate-700 underline-offset-4 group-hover:decoration-white transition-all">Explore the free plan</span>
                    </button>
                </div>
            </div>
        </div>
    );

    // Wrap in app layout when signed in so sidebar/bottom nav are visible
    if (isSignedIn) {
        return isMobile ? (
            <MobileLayout>{pageContent}</MobileLayout>
        ) : (
            <ResponsiveLayout noPadding>{pageContent}</ResponsiveLayout>
        );
    }

    return pageContent;
};

export default SubscriptionPage;
