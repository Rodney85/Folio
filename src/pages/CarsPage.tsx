import React from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import CarGrid from "@/components/cars/CarGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMediaQuery } from "../hooks/useMediaQuery";

const CarsPage = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 767px)");

  // Content to render in both mobile and desktop layouts
  const content = (
    <div className={`container ${!isMobile ? 'max-w-6xl mx-auto' : 'p-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Cars</h1>
        <Button size="sm" onClick={() => navigate("/add-car")}>
          <Plus className="h-4 w-4 mr-2" />
          Add Car
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
