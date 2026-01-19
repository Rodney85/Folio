import { Doc, Id } from "../../../convex/_generated/dataModel";
import { Car, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ExploreCardProps {
    car: Doc<"cars">;
    owner: {
        _id: Id<"users">;
        username?: string;
        pictureUrl?: string;
        name: string;
    };
    isTrending?: boolean;
    onClick?: () => void;
}

const ExploreCard = ({ car, owner, isTrending, onClick }: ExploreCardProps) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (owner.username) {
            navigate(`/u/${owner.username}/car/${car._id}`);
        }
    };

    return (
        <div
            className="group relative aspect-square overflow-hidden rounded-xl bg-slate-800/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/10"
            onClick={handleClick}
        >
            {/* Car Image */}
            {car.images && car.images.length > 0 ? (
                <img
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                    <Car className="h-12 w-12 text-slate-600" />
                </div>
            )}

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Trending Badge */}
            {isTrending && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full text-xs font-semibold text-white shadow-lg flex items-center gap-1">
                    <span>🔥</span>
                    <span>Trending</span>
                </div>
            )}

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                {/* Car Info */}
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-white text-sm truncate">
                            {car.year} {car.make} {car.model}
                        </h3>
                        {/* Owner Info */}
                        <div className="flex items-center gap-1.5 mt-1">
                            {owner.pictureUrl ? (
                                <img
                                    src={owner.pictureUrl}
                                    alt={owner.name}
                                    className="w-4 h-4 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
                                    <User className="h-2.5 w-2.5 text-slate-400" />
                                </div>
                            )}
                            <span className="text-xs text-slate-300 truncate">
                                @{owner.username || "user"}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Always visible car info (mobile-friendly) */}
            <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/90 to-transparent md:hidden">
                <p className="text-xs font-medium text-white truncate">
                    {car.make} {car.model}
                </p>
            </div>
        </div>
    );
};

export default ExploreCard;
