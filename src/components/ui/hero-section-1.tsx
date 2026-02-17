import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Car, Squirrel, Home, Star, DollarSign, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { cn, getDemoProfileUrl } from '@/lib/utils'
import { BorderBeam } from './effects/BorderBeam';

const wordVariants = {
    hidden: { y: "100%" },
    visible: (i: number) => ({
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.8,
            ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number],
        },
    }),
};

// Helper for SplitText
const SplitText = ({ children, className }: { children: React.ReactNode; className?: string }) => {
    const text = String(children);
    const words = text.split(" ");
    return (
        <span className={cn("inline-block overflow-hidden", className)}>
            {words.map((word, i) => (
                <span key={i} className="inline-block overflow-hidden mr-[0.2em] -mb-[0.1em] py-[0.1em]">
                    <motion.span
                        custom={i}
                        variants={wordVariants}
                        initial="hidden"
                        animate="visible"
                        className="inline-block"
                    >
                        {word}
                    </motion.span>
                </span>
            ))}
        </span>
    );
};

const transitionVariants = {
    item: {
        hidden: {
            opacity: 0,
            filter: 'blur(12px)',
            y: 12,
        },
        visible: {
            opacity: 1,
            filter: 'blur(0px)',
            y: 0,
            transition: {
                type: 'spring' as const,
                bounce: 0.3,
                duration: 1.5,
            },
        },
    },
}

export function HeroSection() {
    return (
        <section id="hero-section" className="relative w-full overflow-hidden pt-32 pb-16 md:pt-48 md:pb-32 min-h-screen flex flex-col items-center" style={{ backgroundColor: '#0f172a' }}>

            <div className="container relative z-10 mx-auto px-4 md:px-6">
                <div className="grid gap-12 lg:grid-cols-1 lg:gap-8 items-center text-center">
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-sm font-medium text-blue-600 dark:text-blue-400 backdrop-blur-sm"
                        >
                            <span className="flex h-2 w-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                            The Portfolio for Car Enthusiasts
                        </motion.div>

                        <div className="space-y-4">
                            <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-semibold text-foreground dark:text-white leading-tight">
                                <SplitText>Respect Your Build.</SplitText>
                                <span className="block text-blue-600 dark:text-blue-400">
                                    <SplitText>Share Your Story.</SplitText>
                                </span>
                            </h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="mx-auto mt-8 max-w-2xl text-balance text-lg text-slate-600 dark:text-slate-300">
                                Your build is more than a car — it's a statement. Create a stunning portfolio, document every modification, and monetize your expertise with affiliate links. All in one professional link.
                            </motion.p>
                        </div>

                        <div className="flex flex-col items-center gap-4">
                            <motion.div
                                key={1}
                                variants={transitionVariants.item}
                                className="relative w-full md:w-auto mt-12"
                            >
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full">
                                    <Button
                                        asChild
                                        size="lg"
                                        className="w-full sm:w-auto bg-white text-black hover:bg-slate-200 text-lg h-14 px-8 rounded-full font-medium transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]"
                                    >
                                        <Link to="/sign-up">
                                            Start Your Garage
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Link>
                                    </Button>
                                    <Button
                                        asChild
                                        size="lg"
                                        variant="outline"
                                        className="w-full sm:w-auto neumorph-button text-slate-300 hover:text-white text-lg h-14 px-8 rounded-full"
                                    >
                                        <Link to={getDemoProfileUrl()}>
                                            View Demo
                                        </Link>
                                    </Button>
                                </div>

                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 1.2, duration: 0.8 }}
                                    className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 dark:text-slate-400"
                                >
                                    <div className="flex items-center gap-1.5">
                                        <div className="flex -space-x-2">
                                            <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] text-white font-bold">OG</div>
                                        </div>
                                        <span className="font-medium text-foreground">Accepting Founding Members</span>
                                    </div>
                                    <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                                    <div className="flex items-center gap-1">
                                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                        <span className="ml-1 font-medium">Lifetime Access Available</span>
                                    </div>
                                    <span className="hidden sm:inline text-slate-300 dark:text-slate-600">•</span>
                                    <span>Secure your username today</span>
                                </motion.div>
                            </motion.div>
                        </div>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1, duration: 1 }}
                    className="relative mt-12 mx-auto max-w-[1400px] w-full"
                >
                    <img
                        src="/mac.png"
                        alt="CarFolio Dashboard"
                        className="w-full h-auto object-contain"
                    />
                </motion.div>
            </div>
        </section>
    );
}
