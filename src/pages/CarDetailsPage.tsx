import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { cn } from '@/lib/utils';
import { ArrowLeft, Pencil, ExternalLink, ShoppingBag, ShoppingCart, Trash2, Loader } from 'lucide-react';
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';
import CarImageSwiper from '@/components/cars/CarImageSwiper';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileLayout from '@/components/layout/MobileLayout';
import { useSwipeable } from 'react-swipeable';
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SectionTransition, AnimatedItem } from "@/components/ui/page-transition";
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

  //  Fetch parts/products for this car
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
            <a href="mailto:support@carfolio.cc" className="text-blue-400 hover:underline">support@carfolio.cc</a>
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
      <div className="min-h-screen flex flex-col bg-transparent text-white">
        {/* Header with edit/delete buttons */}
        <header className="sticky top-0 p-4 flex items-center justify-between bg-[#020204] z-50 border-b border-white/5 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center rounded-full bg-white/10 p-2 hover:bg-white/20 transition-colors"
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
        <div className="flex-1 flex items-center px-4 md:px-8 py-6 md:py-8">
          {!isMobile ? (
            // Desktop layout - side by side: images left, content right
            <div className="w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Column - Images with Thumbnails */}
                <div className="space-y-4 sticky top-24">
                  {/* Main Image */}
                  <div className="w-full aspect-[4/3] bg-slate-800/30 rounded-2xl overflow-hidden shadow-2xl shadow-black/20 border border-slate-700/50">
                    {car?.images && car.images.length > 0 ? (
                      <CarImageWithUrl
                        storageId={car.images[currentImageIndex]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-contain transition-opacity duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <p className="text-slate-400">No image available</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  {car?.images && car.images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/30">
                      {car.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={cn(
                            "flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200",
                            currentImageIndex === index
                              ? "border-blue-500 ring-2 ring-blue-500/20 scale-105"
                              : "border-slate-700/50 hover:border-slate-600 opacity-60 hover:opacity-100"
                          )}
                        >
                          <CarImageWithUrl
                            storageId={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Column - Content */}
                <SectionTransition className="space-y-6" delay={200}>
                  {/* Car Title */}
                  <AnimatedItem>
                    <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
                      {car?.make} {car?.model}
                    </h1>
                    <p className="text-slate-400 text-lg">{car?.year}</p>
                  </AnimatedItem>

                  {/* Specifications / Shop Tabs */}
                  <div className="space-y-4">
                    <Tabs defaultValue="specs" className="w-full">
                      <TabsList className="w-full bg-transparent border-b border-slate-700 rounded-none h-auto p-0 justify-start gap-8">
                        <TabsTrigger
                          value="specs"
                          className="bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none px-0 pb-3 data-[state=active]:shadow-none text-slate-400 data-[state=active]:text-white font-medium"
                        >
                          Specifications
                        </TabsTrigger>
                        <TabsTrigger
                          value="shop"
                          className="bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none px-0 pb-3 data-[state=active]:shadow-none text-slate-400 data-[state=active]:text-white font-medium"
                        >
                          Shop the Build
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="specs" className="mt-6">
                        <div className="space-y-0 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {specItems.map((item, i) => (
                            <div key={i} className="flex justify-between items-center py-4 border-b border-slate-700/50 last:border-b-0 hover:opacity-80 transition-opacity duration-200">
                              <span className="text-slate-400 text-sm font-medium">{item.label}</span>
                              <span className="text-white font-semibold text-sm">{String(item.value) || 'N/A'}</span>
                            </div>
                          ))}
                        </div>
                      </TabsContent>

                      <TabsContent value="shop" className="mt-6">
                        {parts && parts.length > 0 ? (
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {parts.map((part: any) => (
                              <div key={part._id} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200">
                                <div className="flex items-start gap-4">
                                  {/* Product Image */}
                                  {part.image && (
                                    <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden bg-slate-800">
                                      <CarImageWithUrl
                                        storageId={part.image}
                                        alt={part.name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  {/* Product Details */}
                                  <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <h3 className="text-white font-semibold text-sm mb-1 truncate">{part.name}</h3>
                                      {part.description && (
                                        <p className="text-slate-400 text-xs mb-2 line-clamp-2">{part.description}</p>
                                      )}
                                      {part.price && (
                                        <p className="text-green-400 font-bold text-sm">${part.price.toFixed(2)}</p>
                                      )}
                                    </div>
                                    <a
                                      href={part.purchaseUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
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
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      Shop
                                    </a>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-slate-400 py-12 bg-slate-800/20 rounded-lg border border-slate-700/30">
                            <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No products available for this build.</p>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </div>

                  {/* Description */}
                  <div className="pt-6 border-t border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                    <div className={cn(
                      "overflow-y-auto pr-2 text-slate-300 text-sm leading-relaxed bg-slate-800/20 p-5 rounded-xl border border-slate-700/30 custom-scrollbar transition-all duration-300",
                      descExpanded ? 'max-h-[300px]' : 'max-h-[150px]'
                    )}>
                      {car?.description ? (
                        car.description.split('\n').map((line, index) => {
                          const isListItem = /^\s*[-*•]\s+/.test(line);
                          const isNumberedItem = /^\s*\d+\.\s+/.test(line);

                          if (isListItem) {
                            return (
                              <div key={index} className="flex items-start mb-2">
                                <span className="mr-2 text-blue-400">•</span>
                                <span>{line.replace(/^\s*[-*•]\s+/, '')}</span>
                              </div>
                            );
                          } else if (isNumberedItem) {
                            const number = line.match(/^\s*(\d+)\.\s+/)?.[1] || '';
                            return (
                              <div key={index} className="flex items-start mb-2">
                                <span className="mr-2 text-blue-400 font-medium">{number}.</span>
                                <span>{line.replace(/^\s*\d+\.\s+/, '')}</span>
                              </div>
                            );
                          } else {
                            return line.trim() ? <p key={index} className="mb-3">{line}</p> : null;
                          }
                        })
                      ) : (
                        <p className="text-slate-400 italic">No description available.</p>
                      )}
                    </div>
                    {car?.description && car.description.length > 200 && (
                      <button
                        type="button"
                        onClick={() => setDescExpanded((v) => !v)}
                        className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        {descExpanded ? '← Show less' : 'Show more →'}
                      </button>
                    )}
                  </div>
                </SectionTransition>
              </div>
            </div>
          ) : (
            // Mobile layout
            <div className="w-full space-y-6">
              {/* Mobile Image Gallery */}
              <div className="relative w-full">
                {/* Main Image */}
                <div className="relative w-full aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden" {...swipeHandlers}>
                  {car?.images && car.images.length > 0 ? (
                    <>
                      <CarImageWithUrl
                        storageId={car.images[currentImageIndex]}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-contain"
                      />
                      {/* Pagination indicator */}
                      {car.images.length > 1 && (
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                          <span className="text-white text-sm font-medium">
                            {currentImageIndex + 1} / {car.images.length}
                          </span>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-slate-400">No image available</p>
                    </div>
                  )}
                </div>

                {/* Thumbnail Strip */}
                {car?.images && car.images.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto mt-3 pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-800/30">
                    {car.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={cn(
                          "flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200",
                          currentImageIndex === index
                            ? "border-blue-500 ring-2 ring-blue-500/20"
                            : "border-slate-700/50 opacity-60"
                        )}
                      >
                        <CarImageWithUrl
                          storageId={image}
                          alt={`Thumbnail ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Title & Info */}
              <div className="space-y-6">
                {/* Car Title */}
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-white mb-1">
                    {car?.make} {car?.model}
                  </h1>
                  <p className="text-slate-400 text-base">{car?.year}</p>
                </div>

                {/* Mobile Specifications / Shop Tabs */}
                <Tabs defaultValue="specs" className="w-full">
                  <TabsList className="w-full bg-transparent border-b border-slate-700 rounded-none h-auto p-0 justify-start gap-6">
                    <TabsTrigger
                      value="specs"
                      className="bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none px-0 pb-3 data-[state=active]:shadow-none text-slate-400 data-[state=active]:text-white text-sm font-medium"
                    >
                      Specifications
                    </TabsTrigger>
                    <TabsTrigger
                      value="shop"
                      className="bg-transparent data-[state=active]:bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-500 rounded-none px-0 pb-3 data-[state=active]:shadow-none text-slate-400 data-[state=active]:text-white text-sm font-medium"
                    >
                      Shop the Build
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="specs" className="mt-4">
                    <div className="space-y-0">
                      {specItems.map((item, i) => (
                        <div key={i} className="flex justify-between items-center py-4 border-b border-slate-700/50 last:border-b-0">
                          <span className="text-slate-400 text-sm">{item.label}</span>
                          <span className="text-white font-semibold text-sm text-right ml-4">{String(item.value) || 'N/A'}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="shop" className="mt-4">
                    {parts && parts.length > 0 ? (
                      <div className="space-y-3">
                        {parts.map((part: any) => (
                          <div key={part._id} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
                            <div className="flex items-start gap-3">
                              {/* Product Image */}
                              {part.image && (
                                <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-slate-800">
                                  <CarImageWithUrl
                                    storageId={part.image}
                                    alt={part.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              {/* Product Details */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                  <h3 className="font-semibold text-white text-sm flex-1">{part.name}</h3>
                                  <a
                                    href={part.purchaseUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1 transition-colors flex-shrink-0"
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
                                    <ExternalLink className="h-3 w-3" />
                                    Shop
                                  </a>
                                </div>
                                {part.description && (
                                  <p className="text-xs text-slate-400 mb-2 line-clamp-2">{part.description}</p>
                                )}
                                {part.price && (
                                  <p className="text-sm font-bold text-green-400">${part.price.toFixed(2)}</p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-slate-400 py-8 bg-slate-800/20 rounded-lg border border-slate-700/30">
                        <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No products available for this build.</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Mobile Description */}
                <div className="pt-6 border-t border-slate-700/50">
                  <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                  <div className={cn(
                    "overflow-y-auto pr-2 text-slate-300 text-sm leading-relaxed bg-slate-800/20 p-4 rounded-xl border border-slate-700/30 transition-all duration-300",
                    descExpanded ? 'max-h-[400px]' : 'max-h-[200px]'
                  )}>
                    {car?.description ? (
                      car.description.split('\n').map((line, index) => {
                        const isListItem = /^\s*[-*•]\s+/.test(line);
                        const isNumberedItem = /^\s*\d+\.\s+/.test(line);

                        if (isListItem) {
                          return (
                            <div key={index} className="flex items-start mb-2">
                              <span className="mr-2 text-blue-400">•</span>
                              <span>{line.replace(/^\s*[-*•]\s+/, '')}</span>
                            </div>
                          );
                        } else if (isNumberedItem) {
                          const number = line.match(/^\s*(\d+)\.\s+/)?.[1] || '';
                          return (
                            <div key={index} className="flex items-start mb-2">
                              <span className="mr-2 text-blue-400 font-medium">{number}.</span>
                              <span>{line.replace(/^\s*\d+\.\s+/, '')}</span>
                            </div>
                          );
                        } else {
                          return line.trim() ? <p key={index} className="mb-3">{line}</p> : null;
                        }
                      })
                    ) : (
                      <p className="text-slate-400 italic">No description available.</p>
                    )}
                  </div>
                  {car?.description && car.description.length > 260 && (
                    <button
                      type="button"
                      onClick={() => setDescExpanded((v) => !v)}
                      className="mt-3 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors"
                    >
                      {descExpanded ? '← Show less' : 'Show more →'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render the page directly without nested layout
  return (
    <>
      <div className="bg-[#020204] flex flex-col h-full">
        {renderCarDetails()}
      </div>
      {shopDialog}
      {deleteDialog}
    </>
  );
};

export default CarDetailsPage;
