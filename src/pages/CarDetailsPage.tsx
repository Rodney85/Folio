import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { ArrowLeft, Pencil, ExternalLink, ShoppingBag, ShoppingCart, Trash2, Loader } from 'lucide-react';
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileLayout from '@/components/layout/MobileLayout';
import { useSwipeable } from 'react-swipeable';
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  const [descExpanded, setDescExpanded] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Dialog states
  const [shopDialogOpen, setShopDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Fetch car details using the ID from params
  const carId = id ? id : "";
  // Safely cast the ID once and use the typed variable throughout
  const typedCarId = carId ? (carId as Id<"cars">) : null;
  const car = useQuery(api.cars.getCarById, typedCarId ? { carId: typedCarId } : "skip");
  
  // Fetch parts/products for this car
  const parts = useQuery(api.parts.getCarParts, typedCarId ? { carId: typedCarId } : "skip");
  
  // Delete car mutation
  const deleteCarMutation = useMutation(api.cars.deleteCar) as any;
  
  // Track car view when data loads
  const logAnalytics: any = useMutation(api.analytics.logEvent);
  useEffect(() => {
    if (car && typedCarId) {
      logAnalytics({
        type: "car_view",
        carId: typedCarId,
        visitorDevice: isMobile ? "mobile" : "desktop",
        referrer: document.referrer || undefined,
        utmSource: new URLSearchParams(window.location.search).get("utm_source") || undefined,
        utmMedium: new URLSearchParams(window.location.search).get("utm_medium") || undefined,
        utmCampaign: new URLSearchParams(window.location.search).get("utm_campaign") || undefined,
      });
    }
  }, [car, typedCarId, logAnalytics, isMobile]);
  
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
              if (typedCarId) {
                await deleteCarMutation({ carId: typedCarId });
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

  // Prepare spec items for clean label/value rows (matching PublicCarDetailsPage)
  const renderCarDetails = () => {
    const hp = car?.powerHp || car?.power;
    const tq = car?.torqueLbFt || car?.torque;
    const specItems = [
      { label: "Year", value: car?.year },
      { label: "Horsepower", value: hp },
      { label: "Torque", value: tq },
      car?.transmission ? { label: "Transmission", value: car.transmission } : null,
      car?.drivetrain ? { label: "Drivetrain", value: car.drivetrain } : null,
      car?.bodyStyle ? { label: "Body Style", value: car.bodyStyle } : null,
      car?.engine ? { label: "Engine", value: car.engine } : null,
      car?.exteriorColor ? { label: "Exterior Color", value: car.exteriorColor } : null,
      car?.interiorColor ? { label: "Interior Color", value: car.interiorColor } : null,
    ].filter(Boolean) as { label: string; value: string | number }[];

    return (
      <div className="flex flex-col bg-slate-900 text-white">
        {/* Header with edit/delete buttons */}
        <header className="p-4 flex items-center justify-between sticky top-0 bg-slate-900 z-50 border-b border-slate-800 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-full bg-slate-700 p-2 hover:bg-slate-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-white" />
          </button>
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
        <div className="flex-1 px-4 md:px-8 pb-6 pt-4">
          {!isMobile ? (
            // Desktop layout - side by side: images left, content right
            <div className="w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column - Images */}
                <div className="space-y-4">
                  {/* Main Image Gallery */}
                  <div className="w-full">
                    <div {...swipeHandlers} className="w-full aspect-[4/3] bg-slate-800 rounded-xl shadow-lg relative overflow-hidden">
                      {car?.images && car.images.length > 0 ? (
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
                                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-2.5 bg-black/50 hover:bg-black/70 ring-1 ring-white/20 shadow-lg transition"
                              >
                                <ArrowLeft className="h-5 w-5 text-white" />
                              </button>
                              <button
                                onClick={handleImageNavigation.next}
                                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2.5 bg-black/50 hover:bg-black/70 ring-1 ring-white/20 shadow-lg transition"
                              >
                                <ArrowLeft className="h-5 w-5 text-white rotate-180" />
                              </button>
                              
                              {/* Image Counter */}
                              <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur px-2.5 py-1.5 rounded-md text-xs text-white/90 ring-1 ring-white/10">
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
                    {car?.images && car.images.length > 1 && (
                      <div className="mt-3 flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                        {car.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => handleImageNavigation.thumbnail(index)}
                            className={`h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border transition ${currentImageIndex === index ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-700 hover:border-slate-500'}`}
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
                  </div>
                </div>

                {/* Right Column - Content */}
                <div className="space-y-6">

                  {/* Car Title and Details */}
                {/* Title and Year */}
                <div>
                  <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-2">
                    {car?.make} {car?.model}
                  </h1>
                  <Separator className="my-2 bg-slate-800" />

                  {/* Specifications / Shop Tabs */}
                  <div className="mb-2">
                    <Tabs defaultValue="specs" className="w-full">
                      <TabsList className="bg-transparent p-0 border-b border-slate-800 text-slate-400">
                        <TabsTrigger value="specs" className="px-0 mr-6 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none">Specifications</TabsTrigger>
                        <TabsTrigger value="shop" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none">Shop the Build</TabsTrigger>
                      </TabsList>
                      <TabsContent value="specs" className="mt-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-2 text-sm">
                          {specItems.map((item, i) => (
                            <div key={i} className="flex justify-between">
                              <span className="text-slate-400">{item.label}:</span>
                              <span className="text-white ml-2">{String(item.value) || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>
                      <TabsContent value="shop" className="mt-4">
                        {parts && parts.length > 0 ? (
                          <div className="divide-y divide-slate-800">
                            {parts.map((part: any) => (
                              <div key={part._id} className="py-4">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-white">{part.name}</h3>
                                  <a 
                                    href={part.purchaseUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors"
                                    onClick={() => {
                                      if (typedCarId) {
                                        logAnalytics({
                                          type: "product_click",
                                          partId: part._id,
                                          carId: typedCarId,
                                          visitorId: crypto.randomUUID(),
                                          visitorDevice: isMobile ? "mobile" : "desktop",
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
                      </TabsContent>
                    </Tabs>
                  </div>
                  
                  {/* Description - moved to last position with visual separation */}
                  <div className="mt-8 pt-6 border-t border-slate-800">
                    <h3 className="text-xl font-bold text-white mb-3 bg-slate-800/50 px-4 py-2 rounded-lg">Description</h3>
                    <div className={`${descExpanded ? 'max-h-none' : 'max-h-36'} overflow-y-auto pr-2 text-slate-300 text-sm leading-relaxed bg-slate-900/30 p-4 rounded-lg border border-slate-800/50`}>
                      {car?.description ? (
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
                        <p>This is just a demo test to see if everything is working well.</p>
                      )}
                    </div>
                    {car?.description && car.description.length > 260 && (
                      <button
                        type="button"
                        onClick={() => setDescExpanded((v) => !v)}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {descExpanded ? 'Show less' : 'Show more'}
                      </button>
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
              <div className="relative w-full aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden mb-4" style={{ marginTop: '20px' }}>
                {car?.images && car.images.length > 0 ? (
                  <>
                    <div {...swipeHandlers} className="w-full h-full">
                      {car.images[currentImageIndex].startsWith('http') ? (
                        <img 
                          src={car.images[currentImageIndex]} 
                          alt={`${car.make} ${car.model} main image`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <CarImageWithUrl
                          storageId={car.images[currentImageIndex]}
                          alt={`${car.make} ${car.model} main image`}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                    {car.images.length > 1 && (
                      <div className="absolute bottom-3 right-3 bg-black/60 px-3 py-1 rounded-full text-sm text-white">
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
              {car?.images && car.images.length > 1 && (
                <div className="flex gap-3 mt-2 overflow-x-auto pb-1 px-4 scrollbar-hide">
                  {car.images.map((image, index) => (
                    <button
                      key={index}
                      className={`w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border ${index === currentImageIndex ? 'border-blue-500 ring-2 ring-blue-500' : 'border-slate-700 hover:border-slate-500'}`}
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
                <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">
                  {car?.make} {car?.model}
                </h1>
                
                {/* Mobile Specifications / Shop Tabs */}
                <div className="mb-3">
                  <Tabs defaultValue="specs" className="w-full">
                    <TabsList className="bg-transparent p-0 border-b border-slate-800 text-slate-400">
                      <TabsTrigger value="specs" className="px-0 mr-6 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none">Specifications</TabsTrigger>
                      <TabsTrigger value="shop" className="px-0 py-2 border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:text-white data-[state=active]:bg-transparent data-[state=active]:shadow-none">Shop the Build</TabsTrigger>
                    </TabsList>
                    <TabsContent value="specs" className="mt-3">
                      <div className="space-y-2">
                        {specItems.map((item, i) => (
                          <div key={i} className="py-2 flex justify-between">
                            <span className="text-slate-400">{item.label}</span>
                            <span className="text-white text-right ml-4">{String(item.value) || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                    <TabsContent value="shop" className="mt-3">
                      {parts && parts.length > 0 ? (
                        <div className="divide-y divide-slate-800">
                          {parts.map((part: any) => (
                            <div key={part._id} className="py-4">
                              <div className="flex items-center justify-between">
                                <h3 className="font-medium text-white">{part.name}</h3>
                                <a 
                                  href={part.purchaseUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-400 flex items-center gap-1 hover:text-blue-300 transition-colors"
                                  onClick={() => {
                                    if (typedCarId) {
                                      logAnalytics({
                                        type: "product_click",
                                        partId: part._id,
                                        carId: typedCarId,
                                        visitorId: crypto.randomUUID(),
                                        visitorDevice: isMobile ? "mobile" : "desktop",
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
                    </TabsContent>
                  </Tabs>
                </div>
                
                {/* Mobile Description - moved to last position with visual separation */}
                {car?.description && (
                  <div className="mt-6 pt-4 border-t border-slate-800">
                    <h3 className="text-lg font-bold text-white mb-3 bg-slate-800/50 px-3 py-2 rounded-lg">Description</h3>
                    <div className={`${descExpanded ? 'max-h-none' : 'max-h-48'} overflow-y-auto pr-2 text-slate-300 leading-relaxed bg-slate-900/30 p-3 rounded-lg border border-slate-800/50`}>
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
                    {car.description && car.description.length > 260 && (
                      <button
                        type="button"
                        onClick={() => setDescExpanded((v) => !v)}
                        className="mt-2 text-blue-400 hover:text-blue-300 text-sm"
                      >
                        {descExpanded ? 'Show less' : 'Show more'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  // Render the page directly without nested layout
  return (
    <>
      <div className="bg-slate-900 flex flex-col h-full">
        {renderCarDetails()}
      </div>
      {shopDialog}
      {deleteDialog}
    </>
  );
};

export default CarDetailsPage;
