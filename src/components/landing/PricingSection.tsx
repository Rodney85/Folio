import React from "react";
import type { Variants } from "framer-motion";
import { Check, X, Crown, Zap, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";

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

export const PricingSection = () => {
    const { isSignedIn } = useUser();
    const navigate = useNavigate();
    const ogUserCount: any = useQuery(api.dodo.getOgUserCount as any) ?? 0;
    const TOTAL_OG_SPOTS = 100;
    const remainingSpots = Math.max(0, TOTAL_OG_SPOTS - ogUserCount);

    const handleCta = (plan: "free" | "pro" | "og") => {
        if (plan === "free") {
            navigate(isSignedIn ? "/cars" : "/sign-up");
        } else {
            navigate(isSignedIn ? "/subscription" : "/sign-up");
        }
    };

    return (
        <section id="pricing" className="py-24 bg-background relative overflow-hidden">
            <div className="max-w-6xl mx-auto px-6 relative z-10">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
                        Unlock Your Build's Potential
                    </h2>
                    <p className="text-slate-400 max-w-xl mx-auto text-lg">
                        Start free. Upgrade when you're ready to monetize.
                    </p>
                </div>

                {/* 3-Column Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

                    {/* FREE */}
                    <motion.div
                        custom={0}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="rounded-2xl border border-white/5 bg-slate-900/40 backdrop-blur-sm p-6 md:p-8 flex flex-col"
                    >
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Sparkles className="w-5 h-5 text-slate-300" />
                                <span className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Free</span>
                            </div>
                            <div className="flex items-baseline gap-1 mb-2">
                                <span className="text-4xl font-bold text-white">$0</span>
                                <span className="text-slate-400 text-sm">/forever</span>
                            </div>
                            <p className="text-slate-400 text-sm">Showcase your cars to the world.</p>
                        </div>

                        <div className="space-y-3 flex-1 mb-8">
                            {features.map((f) => (
                                <div key={f.label} className="flex items-center justify-between py-1.5">
                                    <span className="text-slate-300 text-sm">{f.label}</span>
                                    <FeatureValue value={f.free} />
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => handleCta("free")}
                            className="w-full py-3 rounded-xl border border-white/10 text-slate-300 font-semibold text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-300"
                        >
                            Start Free
                        </button>
                    </motion.div>

                    {/* PRO — Featured */}
                    <motion.div
                        custom={1}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
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
                            <div className="flex flex-col mb-4 gap-1.5 mt-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">$5.99</span>
                                    <span className="text-slate-500 text-sm">/month</span>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-slate-500 line-through text-sm font-medium">$11.99</span>
                                    <span className="text-amber-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 whitespace-nowrap">
                                        50% Off Launch Offer
                                    </span>
                                </div>
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
                            onClick={() => handleCta("pro")}
                            className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-blue-500/25 hover:scale-[1.02] transition-all duration-300"
                        >
                            Start Pro Trial
                        </button>
                    </motion.div>

                    {/* OG */}
                    <motion.div
                        custom={2}
                        variants={cardVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
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
                                <span className="text-slate-400 text-sm">/one-time</span>
                            </div>
                            <p className="text-slate-400 text-sm">Launch price — everything in Pro, forever.</p>
                        </div>

                        <div className="space-y-3 flex-1 mb-8">
                            {features.map((f) => (
                                <div key={f.label} className="flex items-center justify-between py-1.5">
                                    <span className="text-slate-300 text-sm">{f.label}</span>
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
                            onClick={() => handleCta("og")}
                            className="w-full py-3 rounded-xl font-bold text-white text-sm bg-gradient-to-r from-amber-500 to-orange-600 hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] transition-all duration-300"
                        >
                            Become an OG
                        </button>
                    </motion.div>
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => navigate(isSignedIn ? "/cars" : "/sign-up")}
                        className="text-slate-500 hover:text-white transition-colors text-sm font-medium flex items-center justify-center gap-2 mx-auto group"
                    >
                        Not sure yet? <span className="underline decoration-slate-700 underline-offset-4 group-hover:decoration-white transition-all">Explore the free plan</span>
                    </button>
                </div>
            </div>
        </section>
    );
};
