import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Share, Menu, Youtube, Instagram, Video } from "lucide-react";
import MobileLayout from "@/components/layout/MobileLayout";

const ProfilePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  // Mock car images for the gallery using reliable static URLs
  const [carImages] = useState([
    "https://images.unsplash.com/photo-1525609004556-c46c7d6cf023?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1535732820275-9ffd998cac22?w=300&h=300&fit=crop&q=80", // Replaced problematic image
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1553440569-bcc63803a83d?w=300&h=300&fit=crop&q=80",
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=300&h=300&fit=crop&q=80", // Replaced problematic image
    "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=300&h=300&fit=crop&q=80",
  ]);
  
  // This will later be replaced with actual user car data from Convex
  // Number of cars will determine grid size dynamically

  return (
    <MobileLayout>
      <div className="flex flex-col min-h-screen bg-slate-900 text-white">
        {/* Top bar */}
        <div className="flex justify-between items-center p-4">
          <Share className="text-white" />
          <Menu className="text-white" onClick={() => navigate('/profile/menu')} />
        </div>

        {/* Profile header */}
        <div className="flex flex-col items-center pt-4 px-6">
          <div className="relative">
            <img 
              src={user?.imageUrl || "https://via.placeholder.com/100"} 
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover"
            />
            <button 
              onClick={() => navigate('/profile/edit')}
              className="absolute right-0 bottom-0 bg-muted text-muted-foreground px-3 py-1 text-xs rounded-md"
            >
              Edit
            </button>
          </div>

          <h2 className="font-bold mt-3 text-lg">@{user?.username || user?.firstName?.toLowerCase() || "itsrod"}</h2>
          <p className="text-center text-sm text-muted-foreground mt-1">
            {user?.publicMetadata?.bio as string || "I don't wanna end up like Muqtada\nLive in the moment"}
          </p>

          {/* Social media links */}
          <div className="flex space-x-4 mt-4">
            <a href="#" className="p-1">
              <Youtube size={20} />
            </a>
            <a href="#" className="p-1">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-1">
              <Video size={20} />
            </a>
          </div>
        </div>

        {/* Car gallery - Instagram style with responsive grid */}
        <div className="w-full px-[14px] mt-6">
          <div className="grid grid-cols-3 gap-[1px] w-full">
            {carImages.map((image, index) => (
              <div key={index} className="relative pb-[100%] w-full overflow-hidden">
                <img 
                  src={image} 
                  alt={`Car ${index + 1}`} 
                  className="absolute inset-0 w-full h-full object-cover rounded-[5px]"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback for images that fail to load
                    e.currentTarget.src = "https://via.placeholder.com/300?text=Car";
                  }}
                />
              </div>
            ))}
            {/* Grid will dynamically grow/shrink based on number of cars */}
            {carImages.length === 0 && (
              <div className="col-span-3 py-10 text-center text-gray-400">
                <p>No cars added yet</p>
                <p className="text-sm">Add your first car to start building your collection</p>
              </div>
            )}
          </div>
        </div>

        {/* No floating action buttons - using only the bottom navigation */}
      </div>
    </MobileLayout>
  );
};

export default ProfilePage;
