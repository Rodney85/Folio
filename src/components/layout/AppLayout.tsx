import { useState, ReactNode } from "react";
import { useUser } from "@clerk/clerk-react";
import ShareModal from "../ShareModal";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { PageTransition } from "@/components/ui/page-transition";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const { user } = useUser();

  // Get user profile data from Convex for share modal
  // Use 'any' to avoid type instantiation error with Convex queries
  const profile: any = useQuery(api.users.getProfile);

  // Define the profile URL for QR code
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/u/${profile?.username || user?.firstName?.toLowerCase() || "itsrod"}`;
  
  return (
    <div className="flex h-[100svh] w-full overflow-hidden bg-slate-900 text-white">
      {/* Main content area with page transitions */}
      <main className="flex-1 overflow-y-auto relative">
        <PageTransition>
          {children}
        </PageTransition>
      </main>

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
