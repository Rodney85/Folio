import { cn } from "@/lib/utils";

interface FilterOption {
    id: string;
    label: string;
    icon?: string;
}

interface ExploreFiltersProps {
    activeFilter: string;
    onFilterChange: (filter: string) => void;
    className?: string;
}

const filters: FilterOption[] = [
    { id: "all", label: "All", icon: "🌎" },
    { id: "trending", label: "Trending", icon: "🔥" },
    { id: "jdm", label: "JDM", icon: "🇯🇵" },
    { id: "european", label: "European", icon: "🇪🇺" },
    { id: "american", label: "American", icon: "🇺🇸" },
];

const ExploreFilters = ({
    activeFilter,
    onFilterChange,
    className,
}: ExploreFiltersProps) => {
    return (
        <div className={cn("w-full overflow-x-auto scrollbar-hide", className)}>
            <div className="flex gap-2 pb-2 min-w-max px-1">
                {filters.map((filter) => (
                    <button
                        key={filter.id}
                        onClick={() => onFilterChange(filter.id)}
                        className={cn(
                            "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                            "flex items-center gap-1.5 whitespace-nowrap",
                            activeFilter === filter.id
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white"
                        )}
                    >
                        {filter.icon && <span className="text-base">{filter.icon}</span>}
                        <span>{filter.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ExploreFilters;
