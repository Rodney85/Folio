import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import { ArrowLeft, Car, ExternalLink, ShoppingBag } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Loader } from 'lucide-react';
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';
import { Button } from '@/components/ui/button';
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

  // Fetch car details using the ID from params
  const car = useQuery(api.cars.getCarById, { carId: id as Id<"cars"> });
  
  // Fetch parts/products for this car - same as authenticated view, but no edit features
  const parts = useQuery(api.parts.getCarParts, id ? { carId: id as Id<"cars"> } : "skip");
  
  // State for shop dialog - keeping consistent with authenticated version
  const [shopDialogOpen, setShopDialogOpen] = useState(false);

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
    // Force immediate state update and rerender - matching authenticated component behavior
    setCurrentImageIndex(index);
    
    // Ensure the image element gets updated immediately - matching authenticated component behavior
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        // Double requestAnimationFrame for smoother transition
      });
    });
  };

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
      <div className="flex-1 overflow-auto pb-24">
        {/* Main image */}
        <div className={`w-full ${isMobile ? 'aspect-[4/5]' : 'aspect-[16/9]'} bg-slate-800 ${isMobile ? 'mb-3' : 'mb-6 rounded-lg shadow-lg'} relative`}>
        {car.images && car.images.length > 0 ? (
          <>
            {/* Main visible image with high priority - using same CarImageWithUrl component */}
            {car.images[currentImageIndex].startsWith('http') ? (
              <img 
                src={car.images[currentImageIndex]} 
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <CarImageWithUrl 
                key={`main-image-${currentImageIndex}`} // Force re-render on index change
                storageId={car.images[currentImageIndex]} 
                alt={`${car.make} ${car.model}`}
                className="w-full h-full object-cover"
                priority={true} // High priority for visible image
                withFallback={true}
              />
            )}
            
            {/* Navigation arrows for gallery */}
            {car.images.length > 1 && (
              <>
                <button 
                  onClick={handlePrevImage}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
                  aria-label="Previous image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button 
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-2"
                  aria-label="Next image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </>
            )}
          </>
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <Car className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
        </div>

        {/* Thumbnails - matching authenticated component */}
        {car.images && car.images.length > 1 && (
          <div className={`flex gap-2 px-4 ${isMobile ? 'mt-2' : 'mt-4'} overflow-x-auto pb-2`}>
            {car.images.map((image, index) => (
              <button
                key={index}
                onClick={() => handleThumbnailClick(index)}
                className={`flex-shrink-0 ${isMobile ? 'w-16 h-16' : 'w-24 h-24'} rounded-md ${currentImageIndex === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'} transition-all`}
              >
                {image.startsWith('http') ? (
                  <img
                    src={image}
                    alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <CarImageWithUrl
                    storageId={image}
                    alt={`${car.make} ${car.model} thumbnail ${index + 1}`}
                    className="w-full h-full object-cover rounded-md"
                  />
                )}
              </button>
            ))}
          </div>
        )}
        
        {/* Car info section - matching authenticated component */}
        <div className={`${isMobile ? 'px-4' : 'px-6'} mt-6 mb-8`}>
          <h1 className={`${isMobile ? 'text-2xl' : 'text-3xl'} font-bold text-white mb-1`}>
            {car.year} {car.make} {car.model}
          </h1>
          {car.power && (
            <p className="text-lg text-blue-400 font-medium mb-6">
              {car.power}
            </p>
          )}
        </div>
        
        {/* Performance section - matching authenticated component */}
        <div className={`${isMobile ? 'px-4' : 'px-6'} mb-8`}>
          <h3 className="text-slate-300 mb-4 text-lg font-medium">Performance</h3>
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-slate-800 p-4 rounded-lg">
              <h4 className="text-sm text-slate-400 mb-1">Horsepower</h4>
              <p className="text-white font-medium">{car.power || 'Not specified'}</p>
            </div>
          </div>
        </div>
        
        {/* Description section - matching authenticated component */}
        {car.description && (
          <div className={`${isMobile ? 'px-4' : 'px-6'} mb-8`}>
            <h3 className="text-slate-300 mb-4 text-lg font-medium">Description</h3>
            <p className={`${isMobile ? 'text-base' : 'text-lg'} text-slate-400 leading-relaxed ${!isMobile ? 'max-w-3xl' : ''}`}>
              {car.description}
            </p>
          </div>
        )}
        
        {/* Shop the Build Button - matching authenticated component but readonly */}
        {parts && parts.length > 0 && (
          <div className={`${isMobile ? 'px-4' : 'px-6'} mb-12`}>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-md font-semibold text-center uppercase tracking-wide shadow-md"
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
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      <div className={`${isMobile ? 'w-full' : 'max-w-7xl mx-auto w-full px-6 py-4'}`}>
        {carDetailsContent}
      </div>
    </div>
  );
};

export default PublicCarDetailsPage;
