import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Share, Car, Plus, Loader, GripHorizontal, Sparkles, HelpCircle, Instagram, Youtube, Settings } from "lucide-react";
import { useState } from "react";
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
import { motion } from "framer-motion";
import { SectionTransition, AnimatedItem } from "@/components/ui/page-transition";

const ProfilePage = () => {
  const { user } = useUser();
  const clerk = useClerk();
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
  const profileUrl = profile?.username ? `${baseUrl}/u/${profile.username}` : `${baseUrl}/profile`;
  
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
          <Share className="text-white cursor-pointer" onClick={() => setShareModalOpen(true)} />
          <Settings className="text-white cursor-pointer" onClick={() => {
            clerk.openUserProfile({
              appearance: {
                elements: {
                  rootBox: {
                    boxShadow: "none",
                    width: "100%"
                  },
                },
              },
            });
          }} />
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

        <h2 className="font-bold mt-6 text-xl">
          {profile?.username ? `@${profile.username}` : (
            <span className="text-muted-foreground text-base">No username set</span>
          )}
        </h2>
        {profile?.bio ? (
          <p className="text-center text-sm text-muted-foreground mt-4 mb-6 max-w-xs whitespace-pre-wrap">
            {profile.bio}
          </p>
        ) : (
          <button
            onClick={() => navigate('/profile/edit')}
            className="text-center text-sm text-muted-foreground/60 mt-4 mb-6 hover:text-muted-foreground transition-colors"
          >
            Add a bio to tell people about yourself
          </button>
        )}

        {/* Social media links - Only show configured ones */}
        {(profile?.instagram || profile?.tiktok || profile?.youtube) ? (
          <SectionTransition className="flex space-x-8 mb-6">
            {/* Instagram Icon */}
            {profile?.instagram && (
              <AnimatedItem>
                <motion.a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Instagram
                    className="h-6 w-6 text-pink-500 hover:text-pink-600 transition-colors duration-200"
                  />
                </motion.a>
              </AnimatedItem>
            )}

            {/* TikTok Icon */}
            {profile?.tiktok && (
              <AnimatedItem>
                <motion.a
                  href={`https://tiktok.com/@${profile.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <div className="h-6 w-6 text-black hover:text-gray-800 transition-colors duration-200">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                    </svg>
                  </div>
                </motion.a>
              </AnimatedItem>
            )}

            {/* YouTube Icon */}
            {profile?.youtube && (
              <AnimatedItem>
                <motion.a
                  href={`https://youtube.com/${profile.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.2, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Youtube
                    className="h-6 w-6 text-red-600 hover:text-red-700 transition-colors duration-200"
                  />
                </motion.a>
              </AnimatedItem>
            )}
          </SectionTransition>
        ) : (
          <button
            onClick={() => navigate('/profile/edit')}
            className="text-center text-sm text-muted-foreground/60 mb-6 hover:text-muted-foreground transition-colors"
          >
            Add social media links
          </button>
        )}
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
        username={profile?.username || "your-profile"}
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
