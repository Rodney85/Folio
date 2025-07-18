import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Share, Menu, Car, Plus, Loader, GripHorizontal, Sparkles, HelpCircle } from "lucide-react";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import MobileLayout from "@/components/layout/MobileLayout";
import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import CarImageWithUrl from "@/components/cars/CarImageWithUrl";
import ShareModal from "@/components/ShareModal";
import DraggableCarGrid from "@/components/cars/DraggableCarGrid";

const ProfilePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const isMobile = useMediaQuery("(max-width: 767px)");
  
  // Get user's cars from Convex
  // @ts-ignore - Suppressing TypeScript errors for deep instantiation
  const userCars = useQuery(api.cars.getUserCars) || [];
  // @ts-ignore - Suppressing TypeScript errors for deep instantiation
  const firstCar = useQuery(api.cars.getUserFirstCar);
  
  // Get user profile data from Convex
  // @ts-ignore - Suppressing TypeScript errors for deep instantiation
  const profile = useQuery(api.users.getProfile);
  // @ts-ignore - Suppressing TypeScript errors for deep instantiation
  const isProfileComplete = useQuery(api.users.isProfileComplete);
  
  // Define the profile URL for QR code - using public profile URL format
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/u/${profile?.username || user?.firstName?.toLowerCase() || "itsrod"}`;
  
  const handleCarClick = (car) => {
    navigate(`/car/${car._id}`);
  };
  
  const loading = userCars === undefined;

  // Create profile content for both layouts
  const profileContent = (
    <div className={`flex flex-col bg-slate-900 text-white min-h-screen ${!isMobile ? 'p-6' : 'pb-0'}`}>
      {/* Top bar - Only visible on mobile */}
      {isMobile && (
        <div className="flex justify-between items-center p-4 pb-2">
          <Share className="text-white" onClick={() => setShareModalOpen(true)} />
          <Menu className="text-white" onClick={() => navigate('/profile/menu')} />
        </div>
      )}
      
      {/* Profile header */}
      <div className="flex flex-col items-center px-6 pb-4">
        <div className="relative">
          <img 
            src={user?.imageUrl || "https://via.placeholder.com/100"} 
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
          />
          <button 
            onClick={() => navigate('/profile/edit')}
            className="absolute right-0 bottom-0 bg-muted text-muted-foreground px-3 py-1 text-xs rounded-md"
          >
            Edit
          </button>
        </div>

        <h2 className="font-bold mt-6 text-xl">@{profile?.username || user?.firstName?.toLowerCase() || "itsrod"}</h2>
        <p className="text-center text-sm text-muted-foreground mt-4 mb-6 max-w-xs whitespace-pre-wrap">
          {profile?.bio ? (
            <span className="whitespace-pre-wrap">{profile.bio}</span>
          ) : (
            "I don't wanna end up like Muqtada\nLive in the moment"
          )}
        </p>

        {/* Social media links */}
        <div className="flex space-x-8 mb-6">
          {/* Instagram Icon */}
          <a 
            href={profile?.instagram ? `https://instagram.com/${profile.instagram}` : "#"} 
            target={profile?.instagram ? "_blank" : "_self"}
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!profile?.instagram) {
                e.preventDefault();
                toast("Instagram not configured", {
                  description: "Configure your Instagram link in your profile settings."
                });
              }
            }}
          >
            <FontAwesomeIcon 
              icon={faInstagram} 
              className={`h-6 w-6 ${profile?.instagram ? 'text-pink-500 hover:text-pink-600' : 'text-gray-400 hover:text-gray-500'}`} 
            />
          </a>
          
          {/* TikTok Icon */}
          <a 
            href={profile?.tiktok ? `https://tiktok.com/@${profile.tiktok}` : "#"} 
            target={profile?.tiktok ? "_blank" : "_self"}
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!profile?.tiktok) {
                e.preventDefault();
                toast("TikTok not configured", {
                  description: "Configure your TikTok link in your profile settings."
                });
              }
            }}
          >
            <FontAwesomeIcon 
              icon={faTiktok} 
              className={`h-6 w-6 ${profile?.tiktok ? 'text-black hover:text-gray-800' : 'text-gray-400 hover:text-gray-500'}`} 
            />
          </a>
          
          {/* YouTube Icon */}
          <a 
            href={profile?.youtube ? `https://youtube.com/${profile.youtube}` : "#"} 
            target={profile?.youtube ? "_blank" : "_self"}
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!profile?.youtube) {
                e.preventDefault();
                toast("YouTube not configured", {
                  description: "Configure your YouTube link in your profile settings."
                });
              }
            }}
          >
            <FontAwesomeIcon 
              icon={faYoutube} 
              className={`h-6 w-6 ${profile?.youtube ? 'text-red-600 hover:text-red-700' : 'text-gray-400 hover:text-red-600'}`} 
            />
          </a>
        </div>
      </div>
      
      {/* Divider line */}
      <div className="w-full h-[1px] bg-gray-300/20 dark:bg-gray-700/20 my-5"></div>

      {/* Car grid - Instagram-style */}
      <div className={`w-full mt-1 ${isMobile ? 'px-[10px] pb-[42px]' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          {/* Publish All button removed - all cars are now auto-published */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {editMode ? "Rearrange" : "View"}
            </span>
            <div className="flex items-center space-x-2">
              <Switch 
                id="edit-mode" 
                checked={editMode} 
                onCheckedChange={setEditMode}
                aria-label="Toggle edit mode"
              />
              <GripHorizontal 
                className={`h-4 w-4 ${editMode ? 'text-primary' : 'text-muted-foreground'}`} 
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-slate-800 text-white border-slate-700 p-3 max-w-[250px]">
                    <p>Toggle between <strong>View</strong> and <strong>Rearrange</strong> modes. In rearrange mode, you can drag and drop cars to change their order. The order will be saved automatically and shown in your public profile.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : userCars.length > 0 ? (
          <DraggableCarGrid 
            instagramStyle={true} 
            showAddButton={false} 
            className="w-full"
            editMode={editMode}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Car className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground">No cars added yet</p>
              <p className="text-sm text-muted-foreground/70">Add your first car to start building your collection</p>
            </div>
            <Button 
              onClick={() => navigate('/add-car')} 
              variant="secondary"
              className="mt-2"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Your First Car
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Always use the same layout regardless of viewport
  return (
    <>
      {/* Share Modal */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        username={profile?.username || user?.firstName?.toLowerCase() || "itsrod"}
        profileUrl={profileUrl}
      />

      {/* Use MobileLayout on mobile, ResponsiveLayout on desktop/tablet */}
      {isMobile ? (
        <MobileLayout>
          {profileContent}
        </MobileLayout>
      ) : (
        <ResponsiveLayout>
          {profileContent}
        </ResponsiveLayout>
      )}
    </>
  );
};

export default ProfilePage;
