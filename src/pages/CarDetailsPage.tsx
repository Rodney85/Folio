import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { ArrowLeft, Pencil, ExternalLink, ShoppingBag, Trash2, Loader } from 'lucide-react';
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileLayout from '@/components/layout/MobileLayout';
import { useSwipeable } from 'react-swipeable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";

const CarDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Dialog states
  const [shopDialogOpen, setShopDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch car details using the ID from params
  const car = useQuery(api.cars.getCarById, { carId: id as Id<"cars"> });
  
  // Fetch parts/products for this car
  const parts = useQuery(api.parts.getCarParts, id ? { carId: id as Id<"cars"> } : "skip");
  
  // Delete car mutation
  const deleteCarMutation = useMutation(api.cars.deleteCar);
  
  // Track car view when data loads
  const logAnalytics = useMutation(api.analytics.logEvent);
  useEffect(() => {
    if (car) {
      logAnalytics({
        type: "car_view",
        carId: id as Id<"cars">,
        visitorDevice: isMobile ? "mobile" : "desktop",
        referrer: document.referrer || undefined,
        utmSource: new URLSearchParams(window.location.search).get("utm_source") || undefined,
        utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
        utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
      });
    }
  }, [car, id, logAnalytics]);
  
  // Define handlers for image navigation
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
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Shop dialog for parts that don't have external URLs
  const shopDialog = (
    <Dialog open={shopDialogOpen} onOpenChange={setShopDialogOpen}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Contact for Purchase</DialogTitle>
          <DialogDescription className="text-slate-400">
            This product is available through direct contact.
          </DialogDescription>
        </DialogHeader>
        <div className="text-white">
          <p>Please contact us to purchase this product or for more information.</p>
          <p className="mt-4">
            <a href="mailto:info@carfolio.app" className="text-blue-400 hover:underline">info@carfolio.app</a>
            <br />
            <a href="tel:+15551234567" className="text-blue-400 hover:underline">+1 (555) 123-4567</a>
          </p>
        </div>
        <Button 
          onClick={() => setShopDialogOpen(false)} 
          className="mt-4 w-full bg-blue-600 hover:bg-blue-700"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
  
  // Delete confirmation dialog
  const deleteDialog = (
    <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
      <DialogContent className="bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-white">Delete Car</DialogTitle>
          <DialogDescription className="text-slate-400">
            Are you sure you want to delete this car?
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end space-x-4 mt-4">
          <Button 
            variant="outline" 
            onClick={() => setDeleteDialogOpen(false)}
            className="bg-transparent border-slate-700 text-white hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={async () => {
              if (id) {
                await deleteCarMutation({ carId: id as Id<"cars"> });
                setDeleteDialogOpen(false);
                navigate(-1); // Go back after deletion
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  // Define the car details content
  const carDetailsContent = (
    <div className="flex flex-col h-full">
      {/* Header with conditional back button (only on mobile), edit button and delete button */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-slate-900 z-10 border-b border-slate-800 shadow-sm">
        {isMobile ? (
          <button 
            onClick={() => navigate(-1)}
            className="rounded-full p-2 bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
        ) : (
          <div>{/* Empty div to maintain flex spacing on tablet/desktop */}</div>
        )}
        <div className="flex space-x-2">
          <button 
            onClick={() => navigate(`/edit-car/${id}`)} 
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-md text-white text-sm flex items-center gap-1 transition-colors border border-slate-700"
          >
            <Pencil className="h-4 w-4 mr-1" />
            {!isMobile && 'Edit'}
          </button>
          <button 
            onClick={() => setDeleteDialogOpen(true)} 
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md text-white text-sm flex items-center gap-1 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            {!isMobile && 'Delete'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Desktop layout */}
        {!isMobile ? (
          <div className="flex flex-row gap-10 p-6">
            {/* Left column: Image gallery */}
            <div className="w-[55%]">
              <div {...swipeHandlers} className="w-full aspect-[4/3] bg-slate-800 rounded-lg shadow-md relative overflow-hidden">
                {car.images && car.images.length > 0 ? (
                  <>
                    <CarImageWithUrl
                      storageId={car.images[currentImageIndex]}
                      alt={`${car.make} ${car.model} main image`}
                      className="w-full h-full object-cover"
                    />
                    {car.images.length > 1 && (
                      <>
                        {/* Image Navigation Controls */}
                        <button
                          onClick={handleImageNavigation.prev}
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/60 hover:bg-black/80 transition-all"
                        >
                          <ArrowLeft className="h-5 w-5 text-white" />
                        </button>
                        <button
                          onClick={handleImageNavigation.next}
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 bg-black/60 hover:bg-black/80 transition-all"
                        >
                          <ArrowLeft className="h-5 w-5 text-white rotate-180" />
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

            {/* Right column: Car details */}
            <div className="w-[45%]">
              {/* Title, Year Badge, then Description */}
              <div>
                <h1 className="text-4xl font-bold text-white mb-4">
                  {car.make} {car.model}
                </h1>
                
                {/* Year Badge */}
                <div className="mb-5">
                  <span className="bg-slate-800 px-6 py-2 rounded-full text-white font-medium">{car.year || '2022'}</span>
                </div>
                
                {/* Car Specs Grid - Moved before description */}
                <div className="mb-8 mt-4">
                  <h3 className="text-2xl font-semibold text-white mb-4">Specifications</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <p className="text-slate-400 mb-2">Horsepower</p>
                      <p className="text-3xl font-semibold text-white">{car.powerHp || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 mb-2">Torque</p>
                      <p className="text-3xl font-semibold text-white">{car.torqueLbFt || 'N/A'}</p>
                    </div>
                    {/* Engine and Drive sections removed as requested */}
                  </div>
                </div>
                
                {/* Description with flexible height */}
                <div className="min-h-[60px] mb-6">
                  <div className="text-slate-400">
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
                      })
                    ) : (
                      <p>This is just a demo test to see if everything is working well.</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Price and contact sections removed as requested */}
              
              {/* Parts section will be shown elsewhere */}
            </div>
          </div>
        ) : (
          /* Mobile layout */
          <>
            {/* Mobile Image Gallery - Styled to match public view */}
            <div className="relative w-full aspect-[4/3] bg-slate-800 mb-3">
              {car.images && car.images.length > 0 ? (
                <>
                  {/* Swipeable container */}
                  <div
                    {...swipeHandlers}
                    className="w-full h-full"
                  >
                    <CarImageWithUrl
                      storageId={car.images[currentImageIndex]}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-contain"
                      priority={true}
                      withFallback={true}
                    />
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
            
            {/* Mobile Thumbnails - Styled to match public view */}
            {car.images && car.images.length > 1 && (
              <div className="grid grid-cols-6 gap-2 px-4 mb-6">
                {car.images.map((image, index) => (
                  <div 
                    key={index}
                    onClick={() => handleImageNavigation.thumbnail(index)}
                    className={`aspect-square rounded overflow-hidden cursor-pointer border-2 ${index === currentImageIndex ? 'border-blue-600' : 'border-transparent'}`}
                  >
                    <CarImageWithUrl
                      storageId={image}
                      alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Mobile Title & Info */}
            <div className="px-4 mt-6">
              <h1 className="text-3xl font-bold text-white mb-4">
                {car.make} {car.model}
              </h1>
              
              {/* Year Badge - Moved before description */}
              <div className="mb-5">
                <span className="bg-slate-800 px-6 py-2 rounded-full text-white font-medium">{car.year || '2022'}</span>
              </div>
              
              {/* Mobile Specifications - Moved before description */}
              <h3 className="text-xl font-semibold text-white mb-4">Specifications</h3>
            
              {/* Mobile Car Specs */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="border-b border-slate-700 py-4">
                    <p className="text-slate-400 mb-1">Horsepower</p>
                    <p className="text-2xl font-semibold text-white">{car.powerHp || 'N/A'}</p>
                  </div>
                  <div className="border-b border-slate-700 py-4">
                    <p className="text-slate-400 mb-1">Torque</p>
                    <p className="text-2xl font-semibold text-white">{car.torqueLbFt || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Description with flexible height */}
              <div className="min-h-[60px] mb-6">
                <h3 className="text-xl font-semibold text-white mb-4">Description</h3>
                <div className="text-slate-400">
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
                    })
                  ) : (
                    <p>This is just a demo test to see if everything is working well.</p>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Shop the Build Button */}
        {parts && parts.length > 0 && (
          <div className={`${isMobile ? 'px-4' : 'px-6'} ${isMobile ? 'mt-8 mb-8' : 'mt-6 mb-10'}`}>
            <button 
              onClick={() => {
                // Log analytics event for all parts
                logAnalytics({
                  type: "shop_build_click",
                  carId: id as Id<"cars">,
                  visitorDevice: isMobile ? "mobile" : "desktop",
                });
                
                // Navigate to the dedicated shop build page
                navigate(`/car/${id}/shop-build`);
              }}
              className="w-full bg-blue-600 hover:bg-blue-700 py-4 px-6 rounded-md text-white font-semibold text-lg flex items-center justify-center gap-2 shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.01]"
            >
              <ShoppingBag className="w-5 h-5" />
              Shop the build ({parts.length})
            </button>
          </div>
        )}
      </div>
    </div>
  );

  // Render the page using MobileLayout
  return (
    <>
      <MobileLayout>
        <div className="bg-slate-900 flex flex-col h-full">
          {carDetailsContent}
        </div>
      </MobileLayout>
      {shopDialog}
      {deleteDialog}
    </>
  );
};

export default CarDetailsPage;
