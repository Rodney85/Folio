import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import AddModForm from '@/components/mods/AddModForm';
import ImageHotspotEditor from '@/components/mods/ImageHotspotEditor';
import { Loader, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUser } from "@clerk/clerk-react";
import { Crown } from "lucide-react";

const AddModPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const car = useQuery(api.cars.getCarById, { carId: id as Id<"cars"> });
  // @ts-ignore - Convex type instantiation issue
  const userProfile = useQuery(api.users.getProfile);
  const { user } = useUser();

  const isAdmin = Boolean(
    user?.publicMetadata?.role === "admin" ||
    user?.primaryEmailAddress?.emailAddress?.toLowerCase().endsWith("@carfolio.cc")
  );

  if (!car) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (userProfile === undefined) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userProfile?.isSubscribed && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-2xl">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">Premium Feature</h1>
          <p className="text-xl text-slate-300 mb-8">
            Adding mods to your build is available exclusively to Premium subscribers.
            Track every detail of your project with unlimited mod listings.
          </p>
          <Button
            size="lg"
            onClick={() => navigate("/subscription")}
            className="w-full sm:w-auto text-lg px-8"
          >
            Upgrade to Premium
          </Button>
        </div>
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
