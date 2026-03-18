import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Check, Car, PartyPopper } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const SubscriptionSuccessPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");
    const premiumStatus: any = useQuery(api.freemium.isUserPremium as any);
    const [isVerifying, setIsVerifying] = useState(true);
    const [showRefresh, setShowRefresh] = useState(false);

    useEffect(() => {
        if (premiumStatus?.isPremium) {
            setIsVerifying(false);
            return;
        }

        // Show a refresh button if verification takes too long (8s)
        const refreshTimer = setTimeout(() => {
            if (isVerifying) setShowRefresh(true);
        }, 8000);

        // Instead of faking success, if it takes over 15s, we can stop the spinner 
        // and tell the user to check their subscription page.
        // We will just let 'showRefresh' stay visible. The user can go to the dashboard.
        
        return () => clearTimeout(refreshTimer);
    }, [premiumStatus?.isPremium, isVerifying]);

    const handleRefresh = () => {
        window.location.reload();
    };

    const containerVariants = {
        hidden: { opacity: 0, scale: 0.9 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.5 }
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center py-8 px-4">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-primary/15 rounded-full blur-[128px]" />
                <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-500/15 rounded-full blur-[128px]" />
            </div>

            <motion.div
                className="relative z-10 max-w-md w-full"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-primary/30 p-8 text-center">
                    {/* Glow Effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/30 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

                    {/* Icon */}
                    <div className="relative flex justify-center mb-6">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/40">
                                {isVerifying ? (
                                    <div className="animate-spin h-8 w-8 border-2 border-white border-t-transparent rounded-full" />
                                ) : (
                                    <PartyPopper className="h-8 w-8 text-white" />
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="relative text-3xl font-bold mb-3 text-white">
                        {isVerifying ? "Verifying..." : "Welcome to Founder Tier!"}
                    </h1>

                    {/* Message */}
                    <p className="relative text-slate-400 mb-8">
                        {isVerifying
                            ? "Please wait while we confirm your subscription..."
                            : "You now have access to all premium features. Time to showcase your builds!"}
                    </p>

                    {/* What's Unlocked */}
                    {!isVerifying && (
                        <div className="relative space-y-3 mb-8 text-left">
                            <p className="text-sm font-medium text-slate-300 mb-3">You've unlocked:</p>
                            {[
                                "Unlimited cars",
                                "Affiliate links",
                                "Analytics dashboard",
                                "Ad-Free profile",
                                premiumStatus?.tier === "og" ? "Lifetime Access" : "Premium Support"
                            ].map((item, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                        <Check className="h-3 w-3 text-primary" />
                                    </div>
                                    <span className="text-slate-300 text-sm">{item}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Manual Refresh CTA if stuck */}
                    {isVerifying && showRefresh && (
                        <div className="relative mt-4">
                            <p className="text-sm font-semibold text-rose-400 mb-2">
                                Verification is taking longer than usual, or the payment wasn't completed.
                            </p>
                            <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                <Button 
                                    variant="outline" 
                                    onClick={handleRefresh}
                                    className="border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                    Refresh Status
                                </Button>
                                <Button 
                                    variant="ghost" 
                                    onClick={() => navigate('/subscription')}
                                    className="text-slate-400 hover:text-white"
                                >
                                    Return to Plans
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* CTA Buttons */}
                    {!isVerifying && (
                        <div className="relative space-y-3">
                            <Button
                                onClick={() => navigate("/add-car")}
                                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/25"
                            >
                                <Car className="h-5 w-5 mr-2" />
                                Add Your First Car
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate("/profile")}
                                className="w-full py-5 border-slate-700 text-slate-300 hover:bg-slate-800"
                            >
                                Go to Profile
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SubscriptionSuccessPage;
