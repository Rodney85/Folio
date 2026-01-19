import { useNavigate } from "react-router-dom";
import { Sparkles, Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PremiumUpgradePromptProps {
    feature: string;
    title?: string;
    description?: string;
}

const PremiumUpgradePrompt = ({
    feature,
    title,
    description,
}: PremiumUpgradePromptProps) => {
    const navigate = useNavigate();

    const defaultTitle = `Upgrade to Premium to ${feature}`;
    const defaultDescription = `Get access to all premium features including adding unlimited cars, mods, and making your profile public for everyone to see.`;

    const benefits = [
        "Add unlimited cars to your collection",
        "Add mods and parts to showcase your builds",
        "Make your profile public for the world to see",
        "Get featured in the Explore feed",
        "Access detailed analytics",
    ];

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Premium Card */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-8">
                    {/* Glow Effect */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl" />

                    {/* Lock Icon */}
                    <div className="relative flex justify-center mb-6">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/25">
                                <Lock className="h-7 w-7 text-white" />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="relative text-2xl font-bold text-center text-white mb-3">
                        {title || defaultTitle}
                    </h2>

                    {/* Description */}
                    <p className="relative text-slate-400 text-center text-sm mb-6">
                        {description || defaultDescription}
                    </p>

                    {/* Benefits List */}
                    <div className="relative space-y-3 mb-8">
                        {benefits.map((benefit, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                                    <Check className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-sm text-slate-300">{benefit}</span>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <Button
                        onClick={() => navigate("/subscription")}
                        className="relative w-full py-6 text-base font-semibold bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90 shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-xl hover:shadow-primary/30"
                    >
                        <Sparkles className="h-5 w-5 mr-2" />
                        Upgrade to Premium
                    </Button>

                    {/* Terms */}
                    <p className="relative text-xs text-slate-500 text-center mt-4">
                        Cancel anytime. Premium features are available immediately.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PremiumUpgradePrompt;
