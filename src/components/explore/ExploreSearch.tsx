import { useState, useCallback, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExploreSearchProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    className?: string;
}

const ExploreSearch = ({
    onSearch,
    placeholder = "Search cars, makes, models...",
    className,
}: ExploreSearchProps) => {
    const [query, setQuery] = useState("");
    const [isFocused, setIsFocused] = useState(false);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearch(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, onSearch]);

    const handleClear = useCallback(() => {
        setQuery("");
        onSearch("");
    }, [onSearch]);

    return (
        <div
            className={cn(
                "relative flex items-center transition-all duration-200",
                isFocused
                    ? "ring-2 ring-primary/50 shadow-lg shadow-primary/10"
                    : "ring-1 ring-slate-700",
                "rounded-xl bg-slate-800/50 backdrop-blur-sm",
                className
            )}
        >
            <Search
                className={cn(
                    "absolute left-3 h-5 w-5 transition-colors",
                    isFocused ? "text-primary" : "text-slate-400"
                )}
            />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={placeholder}
                className="w-full bg-transparent py-3 pl-10 pr-10 text-sm text-white placeholder:text-slate-500 focus:outline-none"
            />
            {query && (
                <button
                    onClick={handleClear}
                    className="absolute right-3 p-1 rounded-full hover:bg-slate-700/50 transition-colors"
                >
                    <X className="h-4 w-4 text-slate-400" />
                </button>
            )}
        </div>
    );
};

export default ExploreSearch;
