import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Loader, Car } from "lucide-react";

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
import CarGrid from "@/components/cars/CarGrid";
import SocialLinks from "@/components/SocialLinks";
import NotFound from "@/pages/NotFound";
import { useEffect } from "react";
import { getDeviceType } from "@/lib/utils";

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
    <div className="flex flex-col bg-slate-900 text-white min-h-screen p-4">
      {/* Profile header */}
      <div className="flex flex-col items-center px-6 pb-4">
        <div className="relative">
          <img 
            src={user.pictureUrl || "https://via.placeholder.com/100"} 
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
          />
        </div>

        <h2 className="font-bold mt-6 text-xl">@{user.username}</h2>
        <p className="text-center text-sm text-muted-foreground mt-4 mb-6 max-w-xs whitespace-pre-wrap">
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
      <div className="w-full h-[1px] bg-gray-300/20 dark:bg-gray-700/20 my-5"></div>

      {/* Car grid - Instagram-style */}
      <div className="w-full mt-1 px-[10px]">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg">Cars</h2>
        </div>
        
        {cars && cars.length > 0 ? (
          <div className="grid grid-cols-3 gap-[2px]">
            {cars.map((car) => (
              <div 
                key={car._id}
                className="relative pb-[100%] w-full overflow-hidden cursor-pointer rounded-[5px]"
                onClick={() => navigate(`/u/${username}/car/${car._id}`)}
              >
                {car.images && car.images.length > 0 ? (
                  <img
                    src={car.images[0]}
                    alt={`${car.make} ${car.model}`}
                    className="absolute inset-0 w-full h-full object-cover rounded-[5px]"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800 rounded-[5px]">
                    <Car className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Car className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-muted-foreground">No published cars to display</p>
              <p className="text-sm text-muted-foreground mt-2">
                This user hasn't published any cars yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicProfilePage;
