import React from 'react';
import { ImageSwiper } from '@/components/ui/image-swiper';
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';

interface CarImageSwiperProps {
  images: string[];
  carName: string;
  className?: string;
  isMobile?: boolean;
}

export const CarImageSwiper: React.FC<CarImageSwiperProps> = ({
  images,
  carName,
  className = '',
  isMobile = false
}) => {
  // Filter out empty images
  const validImages = images.filter(img => img && img.trim());

  // If no valid images, show placeholder
  if (!validImages.length) {
    return (
      <div className={`flex items-center justify-center bg-slate-800 rounded-xl ${className}`}>
        <p className="text-slate-400">No images available</p>
      </div>
    );
  }

  // Custom image renderer for CarImageWithUrl integration
  const renderImage = (imageSrc: string, index: number) => {
    // For Backblaze URLs, use direct img tag
    if (imageSrc.startsWith('http')) {
      return (
        <img
          src={imageSrc}
          alt={`${carName} image ${index + 1}`}
          className="w-full h-full object-contain select-none pointer-events-none"
          draggable={false}
        />
      );
    }
    // For Convex storage IDs, use CarImageWithUrl
    return (
      <CarImageWithUrl
        storageId={imageSrc}
        alt={`${carName} image ${index + 1}`}
        className="w-full h-full object-contain"
        withFallback={true}
      />
    );
  };

  return (
    <div className={`relative ${className}`}>
      <ImageSwiper
        images={validImages}
        cardWidth={isMobile ? 280 : 350}
        cardHeight={isMobile ? 200 : 280}
        className="w-full"
        renderImage={renderImage}
      />
    </div>
  );
};

export default CarImageSwiper;
