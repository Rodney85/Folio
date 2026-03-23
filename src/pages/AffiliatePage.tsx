import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout";
import MobileLayout from "@/components/layout/MobileLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { SEO } from "@/components/SEO";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AffiliatePage = () => {
  const { isSignedIn, isLoaded } = useUser();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const navigate = useNavigate();

  const [token, setToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const getEmbedToken = useAction(api.affonso.getEmbedToken);

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      navigate("/sign-in");
      return;
    }

    if (isSignedIn) {
      let isMounted = true;
      const fetchToken = async () => {
        try {
          const data = await getEmbedToken();
          if (isMounted) {
            setToken(data.publicToken);
            setLoading(false);
          }
        } catch (err: any) {
          if (isMounted) {
            console.error("Failed to load affiliate dashboard:", err);
            setError(err.message || "Failed to load affiliate dashboard");
            setLoading(false);
          }
        }
      };

      fetchToken();
      return () => {
        isMounted = false;
      };
    }
  }, [isSignedIn, isLoaded, navigate, getEmbedToken]);

  const content = (
    <div className="flex flex-col h-full w-full bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white relative">
      <SEO
        title="Affiliate Dashboard - CarFolio"
        description="Manage your affiliate program, track referrals, and view payouts."
      />
      
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-4" />
          <p className="text-slate-500 font-medium">Loading your dashboard...</p>
        </div>
      ) : error ? (
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
          <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl max-w-md">
            <h2 className="text-red-800 dark:text-red-400 font-semibold mb-2">Dashboard Error</h2>
            <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      ) : token ? (
        <div className="flex-1 w-full h-[calc(100vh-80px)] md:h-[calc(100vh-40px)]">
          <iframe
            src={`https://affonso.io/embed/referrals?token=${token}`}
            className="w-full h-full border-0 rounded-lg md:rounded-xl shadow-sm"
            allow="clipboard-write"
            title="Affiliate Dashboard"
          />
        </div>
      ) : null}
    </div>
  );

  if (!isLoaded || !isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0F19]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return isMobile ? (
    <MobileLayout>{content}</MobileLayout>
  ) : (
    <ResponsiveLayout>{content}</ResponsiveLayout>
  );
};

export default AffiliatePage;
