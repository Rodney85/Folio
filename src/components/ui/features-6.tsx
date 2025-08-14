import { Car, DollarSign, BarChart3, Share2, Settings, Trophy } from 'lucide-react'

export function Features() {
    return (
        <section className="py-16 md:py-32 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950">
            <div className="mx-auto max-w-5xl space-y-12 px-6">
                <div className="relative z-10 grid items-center gap-4 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-semibold">Everything You Need to Showcase and Monetize Your Builds</h2>
                    <p className="max-w-sm sm:ml-auto">Transform your automotive passion into a professional showcase that drives engagement and generates revenue through every recommendation.</p>
                </div>
                <div className="relative rounded-3xl p-3 md:-mx-8 lg:col-span-3">
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
                </div>
                <div className="relative mx-auto grid grid-cols-1 gap-x-3 gap-y-6 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Car className="size-4 text-blue-600" />
                            <h3 className="text-sm font-medium">Professional Car Showcases</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">High-resolution photo galleries with professional layouts, detailed specs, and modification timelines.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Share2 className="size-4 text-blue-600" />
                            <h3 className="text-sm font-medium">Organized Parts Integration</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Clean, categorized parts lists with direct affiliate links to major automotive retailers.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="size-4 text-blue-600" />
                            <h3 className="text-sm font-medium">Advanced Analytics Dashboard</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Track which parts generate interest, monitor affiliate performance, and optimize content.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <DollarSign className="size-4 text-blue-600" />
                            <h3 className="text-sm font-medium">Multiple Revenue Streams</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Amazon Associates, Summit Racing, FCP Euro, Tire Rack, and 50+ automotive retailers.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Settings className="size-4 text-blue-600" />
                            <h3 className="text-sm font-medium">Multi-Vehicle Management</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Showcase your entire garage with unlimited car profiles and separate analytics.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Trophy className="size-4 text-blue-600" />
                            <h3 className="text-sm font-medium">Professional Customization</h3>
                        </div>
                        <p className="text-muted-foreground text-sm">Multiple templates, custom branding, and white-label options for businesses.</p>
                    </div>
                </div>
            </div>
        </section>
    )
}
