import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ArrowLeft, ExternalLink, ShoppingCart, LockIcon, CreditCard, ChevronLeft, ShoppingBag } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Loader } from 'lucide-react';
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';
import CarImageSwiper from '@/components/cars/CarImageSwiper';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
  const [activeTab, setActiveTab] = useState('specs');
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [descExpanded, setDescExpanded] = useState(false);

  const carId = id ? (id as Id<"cars">) : null;

  const logAnalytics = useMutation(api.analytics.logEvent);

  const car = useQuery(api.cars.getCarById, carId ? { carId } : "skip");
  const parts = useQuery(api.parts.getCarParts, carId ? { carId } : "skip");

  // Setup swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      if (car?.images && car.images.length > 0) {
        setCurrentImageIndex((prev) => (prev === car.images!.length - 1 ? 0 : prev + 1));
      }
    },
    onSwipedRight: () => {
      if (car?.images && car.images.length > 0) {
        setCurrentImageIndex((prev) => (prev === 0 ? car.images!.length - 1 : prev - 1));
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
  });

  useEffect(() => {
    if (car) {
      logAnalytics({
        type: "car_view",
        carId: car._id,
      });
    }
  }, [car, logAnalytics]);

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
      <div className="min-h-screen bg-slate-900 text-white">
        {/* Header */}
        <header className="sticky top-0 bg-slate-900 border-b border-slate-800 px-6 py-4 z-50">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        </header>

        {/* Main content */}
        <div className="flex-1 px-6 py-8">
          {!isMobile ? (
            // Desktop layout - image left with thumbnails, details right
            <div className="w-full max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left side - Image gallery with thumbnails */}
                <div className="space-y-4 sticky top-24">
                  {/* Main image */}
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

                  {/* Thumbnail strip */}
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

                {/* Right side - Car details */}
                <div className="space-y-6">
                  {/* Title */}
                  <div>
                    <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                      {car?.make} {car?.model}
                    </h1>
                    <p className="text-slate-400 text-lg">{car?.year}</p>
                  </div>

                  {/* Custom Tabs */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-8 border-b border-slate-700">
                      <button
                        onClick={() => setActiveTab('specs')}
                        className={cn(
                          "pb-3 px-0 text-sm font-medium transition-colors relative",
                          activeTab === 'specs'
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        )}
                      >
                        Specifications
                        {activeTab === 'specs' && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab('shop')}
                        className={cn(
                          "pb-3 px-0 text-sm font-medium transition-colors relative flex items-center gap-2",
                          activeTab === 'shop'
                            ? 'text-white'
                            : 'text-slate-400 hover:text-slate-200'
                        )}
                      >
                        Shop the Build
                        <ShoppingCart className="h-4 w-4" />
                        {activeTab === 'shop' && (
                          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
                        )}
                      </button>
                    </div>

                    {/* Tab Content */}
                    {activeTab === 'specs' ? (
                      <div className="space-y-0 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {specItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-4 border-b border-slate-700/50 last:border-b-0 hover:opacity-80 transition-opacity duration-200">
                            <span className="text-slate-400 text-sm font-medium">{item.label}</span>
                            <span className="text-white font-semibold text-sm">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      parts && parts.length > 0 ? (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {parts.map((part, index) => (
                            <div key={index} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg hover:bg-slate-800/50 hover:border-slate-600/50 transition-all duration-200">
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
                                    <h4 className="text-white font-semibold text-sm mb-1 truncate">{part.name}</h4>
                                    {part.category && (
                                      <p className="text-slate-500 text-xs mb-1">{part.category}</p>
                                    )}
                                    {part.price && (
                                      <p className="text-green-400 font-bold text-sm">${part.price}</p>
                                    )}
                                  </div>
                                  {part.purchaseUrl && (
                                    <button
                                      onClick={() => {
                                        window.open(part.purchaseUrl, '_blank');
                                        logAnalytics({
                                          type: "product_click",
                                          partId: part._id,
                                          carId: car._id,
                                        });
                                      }}
                                      className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 transition-colors flex-shrink-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30"
                                    >
                                      <ExternalLink className="h-3.5 w-3.5" />
                                      Shop
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-slate-400 bg-slate-800/20 rounded-lg border border-slate-700/30">
                          <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No parts listed for this build</p>
                        </div>
                      )
                    )}
                  </div>

                  {/* Description Section */}
                  <div className="pt-6 border-t border-slate-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Description</h3>
                    <div className={cn(
                      "overflow-y-auto pr-2 text-slate-300 text-sm leading-relaxed bg-slate-800/20 p-5 rounded-xl border border-slate-700/30 custom-scrollbar transition-all duration-300",
                      descExpanded ? 'max-h-[300px]' : 'max-h-[150px]'
                    )}>
                      {car.description ? (
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
                        <p className="text-slate-400 italic">No description available for this vehicle.</p>
                      )}
                    </div>
                    {car.description && car.description.length > 200 && (
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

                {/* Mobile Car Details */}
                <div className="space-y-6">
                  {/* Car Title */}
                  <div>
                    <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
                      {car.make} {car.model}
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
                        {specItems.map((item, index) => (
                          <div key={index} className="flex justify-between items-center py-4 border-b border-slate-700/50 last:border-b-0">
                            <span className="text-slate-400 text-sm">{item.label}</span>
                            <span className="text-white font-semibold text-sm text-right ml-4">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="shop" className="mt-4">
                      {parts && parts.length > 0 ? (
                        <div className="space-y-3">
                          {parts.map((part, index) => (
                            <div key={index} className="p-4 bg-slate-800/30 border border-slate-700/30 rounded-lg">
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
                                    <div className="flex-1 min-w-0">
                                      <h4 className="text-white font-semibold text-sm mb-1 truncate">{part.name}</h4>
                                      {part.category && (
                                        <p className="text-slate-500 text-xs mb-1">{part.category}</p>
                                      )}
                                    </div>
                                    {part.purchaseUrl && (
                                      <button
                                        onClick={() => {
                                          window.open(part.purchaseUrl, '_blank');
                                          logAnalytics({
                                            type: "product_click",
                                            partId: part._id,
                                            carId: car._id,
                                          });
                                        }}
                                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg text-white text-xs font-medium flex items-center gap-1 transition-colors flex-shrink-0"
                                      >
                                        <ExternalLink className="h-3 w-3" />
                                        Shop
                                      </button>
                                    )}
                                  </div>
                                  {part.price && (
                                    <p className="text-sm font-bold text-green-400">${part.price}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-slate-400 py-8 bg-slate-800/20 rounded-lg border border-slate-700/30">
                          <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No parts listed for this build</p>
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
                      {car.description ? (
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
                        <p className="text-slate-400 italic">No description available for this vehicle.</p>
                      )}
                    </div>
                    {car.description && car.description.length > 260 && (
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
    </ErrorBoundary>
  );
};

export default PublicCarDetailsPage;
