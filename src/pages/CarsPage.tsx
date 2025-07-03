import React from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import CarGrid from "@/components/cars/CarGrid";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CarsPage = () => {
  const navigate = useNavigate();

  return (
    <MobileLayout>
      <div className="container p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">My Cars</h1>
          <Button size="sm" onClick={() => navigate("/add-car")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Car
          </Button>
        </div>

        {/* Car Grid with expandable details */}
        <CarGrid />
      </div>
    </MobileLayout>
  );
};

export default CarsPage;
