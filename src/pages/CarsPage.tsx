import React from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import CarGrid from "@/components/cars/CarGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useMediaQuery } from "../hooks/useMediaQuery";

const CarsPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");

  const carSlots = useQuery(api.freemium.getRemainingCarSlots);

  const handleAddCar = () => {
    if (carSlots && !carSlots.unlimited && carSlots.remaining <= 0) {
      navigate("/subscription");
    } else {
      navigate("/add-car");
    }
  };

  const isLimitReached = carSlots && !carSlots.unlimited && carSlots.remaining <= 0;

  // Content to render in both mobile and desktop layouts
  const content = (
    <div className={`container ${!isMobile ? 'max-w-6xl mx-auto' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">My Cars</h1>
          {carSlots && !carSlots.unlimited && (
            <p className="text-xs text-slate-400 mt-1">
              {carSlots.total - carSlots.remaining} / {carSlots.total} free slots used
            </p>
          )}
        </div>

        <Button
          size="sm"
          onClick={handleAddCar}
          variant={isLimitReached ? "secondary" : "default"}
          className={isLimitReached ? "opacity-90" : ""}
        >
          {isLimitReached ? (
            <>Unlock Unlimited</>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Add Car
            </>
          )}
        </Button>
      </div>

      {/* Car Grid with Instagram-style 3-column layout on larger screens */}
      <CarGrid instagramStyle={!isMobile} />
    </div>
  );

  // Conditionally wrap with MobileLayout only on mobile
  return isMobile ? (
    <MobileLayout>
      {content}
    </MobileLayout>
  ) : (
    // On desktop/tablet, content is directly rendered inside AppLayout (from App.tsx)
    <div className="bg-slate-900 text-white min-h-screen py-6">
      {content}
    </div>
  );
};

export default CarsPage;
