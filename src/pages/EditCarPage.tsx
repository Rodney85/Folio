import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { Camera, X, PlusCircle, ShoppingBag, Loader2, Save } from "lucide-react";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { uploadToBackblaze } from "@/utils/storageService";
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';

const initialCarData = {
  make: "",
  model: "",
  year: "",
  package: "",
  engine: "",
  transmission: "",
  drivetrain: "",
  bodyStyle: "",
  exteriorColor: "",
  interiorColor: "",
  generation: "",
  powerHp: "",
  torqueLbFt: "",
  description: "",
};

const initialModData = { name: "", category: "", purchaseUrl: "", image: null as File | null };

const EditCarPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const convex = useConvex();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const modFileInputRef = useRef<HTMLInputElement>(null);

  // Query car data
  const car = useQuery(api.cars.getCarById, id ? { carId: id as any } : "skip");
  const parts = useQuery(api.parts.getCarParts, id ? { carId: id as any } : "skip");
  
  // Form state
  const [carData, setCarData] = useState(initialCarData);
  const [mods, setMods] = useState<(typeof initialModData)[]>([]);
  const [currentMod, setCurrentMod] = useState(initialModData);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  // Mutations
  const updateCar = useMutation(api.cars.updateCar);
  const createPart = useMutation(api.parts.createPart);
  const deletePart = useMutation(api.parts.deletePart);

  useEffect(() => {
    // Populate form data when car data is loaded
    if (car) {
      setCarData({
        make: car.make || "",
        model: car.model || "",
        year: car.year?.toString() || "",
        package: car.package || "",
        engine: car.engine || "",
        transmission: car.transmission || "",
        drivetrain: car.drivetrain || "",
        bodyStyle: car.bodyStyle || "",
        exteriorColor: car.exteriorColor || "",
        interiorColor: car.interiorColor || "",
        generation: car.generation || "",
        powerHp: car.powerHp || "",
        torqueLbFt: car.torqueLbFt || "",
        description: car.description || ""
      });
      
      if (car.images && car.images.length > 0) {
        setExistingImages(car.images);
      }
    }
    
    // Populate mods when parts data is loaded
    if (parts && parts.length > 0) {
      setMods(parts.map(part => ({
        name: part.name || "",
        category: part.category || "",
        purchaseUrl: part.purchaseUrl || "",
        image: null // We can't restore the original file, but we can show the existing image
      })));
    }
  }, [car, parts]);

  // File handling for car images
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = images.length + existingImages.length;
      
      if (totalImages + newFiles.length > 8) {
        toast({
          title: "Too many images",
          description: "You can upload a maximum of 8 images per car.",
          variant: "destructive"
        });
        return;
      }
      
      // Reverse the order so first selected appears first in the array
      const newImages = [...newFiles.reverse(), ...images];
      setImages(newImages);
      
      // Create preview URLs
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setImagePreviewUrls([...imagePreviewUrls, ...newPreviews]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = (index: number, isExisting = false) => {
    if (isExisting) {
      setExistingImages(existingImages.filter((_, i) => i !== index));
    } else {
      // Release object URL to avoid memory leaks
      URL.revokeObjectURL(imagePreviewUrls[index]);
      
      setImages(images.filter((_, i) => i !== index));
      setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
    }
  };

  // Form field handling
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCarData(prev => ({ ...prev, [name]: value }));
  };

  // Mod handling
  const handleModImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentMod(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const triggerModFileInput = () => modFileInputRef.current?.click();

  const handleModChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentMod(prev => ({ ...prev, [name]: value }));
  };

  const addModToList = () => {
    if (!currentMod.name || !currentMod.category) {
      toast({ title: "Missing Mod Info", description: "Please provide mod name and category.", variant: "destructive" });
      return;
    }
    setMods([...mods, currentMod]);
    setCurrentMod(initialModData);
  };

  const removeModFromList = (index: number) => {
    setMods(mods.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Upload new car images if any
      let uploadedImages: string[] = [];
      
      if (images.length > 0) {
        setUploading(true);
        
        // Upload new images
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const progress = (i / images.length) * 100;
          setUploadProgress(progress);
          
          // Generate a unique file name using timestamp and original name
          const timestamp = Date.now();
          const originalName = file.name.replace(/[^a-zA-Z0-9.]/g, "-");
          const fileName = `car-images/${id}/${timestamp}-${originalName}`;
          
          const storageId = await uploadToBackblaze(file, fileName, convex);
          uploadedImages.push(storageId);
        }
        
        setUploading(false);
        setUploadProgress(100);
      }
      
      // Combine existing and new images
      const allImages = [...existingImages, ...uploadedImages];
      
      // Update car data with comprehensive fields
      await updateCar({
        carId: id as any,
        make: carData.make,
        model: carData.model,
        year: parseInt(carData.year) || new Date().getFullYear(),
        package: carData.package,
        engine: carData.engine,
        transmission: carData.transmission,
        drivetrain: carData.drivetrain,
        bodyStyle: carData.bodyStyle,
        exteriorColor: carData.exteriorColor,
        interiorColor: carData.interiorColor,
        generation: carData.generation,
        powerHp: carData.powerHp,
        torqueLbFt: carData.torqueLbFt,
        description: carData.description,
        images: allImages
      });
      
      // Delete existing parts and add new ones
      if (parts && parts.length > 0) {
        for (const part of parts) {
          await deletePart({ partId: part._id });
        }
      }
      
      // Create new parts with mod images
      for (const mod of mods) {
        let imageId: string | undefined = undefined;
        if (mod.image) {
          // Upload mod image
          const fileName = `mods/${id}/${Date.now()}-${mod.image.name}`;
          const uploadedImageUrl = await uploadToBackblaze(mod.image, fileName, convex);
          imageId = uploadedImageUrl;
        }

        await createPart({
          carId: id as any,
          name: mod.name,
          category: mod.category,
          purchaseUrl: mod.purchaseUrl,
          image: imageId,
        });
      }
      
      toast({
        title: "Car updated successfully",
        description: "Your car has been updated with the new details.",
      });
      
      // Navigate to car details page
      navigate(`/car/${id}`);
    } catch (error) {
      console.error("Error updating car:", error);
      toast({
        title: "Error updating car",
        description: "There was a problem updating your car. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!car) {
    return (
      <ResponsiveLayout>
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading car details...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  // Handle case where car is null (not found)
  if (car === null) {
    return (
      <ResponsiveLayout>
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Car Not Found</h2>
            <p className="text-muted-foreground mb-4">The car you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate('/cars')} variant="outline">
              Back to Cars
            </Button>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

  const formGridClass = "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <ResponsiveLayout>
      {/* Glassmorphic Loading Modal */}
      {(uploading || loading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl w-80 shadow-xl">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-white font-medium text-lg mb-2">
                {loading && !uploading ? 'Updating your car...' : 'Uploading images...'}
              </h3>
              {uploadProgress > 0 && (
                <div className="w-full mt-2">
                  <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-300 ease-out" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-300 text-xs mt-1 text-center">
                    {uploadProgress}% Complete
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <h1 className="text-2xl font-bold mb-6">Edit Car</h1>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Car Images (up to 8)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Existing image previews */}
                {existingImages.map((storageId, index) => (
                  <div key={`existing-${index}`} className="relative aspect-[4/3]">
                    <CarImageWithUrl 
                      storageId={storageId} 
                      alt={`Existing ${index + 1}`} 
                      className="w-full h-full object-cover rounded-md" 
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage(index, true)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
                
                {/* New image previews */}
                {imagePreviewUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative aspect-[4/3]">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover rounded-md" 
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="destructive"
                      className="absolute top-1 right-1 h-6 w-6 rounded-full"
                      onClick={() => handleRemoveImage(index)}
                    >
                      <X size={14} />
                    </Button>
                  </div>
                ))}
                
                {/* Add image button - only show if less than 8 images */}
                {existingImages.length + images.length < 8 && (
                  <div 
                    className="relative aspect-[4/3] border-2 border-dashed border-slate-700 rounded-md flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
                    onClick={triggerFileInput}
                  >
                    <div className="text-center text-slate-500">
                      <Camera size={24} className="mx-auto"/>
                      <p className="text-xs mt-1">Add Image</p>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                multiple
                accept="image/*"
                className="hidden"
              />
            </div>

            {/* Car Details Section */}
            <div className="space-y-4">
              <h2 className="text-lg font-semibold border-b pb-2">Car Details</h2>
              <div className={formGridClass}>
                <div>
                  <Label htmlFor="make">Make</Label>
                  <Input id="make" name="make" value={carData.make} onChange={handleChange} placeholder="e.g., Toyota" />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" name="model" value={carData.model} onChange={handleChange} placeholder="e.g., Supra" />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Input id="year" name="year" type="number" value={carData.year} onChange={handleChange} placeholder="e.g., 1998" />
                </div>
                <div>
                  <Label htmlFor="package">Package</Label>
                  <Input id="package" name="package" value={carData.package} onChange={handleChange} placeholder="e.g., Premium" />
                </div>
                <div>
                  <Label htmlFor="engine">Engine</Label>
                  <Input id="engine" name="engine" value={carData.engine} onChange={handleChange} placeholder="e.g., 2JZ-GTE" />
                </div>
                <div>
                  <Label htmlFor="transmission">Transmission</Label>
                  <Input id="transmission" name="transmission" value={carData.transmission} onChange={handleChange} placeholder="e.g., 6-Speed Manual" />
                </div>
                <div>
                  <Label htmlFor="drivetrain">Drivetrain</Label>
                  <Input id="drivetrain" name="drivetrain" value={carData.drivetrain} onChange={handleChange} placeholder="e.g., RWD" />
                </div>
                <div>
                  <Label htmlFor="bodyStyle">Body Style</Label>
                  <Input id="bodyStyle" name="bodyStyle" value={carData.bodyStyle} onChange={handleChange} placeholder="e.g., Coupe" />
                </div>
                <div>
                  <Label htmlFor="exteriorColor">Exterior Color</Label>
                  <Input id="exteriorColor" name="exteriorColor" value={carData.exteriorColor} onChange={handleChange} placeholder="e.g., Alpine Silver" />
                </div>
                <div>
                  <Label htmlFor="interiorColor">Interior Color</Label>
                  <Input id="interiorColor" name="interiorColor" value={carData.interiorColor} onChange={handleChange} placeholder="e.g., Black Leather" />
                </div>
                <div>
                  <Label htmlFor="generation">Generation</Label>
                  <Input id="generation" name="generation" value={carData.generation} onChange={handleChange} placeholder="e.g., MK4" />
                </div>
                <div>
                  <Label htmlFor="powerHp">Power (HP)</Label>
                  <Input id="powerHp" name="powerHp" value={carData.powerHp} onChange={handleChange} placeholder="e.g., 326" />
                </div>
                <div>
                  <Label htmlFor="torqueLbFt">Torque (lb-ft)</Label>
                  <Input id="torqueLbFt" name="torqueLbFt" value={carData.torqueLbFt} onChange={handleChange} placeholder="e.g., 315" />
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={carData.description}
                onChange={handleChange}
                placeholder="Tell us about your car..."
                rows={4}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px] whitespace-pre-line"
              />
            </div>

            {/* Mods Section */}
            <div className="space-y-4 pt-4 border-t mt-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} />
                <h3 className="text-base font-medium">Shop the Build</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Add parts used in your build. These will be displayed as product links.
              </p>

              {/* Add Mod Form */}
              <div className="space-y-3 p-3 border rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4 items-center">
                  {/* Mod Image Upload */}
                  <div className="space-y-2">
                    <Label htmlFor="modImage">Image</Label>
                    <div 
                      className="relative aspect-square w-[100px] bg-slate-800 border-2 border-dashed border-slate-700 rounded-md flex items-center justify-center cursor-pointer hover:border-slate-500 transition-colors"
                      onClick={triggerModFileInput}
                    >
                      {currentMod.image ? (
                        <img src={URL.createObjectURL(currentMod.image)} alt="Mod preview" className="w-full h-full object-cover rounded-md" />
                      ) : (
                        <div className="text-center text-slate-500 p-2">
                          <Camera size={20} className="mx-auto"/>
                          <p className="text-xs mt-1">Add</p>
                        </div>
                      )}
                    </div>
                    <input
                      type="file"
                      ref={modFileInputRef}
                      onChange={handleModImageChange}
                      className="hidden"
                      accept="image/*"
                    />
                  </div>

                  {/* Mod Details */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="modName">Mod Name</Label>
                            <Input id="modName" name="name" value={currentMod.name} onChange={handleModChange} placeholder="e.g., Performance Air Filter" />
                        </div>
                        <div>
                            <Label htmlFor="modCategory">Category</Label>
                            <Input id="modCategory" name="category" value={currentMod.category} onChange={handleModChange} placeholder="e.g., Engine, Suspension" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="modUrl">Purchase URL</Label>
                        <Input id="modUrl" name="purchaseUrl" value={currentMod.purchaseUrl} onChange={handleModChange} placeholder="https://example.com/product" />
                    </div>
                  </div>
                </div>
                <Button type="button" onClick={addModToList} size="sm" className="w-full md:w-auto">
                  <PlusCircle size={16} className="mr-2" />
                  Add Mod
                </Button>
              </div>

              {/* Mods List */}
              {mods.length > 0 && (
                <div className="space-y-2 mt-4">
                  <Label>Added Mods</Label>
                  <div className="rounded-md border divide-y divide-slate-800">
                    {mods.map((mod, index) => (
                      <div key={index} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-4">
                          {mod.image ? (
                            <img src={URL.createObjectURL(mod.image)} alt={mod.name} className="w-12 h-12 object-cover rounded-md" />
                          ) : (
                            <div className="w-12 h-12 bg-slate-800 rounded-md flex items-center justify-center">
                              <ShoppingBag size={20} className="text-slate-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium">{mod.name}</p>
                            <p className="text-xs text-muted-foreground">{mod.category}</p>
                          </div>
                        </div>
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeModFromList(index)}>
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-md font-semibold text-center tracking-wide" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  {uploading ? `Uploading (${Math.round(uploadProgress)}%)` : "Updating Car..."}
                </>              ) : "Save Changes"}
            </Button>
          </form>
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default EditCarPage;
