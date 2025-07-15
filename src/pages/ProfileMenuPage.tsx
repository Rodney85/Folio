import { useNavigate } from "react-router-dom";
import { useAuth, useUser, useClerk } from "@clerk/clerk-react";
import { ChevronLeft, ChevronRight, Shield, CreditCard, Monitor, Flag, LogOut, Car, Key, UserCircle, BarChart } from "lucide-react";

const ProfileMenuPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();

  const menuItems = [
    {
      title: "Analytics",
      icon: <BarChart className="h-5 w-5" />,
      onClick: () => navigate("/analytics")
    },
    {
      title: "Security & Password",
      icon: <Shield className="h-5 w-5" />,
      onClick: () => {
        // Open Clerk user profile with security/password section
        // Note: Using just appearance options as initialPage isn't supported in this version
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
      }
    },
    {
      title: "Subscription",
      icon: <CreditCard className="h-5 w-5" />,
      onClick: () => {
        // Navigate to subscription page
      }
    },
    {
      title: "Display",
      icon: <Monitor className="h-5 w-5" />,
      onClick: () => {
        // Navigate to display settings
      }
    },
    {
      title: "Report an Issue",
      icon: <Flag className="h-5 w-5" />,
      onClick: () => {
        // Navigate to report issue page
      }
    },
    {
      title: "Log out",
      icon: <LogOut className="h-5 w-5" />,
      onClick: async () => {
        await signOut();
        navigate("/");
      }
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <div className="flex justify-start items-center p-4 border-b">
        <button onClick={() => navigate('/profile')} className="flex items-center">
          <ChevronLeft className="h-5 w-5 mr-1" />
        </button>
      </div>

      {/* Menu items */}
      <div className="flex flex-col">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.onClick}
            className="flex items-center justify-between px-6 py-4 border-b border-muted hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center space-x-3">
              {item.icon}
              <span>{item.title}</span>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </button>
        ))}
      </div>
    </div>
  );
};

export default ProfileMenuPage;
