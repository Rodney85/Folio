import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useLocation } from "react-router-dom";
import ShareModal from "../ShareModal";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useMediaQuery } from "../../hooks/useMediaQuery";

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { user } = useUser();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");

  // Get user profile data from Convex for share modal
  const profile = useQuery(api.users.getProfile);

  // Define the profile URL for QR code (same as in ProfilePage)
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/profile/${profile?.username || user?.firstName?.toLowerCase() || "itsrod"}`;

  // Pages that should use mobile layout only (no sidebar)
  const specialLayoutPages = [
    "/welcome", 
    "/sign-in", 
    "/sign-up",
    "/"
  ];

  const shouldShowSidebar = !specialLayoutPages.some(path => location.pathname === path);
  
  // Ensure layout is consistent across devices
  return (
    <div className="flex h-[100svh] w-full overflow-hidden bg-slate-900 text-white">
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto relative">

        {/* This ensures content appears the same across all devices */}
        {children}
      </div>

      {/* Share Modal - used consistently across all device sizes */}
      <ShareModal
        open={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        username={profile?.username || user?.firstName?.toLowerCase() || "itsrod"}
        profileUrl={profileUrl}
      />
    </div>
  );
};

// Using imported useMediaQuery hook from hooks/useMediaQuery.ts

export default AppLayout;
