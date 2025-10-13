import { Link, useLocation } from 'react-router-dom';
import { UserCircle2, Plus, BarChart3, Menu } from 'lucide-react';

interface BottomNavigationProps {
  onMenuClick: () => void;
}

interface NavItemProps {
  to: string;
  icon: JSX.Element;
  label: string;
  active: boolean;
  comingSoon?: boolean;
}

const NavItem = ({ to, icon, label, active, comingSoon }: NavItemProps) => {
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center flex-1 py-2 relative transition-colors ${
        active ? 'text-primary' : 'text-slate-400 hover:text-white'
      }`}
    >
      <div className="mb-1">{icon}</div>
      <span className="text-xs font-medium">{label}</span>
      {comingSoon && (
        <span className="absolute top-0 right-2 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
          Soon
        </span>
      )}
    </Link>
  );
};

export const BottomNavigation = ({ onMenuClick }: BottomNavigationProps) => {
  const location = useLocation();

  const navItems = [
    {
      to: "/profile",
      icon: <UserCircle2 size={24} />,
      label: "Profile",
      active: location.pathname.startsWith('/profile'),
    },
    {
      to: "/add-car",
      icon: <Plus size={24} />,
      label: "Add Car",
      active: location.pathname.startsWith('/add-car'),
    },
    {
      to: "/analytics",
      icon: <BarChart3 size={24} />,
      label: "Analytics",
      active: location.pathname.startsWith('/analytics'),
      comingSoon: true,
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 z-50"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item, index) => (
          <NavItem key={index} {...item} />
        ))}

        {/* Hamburger Menu Button */}
        <button
          onClick={onMenuClick}
          className="flex flex-col items-center justify-center flex-1 py-2 text-slate-400 hover:text-white transition-colors"
        >
          <div className="mb-1">
            <Menu size={24} />
          </div>
          <span className="text-xs font-medium">Menu</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNavigation;
