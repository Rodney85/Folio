import React from "react";
import DatabaseWithRestApi from "@/components/ui/database-with-rest-api"; // Ensure this path is correct
import { Car, Share2, DollarSign, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Meteors } from "@/components/ui/meteors";

interface BentoCardProps {
    title: string;
    description: string;
    icon: React.ElementType;
    className?: string;
    bgClass?: string;
    iconColor?: string;
    iconBg?: string;
}

const BentoCard = ({ title, description, icon: Icon, className = "", bgClass = "", iconColor = "", iconBg = "" }: BentoCardProps) => (
    <motion.div
        className={`relative overflow-hidden rounded-3xl neumorph-card border border-white/5 p-8 flex flex-col justify-between group transition-all duration-300 hover:border-white/10 ${className}`}
    >
        <div className={`absolute inset-0 bg-gradient-to-br ${bgClass} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

        <div className="relative z-10">
            <div className={`h-12 w-12 rounded-2xl border flex items-center justify-center mb-6 ${iconBg} group-hover:scale-110 transition-transform duration-300 ease-out`}>
                <Icon className={`h-6 w-6 ${iconColor}`} />
            </div>

            <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed group-hover:text-slate-300 transition-colors">
                {description}
            </p>
        </div>

        <div className="relative z-10 mt-6 flex items-center text-sm font-medium text-slate-500 group-hover:text-white transition-colors">
            <span>Learn more</span>
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
        </div>

        <Meteors number={10} className="opacity-0 group-hover:opacity-50 transition-opacity duration-700" />
    </motion.div>
);

export const BentoFeatures = () => {
    return (
        <section id="solution" className="py-24 bg-background text-white overflow-hidden relative">


            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6 tracking-tight">
                        Your build's story is <span className="text-indigo-500">scattered</span>.
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Across forums. In social feeds. In endless DMs. The details that matter get lost.
                        CarFolio brings everything together into a single, shareable link.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-[minmax(280px,auto)]">

                    {/* Large "One Link" Feature - Spans 2x2 */}
                    <div className="col-span-1 md:col-span-2 lg:col-span-2 row-span-1 md:row-span-2 relative rounded-3xl neumorph-card border border-white/5 overflow-hidden flex flex-col items-center justify-center p-4 md:p-8 group hover:border-indigo-500/30 transition-colors duration-500">
                        <div className="absolute inset-0 bg-indigo-500/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <div className="relative z-10 text-center mb-8">
                            <h3 className="text-3xl font-bold text-white mb-2">One Link</h3>
                            <p className="text-slate-400">The definitive home for your automotive identity.</p>
                        </div>
                        <div className="relative z-10 w-full flex justify-center scale-100 transition-transform duration-500 group-hover:scale-105">
                            <DatabaseWithRestApi
                                title="CarFolio"
                                circleText="API"
                                badgeTexts={{ first: "Cars", second: "Parts", third: "Share", fourth: "Earn" }}
                                buttonTexts={{ first: "CarFolio", second: "v3_builds" }}
                                lightColor="#6366f1"
                                className="!bg-transparent shadow-none"
                            />
                        </div>
                    </div>

                    {/* "Build Your Folio" - Tall Card */}
                    <BentoCard
                        title="Build Your Folio"
                        description="Add your vehicles and document every modification with stunning detail. Create a professional spec sheet in minutes."
                        icon={Car}
                        className="col-span-1 md:col-span-1 lg:col-span-2"
                        bgClass="from-blue-600/20 to-teal-600/20"
                        iconColor="text-blue-400"
                        iconBg="bg-blue-500/10 border-blue-500/20"
                    />

                    {/* "Share Your Link" - Standard Card */}
                    <BentoCard
                        title="Share Your Link"
                        description="Your personalized carfolio.io URL becomes the single source for your entire build history."
                        icon={Share2}
                        className="col-span-1"
                        bgClass="from-purple-600/20 to-pink-600/20"
                        iconColor="text-purple-400"
                        iconBg="bg-purple-500/10 border-purple-500/20"
                    />

                    {/* "Monetize" - Standard Card */}
                    <BentoCard
                        title="Turn Parts Into Paychecks"
                        description="Connect affiliate links to the parts you trust and turn your passion into a paycheck."
                        icon={DollarSign}
                        className="col-span-1"
                        bgClass="from-orange-600/20 to-red-600/20"
                        iconColor="text-orange-400"
                        iconBg="bg-orange-500/10 border-orange-500/20"
                    />
                </div>
            </div>
        </section>
    );
};
