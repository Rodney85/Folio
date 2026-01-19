import { Doc, Id } from "../../../convex/_generated/dataModel";
import ExploreCard from "./ExploreCard";
import { SectionTransition, AnimatedItem } from "@/components/ui/page-transition";

interface ExploreGridProps {
    cars: Array<{
        car: Doc<"cars">;
        owner: {
            _id: Id<"users">;
            username?: string;
            pictureUrl?: string;
            name: string;
        };
        isTrending?: boolean;
        score?: number;
    }>;
    isLoading?: boolean;
}

const ExploreGrid = ({ cars, isLoading }: ExploreGridProps) => {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                    <div
                        key={i}
                        className="aspect-square rounded-xl bg-slate-800/50 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (cars.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mb-4">
                    <svg
                        className="w-10 h-10 text-slate-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">No cars found</h3>
                <p className="text-slate-400 max-w-sm">
                    Try adjusting your search or filters to discover more builds.
                </p>
            </div>
        );
    }

    return (
        <SectionTransition className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
            {cars.map((item) => (
                <AnimatedItem key={item.car._id}>
                    <ExploreCard
                        car={item.car}
                        owner={item.owner}
                        isTrending={item.isTrending}
                    />
                </AnimatedItem>
            ))}
        </SectionTransition>
    );
};

export default ExploreGrid;
