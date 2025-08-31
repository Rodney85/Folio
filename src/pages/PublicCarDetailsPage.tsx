import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ArrowLeft, ExternalLink, ShoppingCart, ChevronLeft, ChevronRight, LockIcon, CreditCard } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Loader } from 'lucide-react';
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';
import { Button } from '@/components/ui/button';
import { useSwipeable } from 'react-swipeable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { checkPublicProfileAccess } from "@/lib/subscription-utils";

/**
 * Public car details page - viewable by unauthenticated users
 * URL format: /u/:username/car/:id
 */
const PublicCarDetailsPage = () => {
  const navigate = useNavigate();
  const { id, username } = useParams<{ id: string, username: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [hasSubscriptionAccess, setHasSubscriptionAccess] = useState<boolean | null>(null);
  
  // Safely cast the ID once and use the typed variable throughout
  const carId = id || "";
  const typedCarId = carId ? (carId as Id<"cars">) : null;

  // Analytics tracking - use a more specific type that matches the Convex API structure
  const logAnalytics = useMutation(api.analytics.logEvent) as unknown as (
    args: {
      type: string;
      carId?: Id<"cars">;
      partId?: Id<"parts">;
      visitorId?: string;
      visitorDevice?: string;
      referrer?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
      country?: string;
      city?: string;
    }
  ) => Promise<any>;

  // Fetch car details using the ID from params with comprehensive type handling
  const car = useQuery(api.cars.getCarById, typedCarId ? { carId: typedCarId } : "skip") as unknown as {
    _id: Id<"cars">;
    userId: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    variant?: string;
    description?: string;
    images: string[];
    isPublished: boolean;
    // Power and performance
    powerHp?: number;
    power?: string;
    torqueLbFt?: number;
    torque?: string;
    // Engine and drivetrain
    engine?: string;
    transmission?: string;
    drivetrain?: string;
    // Aesthetics
    bodyStyle?: string;
    exteriorColor?: string;
    interiorColor?: string;
    // Additional properties
    createdAt?: number;
    updatedAt?: number;
  } | undefined;
  
  // Check subscription access for the car owner
  useEffect(() => {
    async function checkAccess() {
      if (car && car.userId) {
        const access = await checkPublicProfileAccess(car.userId);
        setHasSubscriptionAccess(access);
      }
    }
    
    if (car) {
      checkAccess();
    }
  }, [car]);
  
  // Track car view when data loads and has subscription access
  useEffect(() => {
    if (car && typedCarId && hasSubscriptionAccess) {
      // Log car view analytics event
      logAnalytics({
        type: "car_view",
        carId: typedCarId,
        visitorId: crypto.randomUUID(), // Generate a random visitor ID
        visitorDevice: isMobile ? "mobile" : "desktop",
        referrer: document.referrer || undefined
      });
    }
  }, [car, typedCarId, logAnalytics, isMobile, hasSubscriptionAccess]);
  
  // Fetch parts/products for this car - same as authenticated view, but no edit features
  const parts = useQuery(api.parts.getCarParts, typedCarId ? { carId: typedCarId } : "skip") as any;
  
  // State for shop dialog - keeping consistent with authenticated version
  const [shopDialogOpen, setShopDialogOpen] = useState(false);

  // Handle image navigation - unified implementation for all uses
  const handleImageNavigation = {
    next: (eventData?: any) => {
      if (eventData && 'preventDefault' in eventData) {
        eventData.preventDefault();
        eventData.stopPropagation();
      }
      if (car?.images && car.images.length > 0) {
        setCurrentImageIndex((prev) => (prev === car.images!.length - 1 ? 0 : prev + 1));
      }
    },
    prev: (eventData?: any) => {
      if (eventData && 'preventDefault' in eventData) {
        eventData.preventDefault();
        eventData.stopPropagation();
      }
      if (car?.images && car.images.length > 0) {
        setCurrentImageIndex((prev) => (prev === 0 ? car.images!.length - 1 : prev - 1));
      }
    },
    thumbnail: (index: number) => {
      setCurrentImageIndex(index);
      
      // Ensure the image element gets updated immediately
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          // Double requestAnimationFrame for smoother transition
        });
      });
    }
  };
  
  // Setup swipe handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => handleImageNavigation.next(),
    onSwipedRight: () => handleImageNavigation.prev(),
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  if (!car) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If car is not published, don't show it on public page
  if (!car.isPublished) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Car Not Found</h1>
          <p className="text-xl text-gray-400 mb-4">This car is not available for public viewing.</p>
          <button 
            onClick={() => navigate(`/u/${username}`)} 
            className="text-blue-500 hover:text-blue-400 underline"
          >
            Return to Profile
          </button>
        </div>
      </div>
    );
  }
  
  // If subscription check is still loading
  if (hasSubscriptionAccess === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  // If owner's subscription is expired, show subscription required message
  if (!hasSubscriptionAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="text-center max-w-md mx-auto p-6 bg-slate-800 rounded-lg shadow-lg">
          <div className="mb-4 flex justify-center">
            <div className="p-3 bg-yellow-500/20 rounded-full">
              <LockIcon className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-4">Content Unavailable</h1>
          <p className="text-slate-300 mb-6">
            This profile's trial period has ended. The owner needs an active subscription to share their cars.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate(`/`)} 
              className="bg-blue-600 hover:bg-blue-700 inline-flex items-center"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Return Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Define content to be rendered in both mobile and desktop layouts
  const renderCarDetails = () => {
    return (
      <div className="flex flex-col h-full">
        {/* Header with back button */}
        <header className="flex items-center justify-between h-14 px-6 bg-slate-800/30 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-full bg-slate-700 p-2 hover:bg-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
          <div className="w-10"></div> {/* Empty div for flexbox alignment */}
        </header>

        {/* Main content */}
        <div className="flex-1 overflow-hidden px-4 md:px-8 pb-6">
          {!isMobile ? (
            // Desktop layout - full width with optimized proportions
            <div className="flex flex-row gap-8 h-full w-full max-w-screen-2xl mx-auto">
              {/* Left column: Image gallery (40%) */}
              <div className="w-[50%] lg:w-[40%]">
                <div {...swipeHandlers} className="w-full aspect-[16/10] bg-slate-800 rounded-lg shadow-lg relative overflow-hidden">
                  {car.images && car.images.length > 0 ? (
                    <>
                      {car.images[currentImageIndex].startsWith('http') ? (
                        <img 
                          src={car.images[currentImageIndex]} 
                          alt={`${car.make} ${car.model} main image`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CarImageWithUrl
                          storageId={car.images[currentImageIndex]}
                          alt={`${car.make} ${car.model} main image`}
                          className="w-full h-full object-cover"
                        />
                      )}
                      {car.images.length > 1 && (
                        <>
                          {/* Image Navigation Controls */}
                          <button
                            onClick={handleImageNavigation.prev}
                            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/60 hover:bg-black/80 transition-all"
                          >
                            <ChevronLeft className="h-5 w-5 text-white" />
                          </button>
                          <button
                            onClick={handleImageNavigation.next}
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/60 hover:bg-black/80 transition-all"
                          >
                            <ChevronRight className="h-5 w-5 text-white" />
                          </button>
                          
                          {/* Image Counter */}
                          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-sm text-white">
                            {currentImageIndex + 1} / {car.images.length}
                          </div>
                        </>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-800">
                      <p className="text-slate-400">No image available</p>
                    </div>
                  )}
                </div>
                
                {/* Desktop Thumbnails */}
                {car.images && car.images.length > 1 && (
                  <div className="grid grid-cols-6 gap-2 mt-4">
                    {car.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => handleImageNavigation.thumbnail(index)}
                        className={`flex-shrink-0 aspect-square rounded-md ${currentImageIndex === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'} transition-all`}
                      >
                        <CarImageWithUrl
                          storageId={image}
                          alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                          className="w-full h-full object-cover rounded-md"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right column: Car details (60%) */}
              <div className="w-[50%] lg:w-[60%] flex flex-col">
                {/* Title and Year */}
                <div>
                  <h1 className="text-3xl font-bold text-white mb-1">
                    {car.make} {car.model}
                  </h1>
                  <p className="text-lg text-slate-400 mb-3">{car.year}</p>
                  
                  {/* Description - independently scrollable */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white mb-1">Description</h3>
                    <div className="border-b border-slate-700 mb-2"></div>
                    <div className="max-h-[120px] overflow-y-auto pr-2 text-slate-400 text-sm">
                      {car.description ? (
                        car.description.split('\n').map((line, index) => {
                          // Check if line starts with list markers
                          const isListItem = /^\s*[-*•]\s+/.test(line);
                          const isNumberedItem = /^\s*\d+\.\s+/.test(line);
                          
                          if (isListItem) {
                            // Handle bullet list items
                            return (
                              <div key={index} className="flex items-start mb-2">
                                <span className="mr-2">•</span>
                                <span>{line.replace(/^\s*[-*•]\s+/, '')}</span>
                              </div>
                            );
                          } else if (isNumberedItem) {
                            // Handle numbered list items
                            const number = line.match(/^\s*(\d+)\.\s+/)?.[1] || '';
                            return (
                              <div key={index} className="flex items-start mb-2">
                                <span className="mr-2">{number}.</span>
                                <span>{line.replace(/^\s*\d+\.\s+/, '')}</span>
                              </div>
                            );
                          } else {
                            // Regular paragraph
                            return <p key={index} className="mb-2">{line}</p>;
                          }
                        })
                      ) : (
                        <p>No description available.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Specifications - grid layout */}
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-white mb-1">Specifications</h3>
                    <div className="border-b border-slate-700 mb-2"></div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Year:</span>
                        <span className="text-white">{car.year || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Horsepower:</span>
                        <span className="text-white">{car.powerHp || car.power || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Torque:</span>
                        <span className="text-white">{car.torqueLbFt || car.torque || 'N/A'}</span>
                      </div>
                      {car.engine && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Engine:</span>
                          <span className="text-white">{car.engine}</span>
                        </div>
                      )}
                      {car.transmission && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Transmission:</span>
                          <span className="text-white">{car.transmission}</span>
                        </div>
                      )}
                      {car.drivetrain && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Drivetrain:</span>
                          <span className="text-white">{car.drivetrain}</span>
                        </div>
                      )}
                      {car.bodyStyle && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Body Style:</span>
                          <span className="text-white">{car.bodyStyle}</span>
                        </div>
                      )}
                      {car.exteriorColor && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Exterior Color:</span>
                          <span className="text-white">{car.exteriorColor}</span>
                        </div>
                      )}
                      {car.interiorColor && (
                        <div className="flex justify-between">
                          <span className="text-slate-400">Interior Color:</span>
                          <span className="text-white">{car.interiorColor}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Mobile layout
            <>
              {/* Mobile Image Gallery */}
              <div className="relative w-full aspect-[4/3] bg-slate-800 mb-3">
                {car.images && car.images.length > 0 ? (
                  <>
                    {/* Swipeable container */}
                    <div
                      {...swipeHandlers}
                      className="w-full h-full"
                    >
                      {car.images[currentImageIndex].startsWith('http') ? (
                        <img 
                          src={car.images[currentImageIndex]} 
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <CarImageWithUrl
                          storageId={car.images[currentImageIndex]}
                          alt={`${car.make} ${car.model}`}
                          className="w-full h-full object-contain"
                          priority={true}
                          withFallback={true}
                        />
                      )}
                    </div>

                    {car.images.length > 1 && (
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 px-3 py-1 rounded-full text-sm text-white">
                        {currentImageIndex + 1} / {car.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-800">
                    <p className="text-slate-400">No image available</p>
                  </div>
                )}
              </div>
              
              {/* Image thumbnails */}
              {car.images && car.images.length > 1 && (
                <div className="flex space-x-2 mt-2 overflow-x-auto pb-1">
                  {car.images.map((image, index) => (
                    <button
                      key={index}
                      className={`w-24 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 ${index === currentImageIndex ? 'border-blue-500' : 'border-slate-700'}`}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`View image ${index + 1}`}
                    >
                      <CarImageWithUrl
                        storageId={image}
                        alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

                {/* Mobile Title & Info */}
              <div className="px-4 mt-6">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {car.make} {car.model}
                </h1>
                <p className="text-lg text-slate-400 mb-6">{car.year}</p>
                
                {/* Mobile Description */}
                {car.description && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-1">Description</h3>
                    <div className="border-b border-slate-700 mb-2"></div>
                    <div className="text-slate-400 mb-6">
                      {car.description.split('\n').map((line, index) => {
                        const isListItem = /^\s*[-*•]\s+/.test(line);
                        const isNumberedItem = /^\s*\d+\.\s+/.test(line);
                        
                        if (isListItem) {
                          return (
                            <div key={index} className="flex items-start mb-2">
                              <span className="mr-2">•</span>
                              <span>{line.replace(/^\s*[-*•]\s+/, '')}</span>
                            </div>
                          );
                        } else if (isNumberedItem) {
                          const number = line.match(/^\s*(\d+)\.\s+/)?.[1] || '';
                          return (
                            <div key={index} className="flex items-start mb-2">
                              <span className="mr-2">{number}.</span>
                              <span>{line.replace(/^\s*\d+\.\s+/, '')}</span>
                            </div>
                          );
                        } else {
                          return <p key={index} className="mb-2">{line}</p>;
                        }
                      })}
                    </div>
                  </div>
                )}
                
                {/* Mobile Specifications */}
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-1">Specifications</h3>
                  <div className="border-b border-slate-700 mb-2"></div>
                  <div className="space-y-3">
                    <div className="py-3 flex justify-between">
                      <span className="text-slate-400">Year</span>
                      <span className="text-white text-right">{car.year || 'N/A'}</span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-slate-400">Horsepower</span>
                      <span className="text-white text-right">{car.powerHp || car.power || 'N/A'}</span>
                    </div>
                    <div className="py-3 flex justify-between">
                      <span className="text-slate-400">Torque</span>
                      <span className="text-white text-right">{car.torqueLbFt || car.torque || 'N/A'}</span>
                    </div>
                    {car.engine && (
                      <div className="py-3 flex justify-between">
                        <span className="text-slate-400">Engine</span>
                        <span className="text-white text-right">{car.engine}</span>
                      </div>
                    )}
                    {car.transmission && (
                      <div className="py-3 flex justify-between">
                        <span className="text-slate-400">Transmission</span>
                        <span className="text-white text-right">{car.transmission}</span>
                      </div>
                    )}
                    {car.drivetrain && (
                      <div className="py-3 flex justify-between">
                        <span className="text-slate-400">Drivetrain</span>
                        <span className="text-white text-right">{car.drivetrain}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
          
          {/* Shop the Build Button */}
          {parts && parts.length > 0 && (
            <div className="px-4 md:px-6 mt-4">
              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-md text-white font-semibold text-center uppercase tracking-wide shadow-sm"
                onClick={() => navigate(`/u/${username}/car/${carId}/shop-build`)}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                SHOP THE BUILD
              </Button>
            </div>
          )}
        </div>
        
        {/* Shop the Build Dialog - matching authenticated component but readonly */}
        <Dialog open={shopDialogOpen} onOpenChange={setShopDialogOpen}>
          <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Shop the Build</span>
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Products and parts used in this {car.make} {car.model}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {parts && parts.length > 0 ? (
                <div className="divide-y divide-slate-800">
                  {parts.map((part) => (
                    <div key={part._id} className="py-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-white">{part.name}</h3>
                        <a 
                          href={part.purchaseUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors"
                          onClick={() => {
                            // Log product click analytics event
                            if (typedCarId) {
                              logAnalytics({
                                type: "product_click",
                                partId: part._id,
                                carId: typedCarId,
                                visitorId: crypto.randomUUID(), // Generate a random visitor ID
                                visitorDevice: isMobile ? "mobile" : "desktop"
                              });
                            }
                          }}
                        >
                          <span>View</span> 
                          <ExternalLink size={14} />
                        </a>
                      </div>
                      {part.description && (
                        <p className="text-sm text-slate-400 mt-1">{part.description}</p>
                      )}
                      {part.price && (
                        <p className="text-sm font-bold text-green-500 mt-1">${part.price.toFixed(2)}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-slate-400 py-8">
                  <p>No products available for this build.</p>
                </div>
              )}
            </div>

            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                onClick={() => setShopDialogOpen(false)}
                className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
              >
                Close
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // Use full screen width on all devices
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <div className="w-full h-full">
        {renderCarDetails()}
      </div>
    </div>
  );
};

export default PublicCarDetailsPage;
