import { useEffect } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Car, LogOut } from "lucide-react";
import { Link } from "react-router-dom";

import Cookies from "js-cookie";

/**
 * Fires the Affonso lead tracking pixel so affiliate sign-ups are attributed.
 * Called once on mount after a successful sign-up.
 */
function trackAffonsoLead(email: string, name?: string) {
  try {
    // Retrieve the stored affiliate code (set by SignUp.tsx when ?via= was in the URL)
    const viaCode =
      sessionStorage.getItem("affonso_via") ||
      document.cookie
        .split("; ")
        .find((c) => c.startsWith("affonso_ref="))
        ?.split("=")?.[1];

    // Try to fire Affonso lead pixel
    if (typeof window !== 'undefined' && (window as any).Affonso) {
      try {
        (window as any).Affonso.signup({
          email: email,
          name: name,
          ...(viaCode ? { referral: viaCode } : {}),
        });
        console.log("Affonso lead tracked successfully, via:", viaCode);
      } catch (err) {
        console.error("Error tracking Affonso lead:", err);
      }
      Cookies.remove('affonso_ref');
    } else {
      // Pixel not ready yet — retry once after a short delay
      setTimeout(() => {
        if (typeof window !== 'undefined' && (window as any).Affonso) {
          try {
            (window as any).Affonso.signup({
              email: email,
              name: name,
              ...(viaCode ? { referral: viaCode } : {}),
            });
            console.log("Affonso lead tracked (delayed) successfully, via:", viaCode);
          } catch (err) {
            console.error("Error tracking Affonso lead (delayed):", err);
          }
          Cookies.remove('affonso_ref');
        }
      }, 2000);
    }

    // Clean up the stored code so it doesn't fire again on revisit
    sessionStorage.removeItem("affonso_via");
  } catch (err) {
    console.warn("Affonso lead tracking failed:", err);
  }
}

/**
 * WelcomeScreen displayed after successful authentication
 */
export const WelcomeScreen = () => {
  const { user } = useUser();

  useEffect(() => {
    const email = user?.primaryEmailAddress?.emailAddress;
    if (email) {
      trackAffonsoLead(email, user?.fullName || undefined);
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-950 p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden p-6 space-y-8">
        <div className="flex justify-center">
          <div className="bg-blue-100 dark:bg-blue-900 rounded-full p-3">
            <Car className="h-10 w-10 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome to CarFolio
          </h1>
          
          {user?.imageUrl && (
            <div className="flex justify-center mt-4 mb-6">
              <img
                src={user.imageUrl}
                alt={user.fullName || "User"}
                className="h-20 w-20 rounded-full border-4 border-blue-500"
              />
            </div>
          )}
          
          <p className="text-xl font-semibold text-gray-800 dark:text-gray-100">
            Hello, {user?.firstName || "there"}!
          </p>
          
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Thank you for signing up. Your account is now ready to use.
          </p>
        </div>
        
        <div className="space-y-4 mt-8">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            <Link to="/profile" className="w-full flex items-center justify-center">
              Start Building Your Portfolio
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full">
            <Link to="/analytics" className="w-full flex items-center justify-center">
              Explore Examples
            </Link>
          </Button>
          
          <SignOutButton>
            <Button variant="ghost" className="w-full text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
              <span className="flex items-center justify-center gap-2">
                <LogOut className="h-4 w-4" />
                Sign Out
              </span>
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;


