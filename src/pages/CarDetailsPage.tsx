import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ArrowLeft, ExternalLink, ShoppingBag, X } from 'lucide-react';
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';
import { Button } from '@/components/ui/button';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import MobileLayout from '@/components/layout/MobileLayout';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { Loader } from 'lucide-react';

const CarDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Fetch car details using the ID from params
  const car = useQuery(api.cars.getCarById, { carId: id as Id<"cars"> });
  
  // Fetch parts/products for this car
  const parts = useQuery(api.parts.getCarParts, id ? { carId: id as Id<"cars"> } : "skip");
  
  // Debug: Log parts data whenever it changes
  useEffect(() => {
    if (parts) {
      console.log('Parts data loaded:', parts);
      console.log('Parts count:', parts.length);
      console.log('Car ID used for query:', id);
    }
  }, [parts, id]);
  
  // State for shop dialog
  const [shopDialogOpen, setShopDialogOpen] = useState(false);

  if (!car) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (car.images && car.images.length > 0) {
      setCurrentImageIndex((prev) => (prev + 1) % car.images!.length);
    }
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (car.images && car.images.length > 0) {
      setCurrentImageIndex((prev) => (prev === 0 ? car.images!.length - 1 : prev - 1));
    }
  };

  const handleThumbnailClick = (index: number) => {
    // Force immediate state update and rerender
    setCurrentImageIndex(index);
    
    // Ensure the image element gets updated immediately
    window.requestAnimationFrame(() => {
      // This runs on the next animation frame to ensure UI is responsive
      window.requestAnimationFrame(() => {
        // Double requestAnimationFrame for smoother transition
      });
    });
  };

  // Define content to be rendered in both mobile and desktop layouts
  const carDetailsContent = (
    <div className="flex flex-col h-full">
      {/* Header with back button and edit button */}
      <header className="p-4 flex items-center justify-between sticky top-0 bg-slate-900 z-10 border-b border-slate-800 shadow-sm">
        <button 
          onClick={() => navigate(-1)}
          className="rounded-full p-2 bg-slate-800 border border-slate-700 shadow-sm flex items-center justify-center"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>
        <button 
          onClick={() => navigate(`/edit-car/${id}`)} 
          className="bg-slate-800 rounded-full px-5 py-2 text-sm font-medium shadow-sm border border-slate-700 text-white"
        >
          Edit
        </button>
      </header>

      {/* Main content */}
      <div className="flex-1 overflow-auto pb-24">
        {/* Main image */}
        <div className={`w-full ${isMobile ? 'aspect-[4/5]' : 'aspect-[16/9]'} bg-slate-800 ${isMobile ? 'mb-3' : 'mb-6 rounded-lg shadow-lg'} relative`}>
        {car.images && car.images.length > 0 ? (
          <>
            {/* Main visible image with high priority */}
            <CarImageWithUrl 
              key={`main-image-${currentImageIndex}`} // Force re-render on index change
              storageId={car.images[currentImageIndex]} 
              alt={`${car.make} ${car.model}`}
              className="w-full h-full object-cover"
              priority={true} // High priority for visible image
              withFallback={true}
            />
            
            {/* Preload all images for faster transitions */}
            <div className="hidden">
              {car.images.map((img, idx) => {
                return idx !== currentImageIndex ? (
                  <CarImageWithUrl 
                    key={`preload-${idx}`}
                    storageId={img} 
                    alt={`${car.make} ${car.model} preload ${idx}`}
                    className="hidden"
                    priority={false} // Low priority for preloaded images
                  />
                ) : null;
              })}
            </div>
            
            {/* Thumbnails */}
            {car.images && car.images.length > 1 && (
            <div className={`flex gap-2 px-4 ${isMobile ? 'mt-2' : 'mt-4'} overflow-x-auto pb-2`}>
              {car.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`flex-shrink-0 ${isMobile ? 'w-16 h-16' : 'w-24 h-24'} rounded-md ${currentImageIndex === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'} transition-all`}
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
            
            {/* Image navigation buttons for desktop */}
            {car.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
                  aria-label="Previous image"
                >
                  <ArrowLeft className="w-5 h-5 text-white" />
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-all"
                  aria-label="Next image"
                >
                  <ArrowLeft className="w-5 h-5 text-white transform rotate-180" />
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full bg-slate-800">
            <p className="text-slate-500">No images available</p>
          </div>
        )}
        </div>

        {/* Title & Info */}
        <div className={`${isMobile ? 'px-4' : 'px-0'} mt-4`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white`}>
            {car.make} {car.model}
          </h1>
          <p className="text-slate-400 text-lg">{car.year}</p>
        </div>

        {/* Performance Specs */}
        <div className={`${isMobile ? 'px-4' : 'px-0'} mt-6 mb-6`}>
          <h3 className="text-slate-300 mb-4 text-lg font-medium">Performance</h3>
          <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-4'} gap-4 text-center`}>
            <div className="bg-slate-800 p-3 rounded-lg shadow-md transition-transform hover:transform hover:scale-105">
              <p className="text-sm text-slate-400">Horsepower</p>
              <p className="font-medium text-lg">{car.power || '450 HP'}</p>
            </div>
            <div className="bg-slate-800 p-3 rounded-lg shadow-md transition-transform hover:transform hover:scale-105">
              <p className="text-sm text-slate-400">Torque</p>
              <p className="font-medium text-lg">550 Nm</p>
            </div>
            {!isMobile && (
              <>
                <div className="bg-slate-800 p-3 rounded-lg shadow-md transition-transform hover:transform hover:scale-105">
                  <p className="text-sm text-slate-400">0-60 mph</p>
                  <p className="font-medium text-lg">3.9s</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-lg shadow-md transition-transform hover:transform hover:scale-105">
                  <p className="text-sm text-slate-400">Top Speed</p>
                  <p className="font-medium text-lg">188 mph</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Description */}
        <div className={`${isMobile ? 'px-4' : 'px-0'} mb-6`}>
          <h3 className="text-slate-300 mb-4 text-lg font-medium">Description</h3>
          <p className={`${isMobile ? 'text-base' : 'text-lg'} text-slate-400 leading-relaxed ${!isMobile ? 'max-w-3xl' : ''}`}>
            {car.description || "To use Convex Sheets as your backend for lead generation and perfuming in your React waitlist app, you'll need to set up a connection between your React frontend and Google Sheets. Here's a comprehensive solution"}
          </p>
        </div>
        
        {/* Shop the Build Button - moved below description */}
        <div className={`${isMobile ? 'px-4' : 'px-0 max-w-md'} pb-24`}>
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-md font-semibold text-center uppercase tracking-wide"
            onClick={() => {
              setShopDialogOpen(true);
            }}
            disabled={!parts || parts.length === 0}
          >
            {parts && parts.length > 0 ? (
              <>
                <ShoppingBag className="mr-2 h-5 w-5" />
                SHOP THE BUILD ({parts.length})
              </>
            ) : "NO PRODUCTS AVAILABLE"}
          </Button>
        </div>
      </div>

      {/* Shop the Build Dialog */}
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

  // Conditionally wrap with MobileLayout only on mobile
  return isMobile ? (
    <MobileLayout>
      {carDetailsContent}
    </MobileLayout>
  ) : (
    // On desktop/tablet, content is directly rendered with improved layout
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto w-full px-6 py-4">
        {carDetailsContent}
      </div>
    </div>
  );
};

export default CarDetailsPage;
