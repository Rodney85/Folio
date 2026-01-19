import { useState, useCallback, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ExploreGrid, ExploreSearch } from "@/components/explore";
import { Compass, TrendingUp, SlidersHorizontal, ChevronDown, Check } from "lucide-react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

const ExplorePage = () => {
    // Filter States
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedMake, setSelectedMake] = useState<string | null>(null);
    const [yearRange, setYearRange] = useState<[number, number]>([1990, 2025]);
    const [hpRange, setHpRange] = useState<[number, number]>([0, 1000]);
    const [showFilters, setShowFilters] = useState(false);

    // Queries
    // Filter Logic
    const isFiltering = !!(selectedMake || yearRange[0] > 1990 || yearRange[1] < 2025 || hpRange[0] > 0 || hpRange[1] < 1000);

    // Queries with Skip Logic
    const exploreFeed = useQuery(
        api.explore.getExploreFeed,
        !searchQuery && !isFiltering ? { limit: 50 } : "skip"
    );

    const filteredArgs = {
        make: selectedMake || undefined,
        minYear: yearRange[0],
        maxYear: yearRange[1],
        minHp: hpRange[0],
        maxHp: hpRange[1] === 1000 ? undefined : hpRange[1],
        limit: 50,
    };

    const filteredFeed = useQuery(
        api.explore.getFilteredExploreFeed,
        !searchQuery && isFiltering ? filteredArgs : "skip"
    );

    const trendingFeed = useQuery(api.explore.getTrendingCars, { limit: 10 });
    const popularMakes = useQuery(api.explore.getPopularMakes) || [];

    const searchResults = useQuery(
        api.explore.searchExplore,
        searchQuery ? { query: searchQuery, limit: 30 } : "skip"
    );



    const displayCars = useMemo(() => {
        if (searchQuery && searchResults) {
            return searchResults.cars.map(item => ({ ...item, isTrending: false }));
        }
        if (isFiltering && filteredFeed) {
            return filteredFeed.cars.map(item => ({ ...item, isTrending: false }));
        }
        return exploreFeed ? exploreFeed.cars : [];
    }, [searchQuery, searchResults, isFiltering, filteredFeed, exploreFeed]);

    const isLoading = (!displayCars.length && (
        (searchQuery && !searchResults) ||
        (isFiltering && !filteredFeed) ||
        (!searchQuery && !isFiltering && !exploreFeed)
    ));

    const handleSearch = useCallback((query: string) => setSearchQuery(query), []);

    return (
        <ResponsiveLayout>
            <div className="min-h-screen bg-transparent text-white pb-20">
                {/* Hero / Header Section */}
                <div className="sticky top-0 z-40 pt-6 pb-6 px-4 md:px-8 bg-[#020204] border-b border-white/5">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {/* Title & Trending Toggle */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/20">
                                    <Compass className="h-6 w-6 text-indigo-400" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                        Explore
                                    </h1>
                                    <p className="text-sm text-slate-400 hidden sm:block">
                                        Discover the community's finest builds
                                    </p>
                                </div>
                            </div>

                            {/* Search & Filter Controls */}
                            <div className="flex items-center gap-3 w-full md:w-auto">
                                <div className="flex-1 md:w-80">
                                    <ExploreSearch onSearch={handleSearch} />
                                </div>
                                <Popover open={showFilters} onOpenChange={setShowFilters}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={`border-slate-700 bg-slate-900/50 hover:bg-slate-800 text-slate-300 relative ${isFiltering ? 'border-indigo-500/50 text-indigo-400' : ''}`}
                                        >
                                            <SlidersHorizontal className="h-4 w-4 mr-2" />
                                            Filters
                                            {isFiltering && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                                                </span>
                                            )}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 bg-slate-900 border-slate-800 p-4 space-y-6 backdrop-blur-xl" align="end">
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-white">Filters</h3>
                                                {isFiltering && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-auto p-0 text-xs text-indigo-400 hover:text-indigo-300"
                                                        onClick={() => {
                                                            setSelectedMake(null);
                                                            setYearRange([1990, 2025]);
                                                            setHpRange([0, 1000]);
                                                        }}
                                                    >
                                                        Reset
                                                    </Button>
                                                )}
                                            </div>

                                            {/* Make Filter */}
                                            <div className="space-y-2">
                                                <Label className="text-xs text-slate-400 uppercase tracking-wider">Brand</Label>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-between bg-slate-800 border-slate-700 text-slate-300">
                                                            {selectedMake || "All Brands"}
                                                            <ChevronDown className="h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent className="w-56 max-h-64 overflow-y-auto bg-slate-900 border-slate-800">
                                                        <DropdownMenuItem onClick={() => setSelectedMake(null)} className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer">
                                                            All Brands
                                                            {!selectedMake && <Check className="ml-auto h-4 w-4" />}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-slate-800" />
                                                        {popularMakes.map((item: any) => (
                                                            <DropdownMenuItem
                                                                key={item.make}
                                                                onClick={() => setSelectedMake(item.make)}
                                                                className="text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer"
                                                            >
                                                                {item.make}
                                                                <span className="ml-auto text-xs text-slate-500">{item.count}</span>
                                                                {selectedMake === item.make && <Check className="ml-2 h-3 w-3 text-indigo-400" />}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>

                                            {/* Year Range */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs text-slate-400 uppercase tracking-wider">Year</Label>
                                                    <span className="text-xs font-mono text-indigo-400">{yearRange[0]} - {yearRange[1]}</span>
                                                </div>
                                                <Slider
                                                    defaultValue={[1990, 2025]}
                                                    min={1960}
                                                    max={2025}
                                                    step={1}
                                                    value={yearRange}
                                                    onValueChange={(val) => setYearRange(val as [number, number])}
                                                    className="py-2"
                                                />
                                            </div>

                                            {/* HP Range */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <Label className="text-xs text-slate-400 uppercase tracking-wider">Horsepower</Label>
                                                    <span className="text-xs font-mono text-indigo-400">{hpRange[0]} - {hpRange[1] === 1000 ? "1000+" : hpRange[1]} HP</span>
                                                </div>
                                                <Slider
                                                    defaultValue={[0, 1000]}
                                                    min={0}
                                                    max={1000}
                                                    step={50}
                                                    value={hpRange}
                                                    onValueChange={(val) => setHpRange(val as [number, number])}
                                                    className="py-2"
                                                />
                                            </div>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {isFiltering && (
                            <div className="flex flex-wrap gap-2">
                                {selectedMake && (
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer" onClick={() => setSelectedMake(null)}>
                                        {selectedMake} <span className="ml-1">×</span>
                                    </Badge>
                                )}
                                {(yearRange[0] > 1990 || yearRange[1] < 2025) && (
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer" onClick={() => setYearRange([1990, 2025])}>
                                        {yearRange[0]}-{yearRange[1]} <span className="ml-1">×</span>
                                    </Badge>
                                )}
                                {(hpRange[0] > 0 || hpRange[1] < 1000) && (
                                    <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-300 border-indigo-500/20 hover:bg-indigo-500/20 cursor-pointer" onClick={() => setHpRange([0, 1000])}>
                                        {hpRange[0]}-{hpRange[1] === 1000 ? "1000+" : hpRange[1]} HP <span className="ml-1">×</span>
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-12">
                    {/* Trending Section Removed per user request */}

                    {/* Main Feed */}
                    <section>
                        {/* Bento Grid Layout - Instagram Style (Images Only) */}
                        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 auto-rows-[1fr] gap-1 grid-flow-dense">
                            {displayCars.map((item, index) => {
                                // Create a visual pattern: every 7th item is large (2x2)
                                const isLarge = (index % 10 === 0) || (index % 10 === 7);

                                return (
                                    <motion.div
                                        key={item.car._id}
                                        layoutId={item.car._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        className={`relative group cursor-pointer overflow-hidden bg-slate-900 aspect-square ${isLarge ? 'col-span-2 row-span-2' : 'col-span-1 row-span-1'}`}
                                        onClick={() => window.location.href = `/u/${item.owner.username}/car/${item.car._id}`}
                                    >
                                        {item.car.images?.[0] ? (
                                            <img
                                                src={item.car.images[0]}
                                                alt={item.car.model}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                loading="lazy"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-slate-800">
                                                <span className="text-2xl opacity-20">No Image</span>
                                            </div>
                                        )}

                                        {/* Hover Overlay */}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                            <div className="flex items-center gap-1 text-white font-bold">
                                                <span className="text-sm">❤️</span>
                                                <span>{item.likes || 0}</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-white font-bold">
                                                <span className="text-sm">💬</span>
                                                <span>{item.comments || 0}</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {isLoading && (
                            <div className="text-center py-20 text-slate-500">
                                Loading awesome builds...
                            </div>
                        )}

                        {!isLoading && displayCars.length === 0 && (
                            <div className="text-center py-20 text-slate-500">
                                No cars found. Try adjusting your filters.
                            </div>
                        )}
                    </section>
                </div>
            </div>
        </ResponsiveLayout>
    );
};

export default ExplorePage;
