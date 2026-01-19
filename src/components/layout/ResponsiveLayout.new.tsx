import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { BarChart3, Plus, UserCircle2, Menu, X, Home, Shield, CreditCard, Monitor, Flag, LogOut, ChevronRight, Share, Eye } from 'lucide-react';
import { Logo } from '@/components/ui/logo';
import ShareModal from '@/components/ShareModal';
import ShareModal from '@/components/ShareModal';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';

interface ResponsiveLayoutProps {
  children: ReactNode;
}

interface NavItemProps {
  to: string;
  icon: JSX.Element;
  label: string;
  active: boolean;
}

const NavItem = ({ to, icon, label, active }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center px-2 py-1 ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
    >
      <div className="mb-0.5">{icon}</div>
      <span className="text-xs">{label}</span>
    </Link>
  );
};

export const ResponsiveLayout = ({ children }: ResponsiveLayoutProps) => {
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
  const profileUrl = `${baseUrl}/profile/${profile?.username || user?.firstName?.toLowerCase() || "itsrod"}`;

  // Navigation items for mobile bottom nav and main navigation
  const navItems = [
    {
      to: "/profile",
      icon: <UserCircle2 size={24} />,
      label: "Profile",
      active: location.pathname.startsWith('/profile')
    },
    {
      to: "/add-car",
      icon: <Plus size={24} />,
      label: "Add Car",
      active: location.pathname.startsWith('/add-car')
    },
    {
      to: "/analytics",
      icon: <BarChart3 size={24} />,
      label: "Analytics",
      active: location.pathname.startsWith('/analytics')
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
      title: "Preview Public Profile",
      icon: <Eye className="h-5 w-5" />,
      onClick: openPublicProfile
    },
    {
      title: "Share Profile",
      icon: <Share className="h-5 w-5" />,
      onClick: handleShare
    },

    {
      title: "Report an Issue",
      icon: <Flag className="h-5 w-5" />,
      onClick: () => {
        // Navigate to report issue page
      }
    }
  ];

  return (
    <>
      <div className="flex h-[100svh] bg-slate-900 text-white overflow-hidden">
        {/* Sidebar for tablet and desktop only */}
        {(isTablet || isDesktop) && (
          <div className="w-64 md:w-72 lg:w-80 border-r border-slate-800 flex-shrink-0">
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
                      className="flex items-center px-4 py-4 text-white hover:bg-slate-800/50 rounded-md"
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.label}</span>
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
          <main className={`flex-1 overflow-y-auto ${isMobile ? 'pb-[70px]' : 'p-4 md:p-6 lg:p-8'}`}>
            {children}
          </main>
        </div>
      </div>

      {/* Mobile bottom navigation - fixed position with enhanced positioning properties */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            transform: 'translate3d(0,0,0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transition: 'none',
            willChange: 'transform',
            width: '100%',
            height: '50px',
            pointerEvents: 'auto',
            WebkitOverflowScrolling: 'touch',
            WebkitTransform: 'translate3d(0,0,0)'
          }}
          className="border-t bg-background shadow-md flex items-center"
        >
          <div className="flex justify-around w-full py-1">
            {/* Profile navigation item */}
            <NavItem
              key="profile"
              to="/profile"
              icon={<UserCircle2 size={24} />}
              label="Profile"
              active={location.pathname.startsWith('/profile')}
            />

            {/* Preview button */}
            <button
              onClick={openPublicProfile}
              className="flex flex-col items-center justify-center px-2 py-1 text-muted-foreground hover:text-foreground"
              disabled={!profile?.username}
            >
              <div className="mb-0.5"><Eye size={24} /></div>
              <span className="text-xs">Preview</span>
            </button>

            {/* Add Car navigation item */}
            <NavItem
              key="add-car"
              to="/add-car"
              icon={<Plus size={24} />}
              label="Add Car"
              active={location.pathname.startsWith('/add-car')}
            />

            {/* Analytics navigation item */}
            <NavItem
              key="analytics"
              to="/analytics"
              icon={<BarChart3 size={24} />}
              label="Analytics"
              active={location.pathname.startsWith('/analytics')}
            />
          </div>
        </div>
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
