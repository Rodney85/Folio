
import React, { useRef, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { Car, Share2, BarChart3, DollarSign, Settings, Trophy, ArrowRight, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const features = [
    {
        title: "The Digital Home for Your Entire Garage",
        description: "From your daily driver to your weekend project and the dream collection. Manage unlimited profiles, track modifications, and document the history of every vehicle you own.",
        icon: Car,
        image: "/mac.png", // Using existing asset for now, would ideally be a "Collection" view
        color: "bg-blue-500"
    },
    {
        title: "The Modern Spec Sheet",
        description: "Forget the notes app. Create cinema-grade galleries with structured modification lists. Your build deserves more than an Instagram caption that disappears in 24 hours.",
        icon: FileText,
        image: "/moblap.png",
        color: "bg-indigo-500"
    },
    {
        title: "Monetize Every Part",
        description: "Turn your advice into income. Automatically link parts to Amazon, Summit Racing, and 50+ retailers. When people ask 'what wheels are those?', you get paid.",
        icon: DollarSign,
        image: "/moblap.png", // Placeholder
        color: "bg-green-500"
    },
    {
        title: "Asset-Grade Documentation",
        description: "Track service history, receipts, and mileage. When it's time to sell, transfer the entire digital profile to the new owner. Prove the value of your work.",
        icon: BarChart3,
        image: "/mac.png",
        color: "bg-amber-500"
    }
];



export function StickyFeatures() {
    const [activeCard, setActiveCard] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: ref,
        offset: ["start start", "end end"],
    });

    const cardLength = features.length;

    useMotionValueEvent(scrollYProgress, "change", (latest) => {
        const cardsBreakpoints = features.map((_, index) => index / cardLength);
        const closest = cardsBreakpoints.reduce((prev, curr) => {
            return (Math.abs(curr - latest) < Math.abs(prev - latest) ? curr : prev);
        });
        const index = cardsBreakpoints.indexOf(closest);
        setActiveCard(index);
    });

    return (
        <section ref={ref} className="relative bg-slate-950 min-h-[300vh]">
            {/* Background Gradients */}
            <div className="sticky top-0 h-screen w-full overflow-hidden pointer-events-none">
                <div className={cn(
                    "absolute inset-0 transition-colors duration-700 opacity-20",
                    features[activeCard].color.replace('bg-', 'bg-').replace('500', '900') // Darker background tint
                )} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px]" />
            </div>

            <div className="container relative mx-auto px-4 md:px-6 -mt-[300vh]">
                <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">

                    {/* LEFT: Scrolling Text Content */}
                    <div className="relative pt-32 pb-32">
                        <div className="space-y-32">
                            {features.map((feature, index) => (
                                <div key={index} className="min-h-[60vh] flex flex-col justify-center">
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.5, delay: 0.2 }}
                                        viewport={{ once: true, margin: "-20%" }}
                                        className={cn(
                                            "space-y-6 p-8 rounded-3xl border border-white/5 backdrop-blur-sm transition-all duration-500",
                                            activeCard === index ? "bg-white/5 border-white/10" : "opacity-30 blur-sm scale-95"
                                        )}
                                    >
                                        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", feature.color)}>
                                            <feature.icon className="w-6 h-6" />
                                        </div>
                                        <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">
                                            {feature.title}
                                        </h3>
                                        <p className="text-lg text-slate-400 leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <Button variant="link" className="text-white hover:text-blue-400 p-0 h-auto font-medium group">
                                            Learn more <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                                        </Button>
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: Sticky Visuals */}
                    <div className="hidden lg:block relative">
                        <div className="sticky top-0 h-screen flex items-center justify-center">
                            <div className="relative w-full aspect-square max-w-[600px] flex items-center justify-center">
                                {features.map((feature, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                                        animate={{
                                            opacity: activeCard === index ? 1 : 0,
                                            scale: activeCard === index ? 1 : 0.8,
                                            rotate: activeCard === index ? 0 : -10,
                                            zIndex: activeCard === index ? 10 : 0
                                        }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 flex items-center justify-center"
                                    >
                                        <img
                                            src={feature.image}
                                            alt={feature.title}
                                            className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            {/* Height Spacer matching the scroll container definition */}
            <div className="h-[50vh]" />
        </section>
    );
}
