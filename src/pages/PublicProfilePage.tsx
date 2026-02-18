import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader, Car, Sparkles } from "lucide-react";
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';
import { SEO } from "@/components/SEO";
import SocialLinks from "@/components/SocialLinks";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { getDeviceType } from "@/lib/utils";

// Define a simplified interface for analytics events to avoid deep type instantiation errors
interface AnalyticsEvent {
  type: string;
  visitorDevice?: string;
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  country?: string;
  city?: string;
}

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  // Create a wrapper function to avoid deep type instantiation errors
  // @ts-ignore - Convex type instantiation issue
  const logAnalyticsEvent = useMutation(api.analytics.logEvent);

  // Wrapper function to handle analytics logging
  const logAnalytics = (event: AnalyticsEvent) => {
    return logAnalyticsEvent({
      type: event.type,
      visitorDevice: event.visitorDevice,
      referrer: event.referrer,
      utmSource: event.utmSource,
      utmMedium: event.utmMedium,
      utmCampaign: event.utmCampaign,
      country: event.country,
      city: event.city,
    });
  };

  // Use the generated API to fetch the public profile by username
  const profileData = useQuery(api.users.getProfileByUsername, {
    username: username || ""
  });

  // Track profile view when data loads
  useEffect(() => {
    if (profileData?.user) {
      // Cast the event to our simplified interface
      logAnalytics({
        type: "profile_view",
        visitorDevice: getDeviceType(),
        referrer: document.referrer || undefined,
        // Extract UTM parameters from URL
        utmSource: new URLSearchParams(window.location.search).get("utm_source") || undefined,
        utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
        utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
      });
    }
  }, [profileData?.user, logAnalytics]);


  // Move hook to top level to avoid React Invariant Error #310 (Hooks Rule Violation)
  // @ts-ignore
  const ownerTier = useQuery(api.freemium.getPublicUserTier, profileData?.user ? { userId: profileData.user._id } : "skip");

  // Loading state
  if (profileData === undefined) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // User not found
  if (profileData === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Profile Not Found</h1>
          <p className="text-xl text-gray-600 mb-4">This profile doesn't exist or is private.</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            Return to Home
          </a>
        </div>
      </div>
    );
  }



  const { user, cars } = profileData;

  return (
    <div className="flex flex-col bg-transparent text-white min-h-screen p-4 max-w-2xl mx-auto w-full md:border-x md:border-white/5 md:shadow-2xl">
      <SEO
        title={`${user.username} - CarFolio Profile`}
        description={user.bio || `Check out ${user.username}'s garage on CarFolio.`}
        image={user.pictureUrl || "/og-image.png"}
        url={`https://www.carfolio.cc/u/${username}`}
      />
      {/* Profile header */}
      <div className="flex flex-col items-center px-6 pb-4">
        <div className="relative">
          <img
            src={user.pictureUrl || "https://via.placeholder.com/100"}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
          />
          {ownerTier === 'og' && (
            <div className="absolute -bottom-2 bg-yellow-500 text-black text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-[#020204] shadow-lg flex items-center gap-1">
              <Sparkles className="w-3 h-3 fill-black" />
              OG
            </div>
          )}
        </div>

        <h2 className="font-bold mt-6 text-xl flex items-center gap-2">
          @{user.username}
        </h2>
        <p className="text-center text-sm text-slate-400 mt-4 mb-6 max-w-xs whitespace-pre-wrap">
          {user.bio ? (
            <span className="whitespace-pre-wrap">{user.bio}</span>
          ) : (
            ""
          )}
        </p>

        {/* Social media links */}
        <SocialLinks
          instagram={user.instagram}
          tiktok={user.tiktok}
          youtube={user.youtube}
          disableEdit={true}
        />
      </div>

      {/* Divider line */}
      <div className="w-full h-[1px] bg-white/10 my-5"></div>

      {/* Car grid - Instagram-style */}
      <div className="w-full mt-1 px-[10px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Cars</h2>
        </div>

        {cars && cars.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {cars.map((car) => (
              <div
                key={car._id}
                className="relative pb-[100%] w-full overflow-hidden cursor-pointer rounded-md bg-slate-800/50"
                onClick={() => navigate(`/u/${username}/car/${car._id}`)}
              >
                {car.images && car.images.length > 0 ? (
                  <CarImageWithUrl
                    storageId={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-600">
                    <Car className="h-8 w-8 opacity-50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-900/30 rounded-xl border border-white/5 mx-2">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Car className="h-8 w-8 text-slate-500" />
            </div>
            <p className="text-slate-400 font-medium">No cars published yet</p>
          </div>
        )}
      </div>

      {/* Powered by CarFolio watermark (Free tier only) */}
      {ownerTier === 'free' && (
        <div className="mt-12 mb-8 flex justify-center">
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group"
          >
            <span className="text-xs text-slate-400 group-hover:text-white transition-colors">Powered by</span>
            <span className="text-sm font-bold text-white">CarFolio</span>
          </a>
        </div>
      )}
    </div>
  );
};

export default PublicProfilePage;
