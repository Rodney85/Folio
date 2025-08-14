import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import AddModForm from '@/components/mods/AddModForm';
import ImageHotspotEditor from '@/components/mods/ImageHotspotEditor';
import { Loader } from 'lucide-react';

const AddModPage = () => {
  const { id } = useParams<{ id: string }>();
  const car = useQuery(api.cars.getCarById, { carId: id as Id<"cars"> });

  if (!car) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 text-white">
      <h1 className="text-2xl font-bold mb-2">Add Mods to {car.year} {car.make} {car.model}</h1>
      <p className="text-slate-400 mb-6">First, create a mod. Then, select an image and click to place a hotspot.</p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">1. Create a New Mod</h2>
          <AddModForm carId={car._id} />
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">2. Place Hotspot on an Image</h2>
          <ImageHotspotEditor car={car} />
        </div>
      </div>
    </div>
  );
};

export default AddModPage;
