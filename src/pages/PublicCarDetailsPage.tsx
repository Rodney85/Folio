import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ArrowLeft, ExternalLink, ShoppingBag, ChevronLeft, ChevronRight } from 'lucide-react';
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

/**
 * Public car details page - viewable by unauthenticated users
 * URL format: /u/:username/car/:id
 */
const PublicCarDetailsPage = () => {
  const navigate = useNavigate();
  const { id, username } = useParams<{ id: string, username: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Analytics tracking
  const logAnalytics = useMutation(api.analytics.logEvent);

  // Fetch car details using the ID from params
  const car = useQuery(api.cars.getCarById, { carId: id as Id<"cars"> });
  
  // Track car view when data loads
  useEffect(() => {
    if (car) {
      // Log car view analytics event
      logAnalytics({
        type: "car_view",
        carId: id as Id<"cars">,
        visitorId: crypto.randomUUID(), // Generate a random visitor ID
        visitorDevice: navigator.userAgent,
        referrer: document.referrer || null
      });
    }
  }, [car, id, logAnalytics]);
  
  // Fetch parts/products for this car - same as authenticated view, but no edit features
  const parts = useQuery(api.parts.getCarParts, id ? { carId: id as Id<"cars"> } : "skip");
  
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

  // Image navigation handlers are defined at the top of component as handleImageNavigation object

  // Define content to be rendered in both mobile and desktop layouts - matching authenticated component layout
  const carDetailsContent = (
    <div className="flex flex-col h-full">
      {/* Header with back button - similar to authenticated but without Edit button */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-slate-900 z-10 border-b border-slate-800 shadow-sm">
        <button 
          onClick={() => navigate(`/u/${username}`)}
          className="rounded-full p-2 bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        {/* Removed car name from header as requested */}
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-auto flex flex-col">
        {/* Main image with swipe gestures */}
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
                    key={`main-image-${currentImageIndex}`} 
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
          <div className="grid grid-cols-6 gap-2 px-4 mb-6">
            {car.images.map((imageId, index) => (
              <div 
                key={imageId} 
                onClick={() => handleImageNavigation.thumbnail(index)}
                className={`aspect-square rounded overflow-hidden cursor-pointer border-2 ${index === currentImageIndex ? 'border-blue-600' : 'border-transparent'}`}
              >
                <CarImageWithUrl 
                  storageId={imageId} 
                  alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Car make, model, year - Matching authenticated layout */}
        <div className="px-4 mb-8">
          <h1 className="text-2xl font-bold text-white">{car.year} {car.make} {car.model}</h1>
          
          {/* Specifications section - moved above description */}
          <h3 className="text-slate-300 mt-6 mb-4 text-lg font-medium">Specifications</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-6 bg-slate-800 rounded-lg">
              <h3 className="text-sm text-slate-400 mb-1">Horsepower</h3>
              <p className="text-2xl font-bold text-white">{car.power || '–'} Hp</p>
            </div>
            <div className="p-6 bg-slate-800 rounded-lg">
              <h3 className="text-sm text-slate-400 mb-1">Torque</h3>
              <p className="text-2xl font-bold text-white">{car.torque !== undefined && car.torque !== null ? `${car.torque} Nm` : '– Nm'}</p>
            </div>
          </div>
        </div>
        
        {/* Description section - matching authenticated component */}
        {car.description && (
          <div className="px-4 mb-8">
            <h3 className="text-slate-300 mb-4 text-lg font-medium">Description</h3>
            <div className={`${isMobile ? 'text-base' : 'text-lg'} text-slate-400 leading-relaxed ${!isMobile ? 'max-w-3xl' : ''}`}>
              {car.description.split('\n').map((line, index) => {
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
                  const number = line.match(/^\s*(\d+)\.\s+/)[1];
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
              })}
            </div>
          </div>
        )}
        
        {/* Shop the Build Button - matching authenticated component but readonly */}
        {parts && parts.length > 0 && (
          <div className="px-4 mt-auto"> {/* Using mt-auto instead of pb-24 to push to bottom */}
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-md font-semibold text-center uppercase tracking-wide mb-6"
              onClick={() => {
                setShopDialogOpen(true);
              }}
            >
              <ShoppingBag className="mr-2 h-5 w-5" />
              SHOP THE BUILD ({parts.length})
            </Button>
          </div>
        )}
      </div>

      {/* Shop the Build Dialog - matching authenticated component but readonly */}
      <Dialog open={shopDialogOpen} onOpenChange={setShopDialogOpen}>
        <DialogContent className="sm:max-w-md bg-slate-900 border border-slate-800 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
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
                          logAnalytics({
                            type: "product_click",
                            partId: part._id,
                            carId: id as Id<"cars">,
                            visitorId: crypto.randomUUID(), // Generate a random visitor ID
                            visitorDevice: navigator.userAgent
                          });
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

  // Conditionally wrap with mobile layout only on mobile - matching authenticated component
  return (
    <div className="flex flex-col min-h-screen bg-slate-900 text-white">
      <div className={`${isMobile ? 'w-full' : 'max-w-7xl mx-auto w-full px-6 py-4'} h-full`}>
        {carDetailsContent}
      </div>
    </div>
  );
};

export default PublicCarDetailsPage;
