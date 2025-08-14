import React, { useState, useEffect } from 'react';
import { Doc, Id } from '../../../convex/_generated/dataModel';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import SelectModDialog from './SelectModDialog';
import { toast } from 'sonner';

interface ImageHotspotEditorProps {
  car: Doc<"cars">;
}

const ImageHotspotEditor: React.FC<ImageHotspotEditorProps> = ({ car }) => {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHotspotCoords, setNewHotspotCoords] = useState<{x: number, y: number} | null>(null);

  const createHotspot = useMutation(api.modHotspots.create);

  const existingHotspots = useQuery(
    api.modHotspots.getByImageId,
    selectedImageId ? { imageId: selectedImageId } : 'skip'
  );

  const imageUrl = useQuery(
    api.files.getUrl,
    selectedImageId ? { storageId: selectedImageId } : 'skip'
  );

  useEffect(() => {
    if (car.images && car.images.length > 0 && !selectedImageId) {
      setSelectedImageId(car.images[0]);
    }
  }, [car.images, selectedImageId]);

  const handleImageAreaClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageUrl) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    setNewHotspotCoords({ x, y });
    setIsDialogOpen(true);
  };

  const handleSelectMod = async (part: Doc<"parts">) => {
    if (!newHotspotCoords || !selectedImageId) return;

    try {
      await createHotspot({
        carId: car._id,
        partId: part._id,
        imageId: selectedImageId,
        x: newHotspotCoords.x,
        y: newHotspotCoords.y,
      });
      toast.success(`Hotspot for "${part.name}" added successfully!`);
    } catch (error) {
      console.error('Failed to create hotspot:', error);
      toast.error('Failed to add hotspot.');
    } finally {
      setIsDialogOpen(false);
      setNewHotspotCoords(null);
    }
  };

  return (
    <>
      <div className="space-y-4 p-4 border rounded-lg bg-slate-800 border-slate-700">
        <div 
          className="relative bg-slate-900 w-full aspect-video rounded-lg overflow-hidden cursor-crosshair"
          onClick={handleImageAreaClick}
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Selected car view" className="w-full h-full object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-slate-400">Select an image below</p>
            </div>
          )}

          {existingHotspots?.map((hotspot) => (
            <div 
              key={hotspot._id}
              className="absolute w-4 h-4 bg-blue-500 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
              title={`Hotspot`}
            />
          ))}
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
          {car.images?.map((imageId) => (
            <ImageThumbnail 
              key={imageId} 
              imageId={imageId} 
              isSelected={selectedImageId === imageId} 
              onClick={() => setSelectedImageId(imageId)}
            />
          ))}
        </div>
      </div>

      <SelectModDialog 
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        carId={car._id}
        onSelectMod={handleSelectMod}
      />
    </>
  );
};

interface ImageThumbnailProps {
  imageId: string;
  isSelected: boolean;
  onClick: () => void;
}

const ImageThumbnail: React.FC<ImageThumbnailProps> = ({ imageId, isSelected, onClick }) => {
  const thumbnailUrl = useQuery(api.files.getUrl, { storageId: imageId });

  return (
    <button 
      onClick={onClick} 
      className={`aspect-square rounded-md overflow-hidden border-2 ${isSelected ? 'border-blue-500' : 'border-transparent'} hover:border-blue-400`}
    >
      {thumbnailUrl ? (
        <img src={thumbnailUrl} alt="Car thumbnail" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-slate-700 animate-pulse" />
      )}
    </button>
  );
};

export default ImageHotspotEditor;
