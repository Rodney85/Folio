import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function FinalCTA() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-background">
            <div className="mx-auto max-w-7xl px-6">
                <div className="relative rounded-[2.5rem] overflow-hidden neumorph-card border border-white/5 p-8 md:p-12 lg:p-16">
                    {/* Background Glow */}
                    <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-tr from-blue-900/10 via-transparent to-transparent opacity-50 pointer-events-none" />

                    <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.5 }}
                            >
                                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-wider mb-6">
                                    <Sparkles className="w-3 h-3" />
                                    Launch Access
                                </span>
                                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight text-white">
                                    Build Your <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">
                                        Legacy.
                                    </span>
                                </h2>
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.1, duration: 0.5 }}
                                className="text-lg text-slate-400 max-w-md leading-relaxed"
                            >
                                Your garage is more than just parking spot. It's a gallery of your journey.
                                Secure your username and start documenting your builds today.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2, duration: 0.5 }}
                                className="flex flex-col sm:flex-row gap-4"
                            >
                                <Button
                                    asChild
                                    size="lg"
                                    className="h-14 px-8 text-base bg-white text-black hover:bg-slate-200 rounded-full font-medium transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                                >
                                    <Link to="/sign-up">
                                        Start Your Garage
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    size="lg"
                                    variant="outline"
                                    className="h-14 px-8 text-base border-white/10 hover:bg-white/5 text-white rounded-full font-medium bg-transparent backdrop-blur-sm"
                                >
                                    <Link to="/pricing" className="flex items-center gap-2">
                                        View Membership
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </Link>
                                </Button>
                            </motion.div>
                        </div>

                        {/* Car Visual */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.3, duration: 0.7 }}
                            className="relative lg:h-[500px] rounded-2xl overflow-hidden perspective-1000 group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D12] via-transparent to-transparent z-10 opacity-80" />
                            <img
                                src="/🤙🏻.jpeg"
                                alt="CarFolio Garage"
                                className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                            />

                            {/* Floating UI Card Overlay */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                whileInView={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.5 }}
                                className="absolute bottom-6 left-6 right-6 z-20 neumorph-card rounded-xl p-4 border border-white/5 flex items-center gap-4 bg-[#0D0D12]/80 backdrop-blur-md"
                            >
                                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <TrophyIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">Top 1% Build</div>
                                    <div className="text-xs text-slate-400">Awarded to Early Owners</div>
                                </div>
                                <div className="ml-auto text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                    VERIFIED
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TrophyIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
            <path fillRule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 00-.584.859 6.753 6.753 0 006.138 5.6 6.73 6.73 0 002.743 1.346A6.707 6.707 0 019.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a2.25 2.25 0 00-2.25 2.25c0 .414.336.75.75.75h15a.75.75 0 00.75-.75 2.25 2.25 0 00-2.25-2.25h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.706 6.706 0 01-3.29-3.156 6.73 6.73 0 002.743-1.346 6.753 6.753 0 006.139-5.6.75.75 0 00-.585-.858 47.077 47.077 0 00-3.07-.543V2.62a.75.75 0 00-.658-.744 49.22 49.22 0 00-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 00-.657.744zm0 2.629c0 1.196.312 2.32.857 3.294A5.266 5.266 0 013.16 5.337a45.6 45.6 0 012.006-.348zm13.668 0c.346.048.691.1 1.036.155a64.53 64.53 0 01-2.006.35 5.261 5.261 0 01.97-3.642 5.239 5.239 0 01-.132 1.937v-.031c.219.034.437.069.654.104l-1.32.228zM15.75 16.875a.375.375 0 00-.375-.375h-7.5a.375.375 0 00-.375.375V19.5h7.5v-2.625z" clipRule="evenodd" />
        </svg>
    )
}
