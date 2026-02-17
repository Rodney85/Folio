import { Car, DollarSign, BarChart3, Link2, Compass, Wrench } from 'lucide-react'
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
            className={`card-premium group relative overflow-hidden ${className}`}
            onMouseMove={handleMouseMove}
        >
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 will-change-[opacity]"
                style={{
                    background: useMotionTemplate`
            radial-gradient(
              650px circle at ${mouseX}px ${mouseY}px,
              rgba(255, 255, 255, 0.1),
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
        <section className="py-16 md:py-32 relative overflow-hidden" style={{ backgroundColor: '#0f172a' }}>
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="mx-auto max-w-5xl space-y-12 px-6 relative z-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12"
                >
                    <h2 className="text-4xl font-semibold text-foreground">Built for Car Enthusiasts, Not Content Creators</h2>
                    <p className="max-w-sm sm:ml-auto text-muted-foreground">Your builds deserve more than an Instagram caption. CarFolio gives you a permanent home for every car, every mod, and every detail.</p>
                </motion.div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.2 }}
                    className="relative rounded-3xl p-3 md:-mx-8 lg:col-span-3"
                >
                    <div className="relative group">
                        {/* Desktop/Tablet Image */}
                        <img
                            src="/mobile-laptopview.png"
                            className="w-full h-auto object-contain rounded-2xl hidden md:block relative z-0"
                            alt="CarFolio dashboard preview"
                            loading="lazy"
                        />
                        {/* Mobile Image */}
                        <div className="md:hidden flex items-center justify-center relative z-0">
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
                        { icon: Car, title: "Your Garage", desc: "Add your cars with full specs — make, model, year, engine, drivetrain, colors, power figures. Start with 3 slots free, go unlimited with Pro." },
                        { icon: DollarSign, title: "Shoppable Builds", desc: "Tag every mod with a buy link. When someone asks 'what wheels are those?' and buys through your link, you earn commission." },
                        { icon: Link2, title: "One Link Profile", desc: "Your entire build lives at carfolio.cc/you. One link in your bio, every car and mod instantly accessible to anyone." },
                        { icon: Wrench, title: "Mod Documentation", desc: "Structured parts lists with categories, prices, and photos. No more repeating yourself in DMs — just send your CarFolio." },
                        { icon: Compass, title: "Explore Feed", desc: "Browse builds from the community. Find inspiration, discover parts, and get your own builds seen by other enthusiasts." },
                        { icon: BarChart3, title: "Build Analytics", desc: "See who's viewing your profile, which cars get the most attention, and what parts people are clicking on." }
                    ].map((feature, i) => (
                        <SpotlightCard key={i} className="p-6">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
                                        <feature.icon className="size-5 text-primary" />
                                    </div>
                                    <h3 className="text-sm font-semibold text-foreground">{feature.title}</h3>
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
