import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { Camera, X, PlusCircle, ShoppingBag, Loader2, Link } from "lucide-react";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { uploadToBackblaze } from "@/utils/storageService";
import { trackCarAdded } from "@/utils/analytics";

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

export default function AddCarPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const convex = useConvex();
  const createCar = useMutation(api.cars.createCar);
  const createPart = useMutation(api.parts.createPart);

  const [carData, setCarData] = useState(initialCarData);
  const [mods, setMods] = useState<(typeof initialModData)[]>([]);
  const [currentMod, setCurrentMod] = useState(initialModData);
  const modFileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCarData((prev) => ({ ...prev, [name]: value }));
  };

  const handleModImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCurrentMod(prev => ({ ...prev, image: e.target.files![0] }));
    }
  };

  const triggerModFileInput = () => modFileInputRef.current?.click();

  const handleModChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentMod((prev) => ({ ...prev, [name]: value }));
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const totalImages = [...images, ...newFiles].slice(0, 8);
      setImages(totalImages);
      const newPreviewUrls = totalImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(newPreviewUrls);
    }
  };

  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    const updatedUrls = imagePreviewUrls.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviewUrls[index]);
    setImagePreviewUrls(updatedUrls);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (images.length === 0) {
      toast({ title: "No images", description: "Please upload at least one image.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      setUploading(true);
      const uploadedImageUrls: string[] = [];
      for (let i = 0; i < images.length; i++) {
        const fileName = `car-${Date.now()}-${i}.${images[i].name.split('.').pop()}`;
        const imageUrl = await uploadToBackblaze(images[i], fileName, convex);
        uploadedImageUrls.push(imageUrl);
        setUploadProgress((i + 1) / images.length * 100);
      }
      setUploading(false);

      const carResult = await createCar({
        ...carData,
        year: parseInt(carData.year, 10) || 0,
        images: uploadedImageUrls,
        isPublished: true,
      });

      const carId = carResult.carId;
      if (!carId) throw new Error("Failed to create car.");

      for (const mod of mods) {
        let imageUrl: string | undefined = undefined;
        if (mod.image) {
          const fileName = `mod-${Date.now()}-${mod.image.name}`;
          imageUrl = await uploadToBackblaze(mod.image, fileName, convex);
        }

        await createPart({
          carId,
          name: mod.name,
          category: mod.category,
          purchaseUrl: mod.purchaseUrl,
          image: imageUrl,
        });
      }

      trackCarAdded({
        brand: carData.make,
        model: carData.model,
        year: parseInt(carData.year, 10) || 0,
        hasImages: images.length > 0,
        hasProductLinks: mods.length > 0,
      });

      toast({ title: "Success!", description: "Your car has been added to your garage." });
      navigate(`/car/${carId}`);
    } catch (error) {
      console.error("Failed to add car:", error);
      toast({ title: "Error", description: "Failed to add car. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formGridClass = "grid grid-cols-1 md:grid-cols-2 gap-4";

  return (
    <ResponsiveLayout>
      <div className="bg-background text-foreground min-h-screen">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            <h1 className="text-2xl font-bold mb-6">Add a New Car</h1>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Upload Images (up to 8)</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-[4/3]">
                    <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover rounded-md" />
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
                {images.length < 8 && (
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
                  {uploading ? `Uploading (${Math.round(uploadProgress)}%)` : "Adding Car..."}
                </>              ) : "Add Car"}
            </Button>
          </form>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
