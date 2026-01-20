import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Car, Squirrel, Home, Star, DollarSign, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion, useScroll, useTransform } from 'framer-motion' // Added hooks
import { cn, getDemoProfileUrl } from '@/lib/utils'
import { BorderBeam } from './effects/BorderBeam'; // Added BorderBeam

const wordVariants = {
    hidden: { y: "100%" },
    visible: (i: number) => ({
        y: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.8,
            ease: [0.2, 0.65, 0.3, 0.9] as [number, number, number, number], // Custom Bezier for "fluid" feel
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
        <>
            <main className="bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 overflow-x-hidden">
                <div
                    aria-hidden
                    className="z-[2] absolute inset-0 pointer-events-none isolate opacity-50 contain-strict hidden lg:block">
                    <div className="w-[35rem] h-[80rem] -translate-y-[350px] absolute left-0 top-0 -rotate-45 rounded-full bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(220,100%,85%,.08)_0,hsla(220,100%,55%,.02)_50%,hsla(220,100%,45%,0)_80%)] dark:bg-[radial-gradient(68.54%_68.72%_at_55.02%_31.46%,hsla(220,100%,25%,.08)_0,hsla(220,100%,15%,.02)_50%,hsla(220,100%,15%,0)_80%)]" />
                    <div className="h-[80rem] absolute left-0 top-0 w-56 -rotate-45 rounded-full bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,85%,.06)_0,hsla(220,100%,45%,.02)_80%,transparent_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,25%,.08)_0,hsla(220,100%,15%,.03)_80%,transparent_100%)] [translate:5%_-50%]" />
                    <div className="h-[80rem] -translate-y-[350px] absolute left-0 top-0 w-56 -rotate-45 bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,85%,.04)_0,hsla(220,100%,45%,.02)_80%,transparent_100%)] dark:bg-[radial-gradient(50%_50%_at_50%_50%,hsla(220,100%,25%,.06)_0,hsla(220,100%,15%,.02)_80%,transparent_100%)]" />
                </div>
                <section id="hero-section">
                    <div className="relative pt-24 md:pt-28 lg:pt-32">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                visible: {
                                    opacity: 1,
                                    y: 0,
                                    transition: {
                                        type: 'spring',
                                        bounce: 0.3,
                                        duration: 2,
                                        delay: 1
                                    }
                                }
                            }}
                            className="absolute inset-0 -z-20">
                            <img
                                src="/mac.png"
                                alt="CarFolio Dashboard Background"
                                className="absolute inset-x-0 top-56 -z-20 hidden lg:top-32 dark:block opacity-20"
                                width="3276"
                                height="4095"
                            />
                        </motion.div>
                        <div aria-hidden className="absolute inset-0 -z-10 size-full [background:radial-gradient(125%_125%_at_50%_100%,transparent_0%,var(--background)_75%)]" />
                        <div className="mx-auto max-w-7xl px-6">
                            <div className="text-center sm:mx-auto lg:mr-auto lg:mt-0">
                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={transitionVariants}>
                                    <Link
                                        to="/sign-up"
                                        className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-black/5 transition-all duration-300 dark:border-t-white/5 dark:shadow-zinc-950">
                                        <span className="text-foreground text-sm">The definitive platform for automotive creators</span>
                                        <span className="dark:border-background block h-4 w-0.5 border-l bg-white dark:bg-zinc-700"></span>

                                        <div className="bg-background group-hover:bg-muted size-6 overflow-hidden rounded-full duration-500">
                                            <div className="flex w-12 -translate-x-1/2 duration-500 ease-in-out group-hover:translate-x-0">
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                                <span className="flex size-6">
                                                    <ArrowRight className="m-auto size-3" />
                                                </span>
                                            </div>
                                        </div>
                                    </Link>

                                    <h1 className="mt-8 max-w-4xl mx-auto text-balance text-6xl md:text-7xl lg:mt-16 xl:text-[5.25rem] font-semibold text-slate-900 dark:text-white leading-tight">
                                        <SplitText>Your Masterpiece.</SplitText>
                                        <span className="block text-blue-600 dark:text-blue-400">
                                            <SplitText>Reimagined.</SplitText>
                                        </span>
                                    </h1>
                                    <motion.p
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8, duration: 1 }}
                                        className="mx-auto mt-8 max-w-2xl text-balance text-lg text-slate-600 dark:text-slate-300">
                                        CarFolio is the definitive platform for the automotive creator. A stunning digital garage designed to showcase your vehicles, share your story, and monetize your passion. All with a single link.
                                    </motion.p>
                                </motion.div>

                                <motion.div
                                    initial="hidden"
                                    animate="visible"
                                    variants={{
                                        hidden: {},
                                        visible: {
                                            transition: {
                                                staggerChildren: 0.05,
                                                delayChildren: 0.75,
                                            },
                                        },
                                    }}
                                    className="mt-12 flex flex-col items-center justify-center gap-2 md:flex-row">
                                    <motion.div
                                        key={1}
                                        variants={transitionVariants.item}
                                        className="relative rounded-[14px] border p-0.5 overflow-hidden">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="relative z-10 rounded-xl px-5 text-base bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
                                            <Link to="/sign-up">
                                                <span className="text-nowrap">Create Your Showcase</span>
                                                <ArrowRight className="ml-2 h-5 w-5" />
                                            </Link>
                                        </Button>
                                        <BorderBeam size={100} duration={8} delay={4} />
                                    </motion.div>
                                    <motion.div
                                        key={2}
                                        variants={transitionVariants.item}
                                        className="bg-foreground/5 rounded-[14px] border border-border/50 p-0.5 hover:border-border transition-colors">
                                        <Button
                                            asChild
                                            size="lg"
                                            variant="ghost"
                                            className="rounded-xl px-6 text-base font-medium hover:bg-slate-50 dark:hover:bg-slate-800/50 border-0">
                                            <Link to={getDemoProfileUrl()} className="flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <span className="text-nowrap">View Demo</span>
                                            </Link>
                                        </Button>
                                    </motion.div>
                                </motion.div>
                            </div>
                        </div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: {
                                        staggerChildren: 0.05,
                                        delayChildren: 0.75,
                                    },
                                },
                            }}>
                            <motion.div
                                variants={transitionVariants.item}
                                className="relative mt-8 sm:mt-12 md:mt-20 overflow-visible">
                                <div className="relative">
                                    <img
                                        className="w-full h-auto object-contain select-none pointer-events-none"
                                        src="/mac.png"
                                        alt="CarFolio Dashboard"
                                        width="2700"
                                        height="1440"
                                    />
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>
                </section>

            </main>
        </>
    )
}

