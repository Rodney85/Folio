import React, { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUser, useAuth, useClerk } from '@clerk/clerk-react';
import { BarChart3, Plus, UserCircle2, Menu, X, Home, Shield, CreditCard, Monitor, Flag, LogOut, ChevronRight, Share, Eye } from 'lucide-react';
import SquirrelIcon from '@/components/icons/SquirrelIcon';
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
      className={`flex flex-col items-center justify-center px-4 ${active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
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
  // We no longer need sidebarOpen state since we're not toggling sidebar in mobile
  const isMobile = useMediaQuery("(max-width: 767px)");
  const isTablet = useMediaQuery("(min-width: 768px) and (max-width: 1023px)");
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  
  // Get user profile data for share modal
  const profile = useQuery(api.users.getProfile);
  
  // Handle share action
  const handleShare = () => {
    if (user) {
      setShareModalOpen(true);
    }
  };

  // Define the profile URL for QR code (same format as AppLayout)
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
      // Open the public profile in a new tab
      window.open(`/u/${profile.username}`, '_blank');
    }
  };

  // Define the menu items from ProfileMenuPage for sidebar 
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
      title: "Subscription",
      icon: <CreditCard className="h-5 w-5" />,
      onClick: () => {
        // Navigate to subscription page
      }
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
    <div className="flex h-[100svh] bg-slate-900 text-white">
      {/* Sidebar for tablet and desktop only */}
      {(isTablet || isDesktop) && (
        <div className="w-64 border-r border-slate-800">
          <div className="p-4 flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center p-4 mb-10">
              <div className="flex items-center">
                <h2 className="text-xl font-bold">CarFolio</h2>
                <SquirrelIcon className="h-5 w-5 ml-1" />
              </div>
            </div>
            
            {/* Main content area with flex to push items to top and bottom */}
            <div className="flex flex-col flex-1">
              {/* Main navigation - adjusted spacing and padding */}
              <div className="space-y-1 mt-2 mb-auto"> {/* Less compact spacing */}
                {navItems.filter(item => !item.mobileOnly).map((item, index) => (
                  <Link 
                    key={index}
                    to={item.to} 
                    className="flex items-center px-4 py-4 text-white hover:bg-slate-800/50 rounded-md"
                    onClick={() => {/* No sidebar toggle needed */}}
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
                      <span className="font-medium text-sm truncate max-w-[120px]">
                        @{profile?.username || user?.firstName?.toLowerCase() || "carfolio.cc"}
                      </span>
                      <span className="text-xs text-slate-400 truncate max-w-[120px]">
                        {(user?.primaryEmailAddress?.emailAddress || "").split('@')[0]}
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
        <main className={`flex-1 overflow-y-auto ${isMobile ? 'pb-16' : 'p-4'}`}>
          {children}
        </main>
        
        {/* Mobile bottom navigation - only show on mobile */}
        {isMobile && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-md">
            <div className="flex justify-around py-2">
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
                className="flex flex-col items-center justify-center px-4 text-muted-foreground hover:text-foreground"
                disabled={!profile?.username}
              >
                <Eye size={24} />
                <span className="text-xs mt-1">Preview</span>
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
      </div>
      
      {/* Share Modal */}
      {user && (
        <ShareModal
          open={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
          username={user.username || user.id.toString()}
          profileUrl={profileUrl}
        />
      )}
    </div>
  );
};

export default ResponsiveLayout;
