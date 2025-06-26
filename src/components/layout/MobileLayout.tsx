import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserCircle2, Plus, BarChart3 } from "lucide-react";

interface MobileLayoutProps {
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
      className={`flex flex-col items-center justify-center w-full h-full ${active ? 'text-primary' : 'text-muted-foreground'}`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
};

export const MobileLayout = ({ children }: MobileLayoutProps) => {
  const location = useLocation();

  return (
    <div className="flex flex-col h-[100svh] bg-background overflow-hidden">
      {/* Scrollable content area with padding at bottom to prevent overlap with nav */}
      <main className="flex-1 overflow-y-auto pb-16">{children}</main>

      {/* Fixed Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-background shadow-md">
        <div className="flex justify-around py-2">
          <NavItem 
            to="/profile"
            icon={<UserCircle2 size={24} />}
            label="Profile"
            active={location.pathname.startsWith('/profile')}
          />
          <NavItem 
            to="/add-car"
            icon={<Plus size={24} />}
            label="Add Car"
            active={location.pathname.startsWith('/add-car')}
          />
          <NavItem 
            to="/analytics"
            icon={<BarChart3 size={24} />}
            label="Analytics"
            active={location.pathname.startsWith('/analytics')}
          />
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
