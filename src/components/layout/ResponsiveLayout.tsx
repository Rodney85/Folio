import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { Plus, UserCircle2, LogOut, ChevronRight, Share, Eye, Flag, CreditCard, Compass } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import ShareModal from '@/components/ShareModal';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import BottomNavigation from '@/components/navigation/BottomNavigation';
// MobileMenu removed as per navigation restructuring

interface ResponsiveLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
}

export const ResponsiveLayout = ({ children, noPadding = false }: ResponsiveLayoutProps) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const clerk = useClerk();
  const navigate = useNavigate();
  const location = useLocation();
  const [shareModalOpen, setShareModalOpen] = useState(false);

  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  // Get user profile data for share modal
  // @ts-ignore - Suppressing TypeScript error for deep instantiation
  const profile = useQuery(api.users.getProfile)!;

  // Handle share action
  const handleShare = () => {
    if (user) {
      setShareModalOpen(true);
    }
  };

  // Define the profile URL for QR code
  const baseUrl = window.location.origin;
  const profileUrl = `${baseUrl}/u/${profile?.username || user?.firstName?.toLowerCase() || "itsrod"}`;

  // Navigation items for mobile bottom nav and main navigation
  const navItems = [
    {
      to: "/profile",
      icon: <UserCircle2 size={24} />,
      label: "Profile",
      active: location.pathname.startsWith('/profile'),
      comingSoon: false
    },
    {
      to: "/explore",
      icon: <Compass size={24} />,
      label: "Explore",
      active: location.pathname.startsWith('/explore'),
      comingSoon: false
    },
    {
      to: "/add-car",
      icon: <Plus size={24} />,
      label: "Add Car",
      active: location.pathname.startsWith('/add-car'),
      comingSoon: false
    }
  ];

  // Helper function to open public profile in new tab
  const openPublicProfile = () => {
    if (profile?.username) {
      window.open(`/u/${profile.username}`, '_blank');
    }
  };

  // Define menu items for sidebar 
  const menuItems = [
    {
      title: "Report an Issue",
      icon: <Flag className="h-5 w-5" />,
      onClick: () => {
        navigate("/report-issue");
      }
    }
  ];

  const paddingClasses = noPadding
    ? (isMobile ? 'pb-[90px]' : '')
    : (isMobile ? 'p-4 pb-[90px]' : 'p-4 md:p-6 lg:p-8');

  return (
    <>
      <div className="flex h-[100dvh] bg-transparent text-white overflow-hidden">
        {/* Sidebar for tablet and desktop only */}
        {(isTablet || isDesktop) && (
          <div className="w-64 md:w-72 lg:w-80 border-r border-white/10 bg-black/20 backdrop-blur-xl flex-shrink-0 z-50 relative">
            <div className="p-4 flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center p-4 mb-10">
                <Logo size="md" />
              </div>

              {/* Main content area with flex to push items to top and bottom */}
              <div className="flex flex-col flex-1">
                {/* Main navigation - adjusted spacing and padding */}
                <div className="space-y-1 mt-2 mb-auto">
                  {navItems.map((item, index) => (
                    <Link
                      key={index}
                      to={item.to}
                      className="flex items-center justify-between px-4 py-4 text-white hover:bg-white/5 hover:backdrop-blur-lg rounded-md relative transition-all duration-200"
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      {item.comingSoon && (
                        <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded-full">
                          Soon
                        </span>
                      )}
                    </Link>
                  ))}
                </div>

                {/* Settings menu items moved to bottom, just above profile */}
                {!isMobile && (
                  <div className="mt-auto mb-5">
                    {menuItems.map((item, index) => (
                      <button
                        key={index}
                        onClick={item.onClick}
                        className="w-full flex items-center justify-between px-4 py-4 text-white hover:bg-slate-800/50"
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.title}</span>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Profile section at the bottom */}
                <div className="border-t border-slate-800 pt-4">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        clerk.openUserProfile({
                          appearance: {
                            elements: {
                              rootBox: {
                                boxShadow: "none",
                                width: "100%"
                              },
                            }
                          },
                        });
                      }}
                      className="flex items-center space-x-3 hover:bg-slate-800/50 rounded-md p-2 flex-grow"
                      title={user?.primaryEmailAddress?.emailAddress || "email@example.com"}
                    >
                      <img
                        src={user?.imageUrl || "https://via.placeholder.com/40"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full"
                      />
                      <div className="flex flex-col text-left min-w-0 flex-shrink">
                        <span className="font-medium text-sm truncate max-w-[140px]">
                          {profile?.username || user?.firstName || "carfolio.cc"}
                        </span>
                        <span className="text-xs text-slate-400 truncate max-w-[140px]">
                          {user?.primaryEmailAddress?.emailAddress || "email@example.com"}
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={async () => {
                        await signOut();
                        navigate("/");
                      }}
                      className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-md"
                      title="Log out"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className={`flex-1 flex flex-col overflow-hidden ${(isTablet || isDesktop) ? 'ml-0' : ''}`}>
          <main className={`flex-1 overflow-y-auto ${paddingClasses}`}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation */}
      {isMobile && user && (
        <BottomNavigation />
      )}
      {/* Share Modal */}
      {user && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          username={user.username || user.id.toString()}
          profileUrl={profileUrl}
        />
      )}
    </>
  );
};

export default ResponsiveLayout;
