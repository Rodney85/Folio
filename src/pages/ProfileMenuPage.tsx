import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Shield, Monitor, Flag, LogOut, Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth, useClerk } from "@clerk/clerk-react";

const ProfileMenuPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const clerk = useClerk();

  // Define menu items - Focused on Auth & Settings
  const menuItems = [
    {
      title: "Account Settings",
      icon: <Settings className="h-5 w-5" />,
      onClick: () => {
        // Open Clerk user profile - General
        clerk.openUserProfile({
          appearance: {
            elements: {
              rootBox: { boxShadow: "none", width: "100%" },
              card: { boxShadow: "none" }
            }
          }
        });
      }
    },
    {
      title: "Security & Password",
      icon: <Shield className="h-5 w-5" />,
      onClick: () => {
        // Open Clerk user profile - Security section
        // Note: Clerk doesn't support direct linking to security tab easily in all versions, 
        // but opening the profile gives access to it.
        clerk.openUserProfile({
          appearance: {
            elements: {
              rootBox: { boxShadow: "none", width: "100%" },
              card: { boxShadow: "none" }
            }
          }
        });
      }
    },
    {
      title: "Display",
      icon: <Monitor className="h-5 w-5" />,
      onClick: () => {
        // Future: Navigate to display settings
        toast.info("Display settings coming soon");
      }
    },
    {
      title: "Report an Issue",
      icon: <Flag className="h-5 w-5" />,
      onClick: () => {
        navigate("/report-issue");
      }
    },
    {
      title: "Log out",
      icon: <LogOut className="h-5 w-5 text-red-400" />,
      onClick: async () => {
        await signOut();
        navigate("/");
      },
      danger: true
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Top bar */}
      <div className="flex items-center p-4 border-b border-border">
        <button onClick={() => navigate('/profile')} className="mr-4 p-1 hover:bg-muted rounded-full transition-colors">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h1 className="text-lg font-semibold">Settings</h1>
      </div>

      {/* Menu items */}
      <div className="flex flex-col mt-2">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className={`flex items-center justify-between px-6 py-4 border-b border-muted/20 hover:bg-muted/30 transition-colors ${item.danger ? 'text-red-400 hover:bg-red-500/10' : ''
              }`}
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span className={item.danger ? "font-medium" : ""}>{item.title}</span>
            </div>
            {!item.danger && <ChevronRight className="h-5 w-5 text-muted-foreground" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileMenuPage;
