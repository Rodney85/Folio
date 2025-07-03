import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { Share, Menu, Car, Plus, Loader } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";
import MobileLayout from "@/components/layout/MobileLayout";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import CarThumbnail from "@/components/cars/CarThumbnail";
import CarImageWithUrl from "@/components/cars/CarImageWithUrl";

const ProfilePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  
  // Get user's cars from Convex
  const userCars = useQuery(api.cars.getUserCars) || [];
  const firstCar = useQuery(api.cars.getUserFirstCar);
  
  const handleCarClick = (car) => {
    navigate(`/car/${car._id}`);
  };
  
  const loading = userCars === undefined;

  return (
    <MobileLayout>
      <div className="flex flex-col bg-slate-900 text-white">
        {/* Top bar */}
        <div className="flex justify-between items-center p-4 pb-2">
          <Share className="text-white" />
          <Menu className="text-white" onClick={() => navigate('/profile/menu')} />
        </div>

        {/* Profile header */}
        <div className="flex flex-col items-center px-6 pb-4">
          <div className="relative">
            <img 
              src={user?.imageUrl || "https://via.placeholder.com/100"} 
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
            />
            <button 
              onClick={() => navigate('/profile/edit')}
              className="absolute right-0 bottom-0 bg-muted text-muted-foreground px-3 py-1 text-xs rounded-md"
            >
              Edit
            </button>
          </div>

          <h2 className="font-bold mt-4 text-xl">@{user?.username || user?.firstName?.toLowerCase() || "itsrod"}</h2>
          <p className="text-center text-sm text-muted-foreground mt-2 mb-1 max-w-xs whitespace-pre-wrap">
            {user?.publicMetadata?.bio as string || "I don't wanna end up like Muqtada\nLive in the moment"}
          </p>

          {/* Social media links */}
          <div className="flex space-x-6 mt-5">
            <a href="#" className="p-1">
              <FontAwesomeIcon icon={faYoutube} className="text-white hover:text-red-500 transition-colors" size="lg" />
            </a>
            <a href="#" className="p-1">
              <FontAwesomeIcon icon={faInstagram} className="text-white hover:text-pink-500 transition-colors" size="lg" />
            </a>
            <a href="#" className="p-1">
              <FontAwesomeIcon icon={faTiktok} className="text-white hover:text-blue-400 transition-colors" size="lg" />
            </a>
          </div>
        </div>
        
        {/* Divider line to separate profile details from car grid */}
        <div className="w-full h-[1px] bg-gray-300/20 dark:bg-gray-700/20 my-5"></div>

        {/* Car gallery - Instagram style with responsive grid */}
        <div className="w-full px-[14px] mt-1">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg">My Cars</h2>
            <Button 
              size="sm" 
              variant="ghost" 
              className="text-muted-foreground"
              onClick={() => navigate('/cars')}
            >
              View All
            </Button>
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : userCars.length > 0 ? (
            <div className="grid grid-cols-3 gap-[2px] w-full">
              {userCars.map((car) => (
                <div 
                  key={car._id} 
                  className="relative pb-[100%] w-full overflow-hidden"
                >
                  {car.images && car.images.length > 0 ? (
                    <CarImageWithUrl
                      storageId={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                      className="absolute inset-0 w-full h-full object-cover rounded-[5px]"
                      onClick={() => handleCarClick(car)}
                    />
                  ) : (
                    <div 
                      className="absolute inset-0 flex items-center justify-center bg-muted rounded-[5px]"
                      onClick={() => handleCarClick(car)}
                    >
                      <Car className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Add car placeholder */}
              <div 
                className="relative pb-[100%] w-full overflow-hidden cursor-pointer" 
                onClick={() => navigate('/add-car')}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-[5px]">
                  <Plus className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 space-y-4">
              <Car className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <p className="text-muted-foreground">No cars added yet</p>
                <p className="text-sm text-muted-foreground/70">Add your first car to start building your collection</p>
              </div>
              <Button 
                onClick={() => navigate('/add-car')} 
                variant="secondary"
                className="mt-2"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Your First Car
              </Button>
            </div>
          )}
        </div>
        
        {/* Car details are now shown in a dedicated page */}

        {/* No floating action buttons - using only the bottom navigation */}
      </div>
    </MobileLayout>
  );
};

export default ProfilePage;
