import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
        },
    },
};

const cardVariants = {
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

export default function Testimonials() {
    return (
        <section className="py-16 md:py-32 relative" style={{ backgroundColor: '#fefae0' }}>
            {/* Dark dots on yellow background */}
            <div
                className={cn(
                    "absolute inset-0",
                    "[background-size:20px_20px]",
                    "[background-image:radial-gradient(#333333_1px,transparent_1px)]",
                )}
            />

            <div className="mx-auto max-w-5xl space-y-12 px-6 relative z-10">
                <div className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12">
                    <div className="relative">
                        {/* Large irregular blob background for text with animation */}
                        <div className="absolute -inset-8 opacity-25">
                            <svg viewBox="0 0 400 300" className="w-full h-full">
                                <path fill="#ffc300" transform="translate(200 150)">
                                    <animate
                                        attributeName="d"
                                        dur="8s"
                                        repeatCount="indefinite"
                                        values="M89.2,-142.8C115.8,-128.4,136.8,-103.2,151.6,-74.8C166.4,-46.4,174.9,-14.8,176.2,18.1C177.5,51,171.6,85.2,155.4,112.6C139.2,140,112.7,160.6,82.1,172.8C51.5,185,16.8,188.8,-19.2,184.4C-55.2,180,-92.5,167.4,-121.8,145.2C-151.1,123,-172.4,91.2,-185.6,55.8C-198.8,20.4,-203.9,-18.6,-196.2,-54.8C-188.5,-91,-168,-124.4,-139.8,-138.2C-111.6,-152,-75.7,-146.2,-42.1,-142.6C-8.5,-139,22.8,-137.6,54.6,-131.4C86.4,-125.2,118.7,-114.2,89.2,-142.8Z;
                                        M95.4,-148.2C122.6,-135.8,142.4,-112.2,156.8,-84.6C171.2,-57,180.2,-25.4,181.8,7.2C183.4,39.8,177.6,73.4,162.2,101.8C146.8,130.2,121.8,153.4,91.2,167.6C60.6,181.8,24.4,187,-14.8,183.2C-54,179.4,-96.2,166.6,-128.4,144.8C-160.6,123,-182.8,92.2,-194.2,57.6C-205.6,23,-206.2,-15.4,-196.8,-51.2C-187.4,-87,-168,-120.2,-140.2,-132.6C-112.4,-145,-76.2,-136.6,-42.8,-139.8C-9.4,-143,21.2,-157.8,52.6,-154.4C84,-151,116.2,-129.4,95.4,-148.2Z;
                                        M78.6,-125.4C102.8,-114.2,124.2,-95.8,138.4,-72.6C152.6,-49.4,159.6,-21.4,161.2,8.2C162.8,37.8,159,69,146.8,95.6C134.6,122.2,114,144.2,87.8,157.4C61.6,170.6,29.8,175,-4.2,172.2C-38.2,169.4,-74.4,159.4,-103.2,142.8C-132,126.2,-153.4,103,-166.8,75.8C-180.2,48.6,-185.6,17.4,-184.4,-14.6C-183.2,-46.6,-175.4,-79.4,-158.2,-104.6C-141,-129.8,-114.4,-147.4,-85.8,-155.2C-57.2,-163,-26.6,-161,6.2,-154.8C39,-148.6,54.4,-136.6,78.6,-125.4Z;
                                        M89.2,-142.8C115.8,-128.4,136.8,-103.2,151.6,-74.8C166.4,-46.4,174.9,-14.8,176.2,18.1C177.5,51,171.6,85.2,155.4,112.6C139.2,140,112.7,160.6,82.1,172.8C51.5,185,16.8,188.8,-19.2,184.4C-55.2,180,-92.5,167.4,-121.8,145.2C-151.1,123,-172.4,91.2,-185.6,55.8C-198.8,20.4,-203.9,-18.6,-196.2,-54.8C-188.5,-91,-168,-124.4,-139.8,-138.2C-111.6,-152,-75.7,-146.2,-42.1,-142.6C-8.5,-139,22.8,-137.6,54.6,-131.4C86.4,-125.2,118.7,-114.2,89.2,-142.8Z"
                                    />
                                </path>
                            </svg>
                        </div>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5 }}
                        >
                            <p className="max-w-sm text-slate-900 relative z-10 py-4">CarFolio is transforming how automotive creators showcase their builds and connect with their community. From weekend warriors to professional builders, see what they're saying.</p>
                        </motion.div>
                    </div>
                    <motion.h2
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="text-4xl font-semibold text-slate-900 sm:ml-auto"
                    >
                        Loved by Car Enthusiasts Worldwide
                    </motion.h2>
                </div>

                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-rows-2"
                >
                    <motion.div variants={cardVariants} whileHover="hover" className="sm:col-span-2 lg:row-span-2 h-full">
                        <Card className="grid h-full grid-rows-[auto_1fr] gap-8 sm:col-span-2 sm:p-6 lg:row-span-2 hover:shadow-lg transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex items-center gap-2">
                                    <div className="h-6 w-8 bg-blue-600 rounded flex items-center justify-center">
                                        <span className="text-white text-xs font-bold">CF</span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">CarFolio</span>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                    <p className="text-xl font-medium">"CarFolio completely changed how I showcase my builds. Instead of scattered posts across different platforms, I now have one professional link that tells my complete story. My engagement has tripled, and I'm actually making money from my recommendations now."</p>

                                    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                        <Avatar className="size-12">
                                            <AvatarImage
                                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face"
                                                alt="Marcus Rodriguez"
                                                height="400"
                                                width="400"
                                                loading="lazy"
                                            />
                                            <AvatarFallback>MR</AvatarFallback>
                                        </Avatar>

                                        <div>
                                            <cite className="text-sm font-medium">Marcus Rodriguez</cite>
                                            <span className="text-muted-foreground block text-sm">JDM Builder & Content Creator</span>
                                        </div>
                                    </div>
                                </blockquote>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants} whileHover="hover" className="md:col-span-2 h-full">
                        <Card className="md:col-span-2 hover:shadow-lg transition-shadow duration-300 h-full">
                            <CardContent className="h-full pt-6">
                                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                    <p className="text-xl font-medium">"As a shop owner, CarFolio helps me showcase our work professionally. Clients love seeing our builds in one place, and the analytics help me understand what resonates with our audience."</p>

                                    <div className="grid grid-cols-[auto_1fr] items-center gap-3">
                                        <Avatar className="size-12">
                                            <AvatarImage
                                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face"
                                                alt="Sarah Chen"
                                                height="400"
                                                width="400"
                                                loading="lazy"
                                            />
                                            <AvatarFallback>SC</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <cite className="text-sm font-medium">Sarah Chen</cite>
                                            <span className="text-muted-foreground block text-sm">Owner, Precision Motorsports</span>
                                        </div>
                                    </div>
                                </blockquote>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants} whileHover="hover" className="h-full">
                        <Card className="hover:shadow-lg transition-shadow duration-300 h-full">
                            <CardContent className="h-full pt-6">
                                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                    <p>"Finally, a platform that gets car culture. My Euro build portfolio looks incredible, and the community engagement is off the charts!"</p>

                                    <div className="grid items-center gap-3 [grid-template-columns:auto_1fr]">
                                        <Avatar className="size-12">
                                            <AvatarImage
                                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face"
                                                alt="Alex Thompson"
                                                height="400"
                                                width="400"
                                                loading="lazy"
                                            />
                                            <AvatarFallback>AT</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <cite className="text-sm font-medium">Alex Thompson</cite>
                                            <span className="text-muted-foreground block text-sm">Euro Enthusiast</span>
                                        </div>
                                    </div>
                                </blockquote>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div variants={cardVariants} whileHover="hover" className="h-full">
                        <Card className="card variant-mixed hover:shadow-lg transition-shadow duration-300 h-full">
                            <CardContent className="h-full pt-6">
                                <blockquote className="grid h-full grid-rows-[1fr_auto] gap-6">
                                    <p>"CarFolio made it so easy to share my truck build journey. The before/after comparisons and progress tracking features are game-changers."</p>

                                    <div className="grid grid-cols-[auto_1fr] gap-3">
                                        <Avatar className="size-12">
                                            <AvatarImage
                                                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face"
                                                alt="Jake Miller"
                                                height="400"
                                                width="400"
                                                loading="lazy"
                                            />
                                            <AvatarFallback>JM</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm font-medium">Jake Miller</p>
                                            <span className="text-muted-foreground block text-sm">Off-Road Builder</span>
                                        </div>
                                    </div>
                                </blockquote>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    )
}
