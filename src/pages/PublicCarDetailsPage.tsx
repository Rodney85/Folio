import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ArrowLeft, ExternalLink, ShoppingCart, LockIcon, CreditCard } from 'lucide-react';
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ErrorBoundary from '@/components/ErrorBoundary';

const PublicCarDetailsPage = () => {
  const navigate = useNavigate();
  const { id, username } = useParams<{ id: string, username: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [descExpanded, setDescExpanded] = useState(false);

  const carId = id ? (id as Id<"cars">) : null;

  const logAnalytics = useMutation(api.analytics.logEvent);

  const car = useQuery(api.cars.getCarById, carId ? { carId } : "skip");
  const parts = useQuery(api.parts.getCarParts, carId ? { carId } : "skip");

  useEffect(() => {
    if (car) {
      logAnalytics({
        type: "car_view",
        carId: car._id,
      });
    }
  }, [car, logAnalytics]);

  const handleImageNavigation = {
    prev: () => {
      if (car?.images && car.images.length > 0) {
        setCurrentImageIndex(prev => prev === 0 ? car.images!.length - 1 : prev - 1);
      }
    },
    next: () => {
      if (car?.images && car.images.length > 0) {
        setCurrentImageIndex(prev => prev === car.images!.length - 1 ? 0 : prev + 1);
      }
    },
    thumbnail: (index: number) => {
      setCurrentImageIndex(index);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleImageNavigation.next,
    onSwipedRight: handleImageNavigation.prev,
    trackMouse: true
  });

  if (car === undefined) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Loader className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (car === null) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4">
        <LockIcon className="h-16 w-16 text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-slate-400 text-center mb-6">
          This car is not available for public viewing or you do not have permission to view it.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go to Homepage
        </Button>
      </div>
    );
  }

  const hp = car?.powerHp;
  const tq = car?.torqueLbFt;

  const specItems = [
    { label: "Year", value: car?.year },
    { label: "Horsepower", value: hp },
    { label: "Torque", value: tq },
    { label: "Engine", value: car?.engine },
    { label: "Transmission", value: car?.transmission },
    { label: "Drivetrain", value: car?.drivetrain },
    { label: "Body Style", value: car?.bodyStyle },
    { label: "Exterior Color", value: car?.exteriorColor },
    { label: "Interior Color", value: car?.interiorColor }
  ].filter(item => item.value);

  return (
    <ErrorBoundary fallback={
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-900 text-white px-4">
        <LockIcon className="h-16 w-16 text-slate-400 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
        <p className="text-slate-400 text-center mb-6">
          There was an issue loading this car's details. Please try again.
        </p>
        <Button 
          onClick={() => navigate('/')}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go to Homepage
        </Button>
      </div>
    }>
      <div className="flex flex-col bg-slate-900 text-white">
        {/* Header */}
        <header className="flex items-center justify-between p-4 border-b border-slate-800">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            {!isMobile && 'Back'}
          </button>
          <h2 className="text-lg font-medium">Car Details</h2>
          <div className="w-16"></div>
        </header>

        {/* Main content */}
        <div className="flex-1 px-4 md:px-8 pb-6">
          {!isMobile ? (
            // Desktop layout - 50/50 split: image left, details right
            <div className="w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-2 gap-8 min-h-[600px]">
                {/* Left side - Image gallery (50%) */}
                <div className="flex flex-col">
                  <div {...swipeHandlers} className="w-full aspect-[4/3] bg-slate-800 rounded-xl shadow-lg relative overflow-hidden">
                    {car?.images && car.images.length > 0 ? (
                      <>
                        {car.images[currentImageIndex].startsWith('http') ? (
                          <img 
                            src={car.images[currentImageIndex]} 
                            alt={`${car.make} ${car.model} main image`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.warn(`Failed to load image: ${car.images[currentImageIndex]}`);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <CarImageWithUrl
                            storageId={car.images[currentImageIndex]}
                            alt={`${car.make} ${car.model} main image`}
                            className="w-full h-full object-cover"
                            withFallback={true}
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

              {/* Right side - Car details (50%) */}
              <div className="flex flex-col">
              {/* Title and Year */}
              <div>
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
                  {car?.make} {car?.model}
                </h1>
                <Separator className="my-2 bg-slate-800" />

                {/* Tabs for Specifications and Shop */}
                <Tabs defaultValue="specs" className="w-full mb-4">
                  <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
                    <TabsTrigger value="specs" className="data-[state=active]:bg-slate-700">
                      Specifications
                    </TabsTrigger>
                    <TabsTrigger value="shop" className="data-[state=active]:bg-slate-700">
                      Shop the Build
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="specs" className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {specItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2 px-3 bg-slate-800/50 rounded-lg">
                          <span className="text-slate-400 text-sm">{item.label}</span>
                          <span className="text-white font-medium">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="shop" className="mt-4">
                    {parts && parts.length > 0 ? (
                      <div className="space-y-3">
                        {parts.map((part, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                            <div>
                              <h4 className="text-white font-medium">{part.name}</h4>
                              <p className="text-slate-400 text-sm">{part.category}</p>
                              {part.price && (
                                <p className="text-green-400 font-medium">${part.price}</p>
                              )}
                            </div>
                            {part.purchaseUrl && (
                              <Button
                                onClick={() => window.open(part.purchaseUrl, '_blank')}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                <ExternalLink className="h-4 w-4 mr-1" />
                                Shop
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>No parts listed for this build</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                {/* Description - moved to last position with visual separation */}
                <div className="mt-8 pt-6 border-t border-slate-800">
                  <h3 className="text-xl font-bold text-white mb-3 bg-slate-800/50 px-4 py-2 rounded-lg">Description</h3>
                  <div className={`${descExpanded ? 'max-h-none' : 'max-h-[300px]'} overflow-y-auto pr-2 text-slate-300 text-sm leading-relaxed bg-slate-900/30 p-4 rounded-lg border border-slate-800/50`}>
                      <p className={`${!descExpanded ? 'line-clamp-3' : ''}`}>
                        {car.description}
                      </p>
                      {car.description.length > 150 && (
                        <button
                          onClick={() => setDescExpanded(!descExpanded)}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-1 transition-colors"
                        >
                          {descExpanded ? 'Show less' : 'Show more'}
                        </button>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        ) : (
          // Mobile layout - unchanged
          <div className="space-y-4">
            {/* Mobile Image Gallery */}
            <div {...swipeHandlers} className="relative aspect-[4/3] bg-slate-800 rounded-xl overflow-hidden">
              {car?.images && car.images.length > 0 ? (
                <>
                  <CarImageWithUrl
                    storageId={car.images[currentImageIndex]}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover"
                  />
                  {car.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded text-xs text-white">
                      {currentImageIndex + 1} / {car.images.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <p className="text-slate-400">No image available</p>
                </div>
              )}
            </div>

            {/* Mobile Car Details */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-3">
                {car.make} {car.model}
              </h1>
              
              {car.description && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <h3 className="text-lg font-bold text-white mb-3 bg-slate-800/50 px-3 py-2 rounded-lg">Description</h3>
                  <div className="text-slate-300 leading-relaxed text-sm bg-slate-900/30 p-3 rounded-lg border border-slate-800/50">
                    {car.description}
                  </div>
                </div>
              )}

              <Tabs defaultValue="specs" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                  <TabsTrigger value="specs">Specs</TabsTrigger>
                  <TabsTrigger value="shop">Shop</TabsTrigger>
                </TabsList>

                <TabsContent value="specs" className="mt-3">
                  <div className="space-y-2">
                    {specItems.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 px-3 bg-slate-800/50 rounded">
                        <span className="text-slate-400 text-sm">{item.label}</span>
                        <span className="text-white text-sm font-medium">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="shop" className="mt-3">
                  {parts && parts.length > 0 ? (
                    <div className="space-y-2">
                      {parts.map((part, index) => (
                        <div key={index} className="p-3 bg-slate-800/50 rounded">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className="text-white text-sm font-medium">{part.name}</h4>
                              <p className="text-slate-400 text-xs">{part.category}</p>
                              {part.price && (
                                <p className="text-green-400 text-sm font-medium">${part.price}</p>
                              )}
                            </div>
                            {part.purchaseUrl && (
                              <Button
                                onClick={() => window.open(part.purchaseUrl, '_blank')}
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 ml-2"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-slate-400">
                      <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No parts listed</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
      </div>
    </div>
    </ErrorBoundary>
  );
};

export default PublicCarDetailsPage;
