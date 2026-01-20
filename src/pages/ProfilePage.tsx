import { useNavigate } from "react-router-dom";
import { useUser, useClerk } from "@clerk/clerk-react";
import { toast } from "sonner";
import { Share, Car, Plus, Loader, GripHorizontal, Sparkles, HelpCircle, Instagram, Youtube, Settings, Menu } from "lucide-react";
import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout";
import { useMediaQuery } from "../hooks/useMediaQuery";
import { useQuery, useMutation, useAction } from "convex/react";
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
    <div className={`flex flex-col min-h-screen bg-transparent text-white ${!isMobile ? 'p-6' : 'pb-0'}`}>
      {/* Top bar - Only visible on mobile */}
      {isMobile && (
        <div className="flex justify-end items-center p-4 pb-2">
          <Menu className="text-white cursor-pointer" onClick={() => navigate('/profile/menu')} />
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
            className="absolute right-0 bottom-0 bg-slate-800 text-slate-200 border border-slate-700 p-1.5 rounded-full hover:bg-slate-700 transition"
          >
            <Settings className="h-3 w-3" />
          </button>
        </div>

        <h2 className="font-bold mt-4 text-xl">
          {profile?.username ? `@${profile.username}` : (
            <span className="text-muted-foreground text-base">No username set</span>
          )}
        </h2>

        <p className="text-center text-sm text-slate-400 mt-2 mb-6 max-w-xs whitespace-pre-wrap">
          {profile?.bio || "No bio yet."}
        </p>

        {/* Social media links */}
        {(profile?.instagram || profile?.tiktok || profile?.youtube) ? (
          <SectionTransition className="flex space-x-6 mb-6">
            {profile?.instagram && (
              <AnimatedItem>
                <motion.a
                  href={`https://instagram.com/${profile.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Instagram className="h-5 w-5 text-slate-300 hover:text-white transition-colors" />
                </motion.a>
              </AnimatedItem>
            )}
            {profile?.tiktok && (
              <AnimatedItem>
                <motion.a
                  href={`https://tiktok.com/@${profile.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="h-5 w-5 text-slate-300 hover:text-white transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                  </div>
                </motion.a>
              </AnimatedItem>
            )}
            {profile?.youtube && (
              <AnimatedItem>
                <motion.a
                  href={`https://youtube.com/${profile.youtube}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Youtube className="h-5 w-5 text-slate-300 hover:text-white transition-colors" />
                </motion.a>
              </AnimatedItem>
            )}
          </SectionTransition>
        ) : (
          <button
            onClick={() => navigate('/profile/edit')}
            className="text-center text-xs text-slate-500 mb-6 hover:text-slate-400 transition-colors"
          >
            Add social links
          </button>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3 w-full justify-center max-w-sm">
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full px-6"
            onClick={() => navigate(`/u/${profile?.username}`)}
          >
            Preview Public
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full px-6"
            onClick={() => setShareModalOpen(true)}
          >
            Share Profile
          </Button>
        </div>
      </div>

      {/* Divider line */}
      <div className="w-full h-[1px] bg-white/10 my-5"></div>

      {/* Car grid - Instagram-style */}
      <div className={`w-full mt-1 ${isMobile ? 'px-[10px] pb-[42px]' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium tracking-wide uppercase">
              {editMode ? "Rearrange Mode" : "My Garage"}
            </span>
          </div>
          {/* Edit Mode Toggle - Only show if user has cars */}
          {userCars.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className={`text-[10px] ${editMode ? 'text-indigo-400' : 'text-slate-600'}`}>{editMode ? 'Done' : 'Edit'}</span>
              <Switch
                id="edit-mode"
                checked={editMode}
                onCheckedChange={setEditMode}
                className="scale-75 data-[state=checked]:bg-indigo-500"
              />
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader className="h-8 w-8 animate-spin text-slate-600" />
          </div>
        ) : userCars.length > 0 ? (
          <DraggableCarGrid
            instagramStyle={true}
            showAddButton={false}
            className="w-full"
            editMode={editMode}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-16 space-y-4 border border-dashed border-white/10 rounded-xl bg-white/5 mx-4">
            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
              <Car className="h-6 w-6 text-slate-500" />
            </div>
            <div className="text-center">
              <p className="text-slate-300 font-medium">Start your collection</p>
              <p className="text-xs text-slate-500 mt-1">Add your first car to showcase it.</p>
            </div>
            <Button
              onClick={() => navigate('/add-car')}
              className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-full px-6"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Car
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  // Always use the same layout regardless of viewport
  return (
    <>
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        username={profile?.username || "your-profile"}
        profileUrl={profileUrl}
      />

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
