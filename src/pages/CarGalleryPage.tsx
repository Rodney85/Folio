import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { LayoutGrid } from "@/components/ui/layout-grid";
import CarImageWithUrl from "@/components/cars/CarImageWithUrl";
import { Button } from "@/components/ui/button";

const CarGalleryPage = () => {
  const { id } = useParams(); // The param is named 'id' based on the route path '/car/:id/gallery'
  const navigate = useNavigate();

  // Make sure we have a valid ID and explicitly pass it as carId
  const car: any = useQuery(api.cars.getCarById as any, { carId: id as any });

  if (!car || !car.images || car.images.length === 0) {
    return (
      <div className="flex flex-col h-screen bg-slate-900 text-white">
        <div className="py-4 px-6 flex items-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="bg-slate-800 shadow-sm border border-slate-700 text-white"
          >
            <ArrowLeft className="text-white" />
          </Button>
        </div>
      </div>
    );
  }

  // Create cards array for LayoutGrid
  const cards = car.images.map((imageId, index) => {
    // Create a data URL for the component to use as a placeholder
    const placeholderUrl = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3C/svg%3E`;

    return {
      id: index,
      className: "h-80 w-full", // Fixed height for better layout
      thumbnail: placeholderUrl, // Placeholder until the image loads
      realStorageId: imageId, // Store the actual storage ID
      content: (
        <div className="flex flex-col gap-2">
          <p className="font-bold text-white text-xl">
            {car.make} {car.model}
          </p>
          <p className="text-sm text-white/80">
            {`Image ${index + 1} of ${car.images.length}`}
          </p>
        </div>
      )
    };
  });

  return (
    <div className="flex flex-col h-screen bg-slate-900 text-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b border-slate-800 bg-slate-900 shadow-sm sticky top-0 z-10">
        <Button
          variant="outline"
          size="icon"
          className="bg-slate-800 shadow-sm border border-slate-700 text-white"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </Button>
        <h2 className="flex-1 text-center font-semibold">
          {car.make} {car.model} - Gallery
        </h2>
        <div className="w-8" /> {/* Empty div for alignment */}
      </div>

      {/* Image Grid */}
      <div className="flex-1 overflow-auto">
        <LayoutGridWithImages cards={cards} car={car} />
      </div>
    </div>
  );
};

// Wrapper component for LayoutGrid to handle image loading
const LayoutGridWithImages = ({ cards, car }: { cards: any[], car: any }) => {
  // Process the cards to include actual image components
  const processedCards = cards.map(card => {
    return {
      ...card,
      // Replace the thumbnail with an actual image component
      thumbnail: (
        <div className="w-full h-full relative">
          <CarImageWithUrl
            storageId={card.realStorageId}
            alt={`${car.make} ${car.model} image ${card.id + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
      )
    };
  });

  return (
    <div className="h-full">
      <LayoutGrid cards={processedCards} />
    </div>
  );
};

export default CarGalleryPage;
