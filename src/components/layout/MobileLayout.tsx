import { ReactNode } from "react";
// Import the new responsive layout
import ResponsiveLayout from "./ResponsiveLayout";

interface MobileLayoutProps {
  children: ReactNode;
}

// MobileLayout now just forwards to ResponsiveLayout to maintain backward compatibility
export const MobileLayout = ({ children }: MobileLayoutProps) => {
  return (
    <ResponsiveLayout>
      {children}
    </ResponsiveLayout>
  );
};

export default MobileLayout;
