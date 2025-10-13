import { Crown, Eye, Share, Flag, LogOut, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

interface MobileMenuProps {
  open: boolean;
  onClose: () => void;
  onShareClick: () => void;
}

export const MobileMenu = ({ open, onClose, onShareClick }: MobileMenuProps) => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const navigate = useNavigate();

  // Get user profile data
  // @ts-ignore - Suppressing TypeScript error for deep instantiation
  const profile = useQuery(api.users.getProfile);

  // Helper function to open public profile in new tab
  const openPublicProfile = () => {
    if (profile?.username) {
      window.open(`/u/${profile.username}`, '_blank');
    }
    onClose();
  };

  const handleShare = () => {
    onShareClick();
    onClose();
  };

  const handleSubscription = () => {
    navigate('/subscription');
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    onClose();
  };

  const menuItems = [
    {
      title: 'Subscription',
      icon: <Crown className="h-5 w-5" />,
      onClick: handleSubscription,
    },
    {
      title: 'Preview Public Profile',
      icon: <Eye className="h-5 w-5" />,
      onClick: openPublicProfile,
      disabled: !profile?.username,
    },
    {
      title: 'Share Profile',
      icon: <Share className="h-5 w-5" />,
      onClick: handleShare,
    },
    {
      title: 'Report an Issue',
      icon: <Flag className="h-5 w-5" />,
      onClick: () => {
        // Navigate to report issue page or open external link
        onClose();
      },
    },
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[300px] bg-slate-900 border-slate-800 text-white p-0">
        <div className="flex flex-col h-full">
          {/* Header with user info */}
          <SheetHeader className="p-6 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <img
                src={user?.imageUrl || 'https://via.placeholder.com/40'}
                alt="Profile"
                className="w-12 h-12 rounded-full"
              />
              <div className="flex flex-col text-left flex-1 min-w-0">
                <SheetTitle className="text-white font-semibold truncate">
                  {profile?.username || user?.firstName || 'carfolio.cc'}
                </SheetTitle>
                <span className="text-xs text-slate-400 truncate">
                  {user?.primaryEmailAddress?.emailAddress || 'email@example.com'}
                </span>
              </div>
            </div>
          </SheetHeader>

          {/* Menu items */}
          <div className="flex-1 overflow-y-auto py-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.onClick}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between px-6 py-4 text-white hover:bg-slate-800/50 transition-colors ${
                  item.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <span>{item.title}</span>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-400" />
              </button>
            ))}
          </div>

          {/* Footer with sign out */}
          <div className="border-t border-slate-800 p-4">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default MobileMenu;
