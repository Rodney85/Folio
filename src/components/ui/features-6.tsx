import { Car, DollarSign, BarChart3, Share2, Settings, Trophy } from 'lucide-react'
import { useState, useRef, useEffect } from 'react';
import React from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';

function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        const { left, top } = currentTarget.getBoundingClientRect();
        mouseX.set(clientX - left);
        mouseY.set(clientY - top);
    }

    return (
        <div
            className={`group relative border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 overflow-hidden rounded-xl ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 will-change-[opacity]"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(59, 130, 246, 0.15),
              transparent 80%
            )
          `,
                }}
            />
            <div className="relative h-full">{children}</div>
        </div>
    );
}

export function Features() {
    return (
        <section className="py-16 md:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
            <div className="mx-auto max-w-5xl space-y-12 px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12"
                >
                    <h2 className="text-4xl font-semibold">Everything You Need to Showcase and Monetize Your Builds</h2>
                    <p className="max-w-sm sm:ml-auto">Transform your automotive passion into a professional showcase that drives engagement and generates revenue through every recommendation.</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative rounded-3xl p-3 md:-mx-8 lg:col-span-3"
                >
                    <div className="relative">
                        <div className="bg-gradient-to-t z-1 from-background/30 absolute inset-0 to-transparent"></div>
                        {/* Desktop/Tablet Image */}
                        <img
                            src="/moblap.png"
                            className="w-full h-auto object-contain rounded-2xl hidden md:block"
                            alt="CarFolio dashboard preview"
                            loading="lazy"
                        />
                        {/* Mobile Image */}
                        <div className="md:hidden flex items-center justify-center">
                            <img
                                src="/iPhone 13 Pro - Graphite - Portrait.png"
                                className="max-w-xs w-full h-auto object-contain mx-auto"
                                alt="CarFolio mobile app preview"
                                loading="lazy"
                            />
                        </div>
                    </div>
                </motion.div>
                <div className="relative mx-auto grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {[
                        { icon: Car, title: "Professional Car Showcases", desc: "High-resolution photo galleries with professional layouts, detailed specs, and modification timelines." },
                        { icon: Share2, title: "Organized Parts Integration", desc: "Clean, categorized parts lists with direct affiliate links to major automotive retailers." },
                        { icon: BarChart3, title: "Advanced Analytics Dashboard", desc: "Track which parts generate interest, monitor affiliate performance, and optimize content." },
                        { icon: DollarSign, title: "Multiple Revenue Streams", desc: "Amazon Associates, Summit Racing, FCP Euro, Tire Rack, and 50+ automotive retailers." },
                        { icon: Settings, title: "Multi-Vehicle Management", desc: "Showcase your entire garage with unlimited car profiles and separate analytics." },
                        { icon: Trophy, title: "Professional Customization", desc: "Multiple templates, custom branding, and white-label options for businesses." }
                    ].map((feature, i) => (
                        <SpotlightCard key={i} className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                        <feature.icon className="size-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{feature.title}</h3>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                            </div>
                        </SpotlightCard>
                    ))}
                </div>
            </div>
        </section>
    )
}
