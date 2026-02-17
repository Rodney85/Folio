import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { motion, type Variants } from 'framer-motion';
import { Target, Trophy, Clock, Users } from 'lucide-react';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut",
        },
    },
    hover: {
        y: -5,
        transition: {
            duration: 0.2,
        }
    }
};

export default function VisionSection() {
    return (
        <section className="py-24 md:py-32 relative overflow-hidden bg-background">
            {/* Dark Mode Dots Pattern */}
            <div
                className={cn(
                    "absolute inset-0 z-0",
                    "[background-size:20px_20px]",
                    "[background-image:radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)]",
                    "[mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]"
                )}
            />

            <div className="mx-auto max-w-6xl space-y-16 px-6 relative z-10">
                <div className="text-center space-y-6 max-w-3xl mx-auto">
                    <Badge variant="outline" className="w-fit mx-auto px-4 py-1 text-sm border-primary/20 text-primary bg-primary/5 backdrop-blur-sm">
                        Early Access
                    </Badge>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl md:text-5xl font-heading font-bold text-foreground"
                    >
                        Be a Founding Member
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-lg text-muted-foreground leading-relaxed"
                    >
                        We're building the portfolio standard for true enthusiasts.
                        Join the first <span className="text-foreground font-semibold">100 members</span> defining the future of automotive showcasing.
                    </motion.p>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-6 md:grid-cols-3"
                >
                    <motion.div variants={cardVariants} whileHover="hover" className="h-full">
                        <div className="h-full card-premium p-6">
                            <div className="size-12 rounded-lg bg-primary/10 flex items-center justify-center mb-6">
                                <Target className="size-6 text-primary" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-foreground">The Vision</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                Car enthusiasts spend thousands on builds but share them on platforms designed for selfies.
                                CarFolio is built to <strong className="text-foreground">respect the build</strong> using asset-grade presentation.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div variants={cardVariants} whileHover="hover" className="h-full">
                        <div className="h-full card-premium p-6">
                            <div className="size-12 rounded-lg bg-indigo-500/10 flex items-center justify-center mb-6">
                                <Trophy className="size-6 text-indigo-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-foreground">The Promise</h3>
                            <p className="text-muted-foreground leading-relaxed">
                                No algorithms. No fleeting stories. Just a professional, permanent record of your work.
                                Showcase your mods, track your value, and <strong className="text-foreground">tell your story</strong>.
                            </p>
                        </div>
                    </motion.div>

                    <motion.div variants={cardVariants} whileHover="hover" className="h-full">
                        <div className="h-full card-premium p-6 relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                            <div className="relative z-10">
                                <div className="size-12 rounded-lg bg-amber-500/10 flex items-center justify-center mb-6">
                                    <Users className="size-6 text-amber-400" />
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-foreground">The Offer</h3>
                                <p className="text-muted-foreground leading-relaxed">
                                    Lock in <strong className="text-foreground">'OG' status</strong>. Lifetime access to premium features for our early supporters.
                                    Help shape the roadmap and get priority feature requests.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
