import { useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { ChevronLeft, ChevronRight, Shield, CreditCard, Monitor, Flag, LogOut } from "lucide-react";

const ProfileMenuPage = () => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    {
      title: "Security",
      icon: <Shield className="h-5 w-5" />,
      onClick: () => {
        // Navigate to security page or open clerk security UI
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
