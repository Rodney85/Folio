import { ReactNode } from "react";
// Import the new responsive layout
import ResponsiveLayout from "./ResponsiveLayout";

interface MobileLayoutProps {
  children: ReactNode;
  noPadding?: boolean;
}

// MobileLayout now just forwards to ResponsiveLayout to maintain backward compatibility
export const MobileLayout = ({ children, noPadding = false }: MobileLayoutProps) => {
  return (
    <ResponsiveLayout noPadding={noPadding}>
      {children}
    </ResponsiveLayout>
  );
};

export default MobileLayout;
