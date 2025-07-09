import { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MobileLayout from "@/components/layout/MobileLayout";
import { Camera, X, PlusCircle, Link, ShoppingBag, Loader2, Save } from "lucide-react";
import { useMutation, useQuery, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { uploadToBackblaze } from "@/utils/storageService";
import CarImageWithUrl from '@/components/cars/CarImageWithUrl';

const EditCarPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const convex = useConvex();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query car data
  const car = useQuery(api.cars.getCarById, id ? { carId: id as any } : "skip");
  const parts = useQuery(api.parts.getCarParts, id ? { carId: id as any } : "skip");
  
  // Form state
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    power: "",
    torque: "",
    description: ""
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [productLinks, setProductLinks] = useState<{ name: string; url: string; }[]>([]);
  const [currentProduct, setCurrentProduct] = useState({ name: "", url: "" });

  // Mutations
  const updateCar = useMutation(api.cars.updateCar);
  const createPart = useMutation(api.parts.createPart);
  const deletePart = useMutation(api.parts.deletePart);

  useEffect(() => {
    // Populate form data when car data is loaded
    if (car) {
      setFormData({
        brand: car.make || "",
        model: car.model || "",
        year: car.year?.toString() || "",
        power: car.power || "",
        torque: car.torque?.toString() || "",
        description: car.description || ""
      });
      
      if (car.images && car.images.length > 0) {
        setExistingImages(car.images);
      }
    }
    
    // Populate product links when parts data is loaded
    if (parts && parts.length > 0) {
      setProductLinks(parts.map(part => ({
        name: part.name || "",
        url: part.purchaseUrl || ""
      })));
    }
  }, [car, parts]);

  // File handling
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
      
      const newImages = [...images, ...newFiles];
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
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Product link handling
  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  };

  const addProductLink = () => {
    if (currentProduct.name.trim() && currentProduct.url.trim()) {
      setProductLinks([...productLinks, { ...currentProduct }]);
      setCurrentProduct({ name: "", url: "" });
    }
  };

  const removeProductLink = (index: number) => {
    setProductLinks(productLinks.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Upload new images if any
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
      
      // Update car data
      await updateCar({
        carId: id as any,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year) || new Date().getFullYear(),
        power: formData.power,
        torque: formData.torque ? parseInt(formData.torque) : undefined,
        description: formData.description,
        images: allImages
      });
      
      // Delete existing parts and add new ones
      if (parts && parts.length > 0) {
        for (const part of parts) {
          await deletePart({ partId: part._id });
        }
      }
      
      // Create new parts
      for (const product of productLinks) {
        await createPart({
          carId: id as any,
          name: product.name,
          purchaseUrl: product.url,
          category: "accessory", // Default category
          description: "",  // Required empty string for optional fields
          price: undefined // Optional field
        });
      }
      
      toast({
        title: "Car updated successfully",
        description: "Your car has been updated with the new details.",
      });
      
      // Navigate to profile page
      navigate('/profile');
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
      <MobileLayout>
        <div className="p-4 flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        </div>
      </MobileLayout>
    );
  }

  return (
    <MobileLayout>
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
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Edit Car</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Car Photos - Up to 8 images */}
          <div className="flex flex-col items-center">
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/*" 
              multiple 
            />
            
            {/* Image Upload Preview Section */}
            <div className="w-full mb-4">
              <Label className="block mb-2">Images</Label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {/* Existing image previews */}
                {existingImages.map((storageId, index) => (
                  <div key={`existing-${index}`} className="relative aspect-[4/5]">
                    <CarImageWithUrl 
                      storageId={storageId} 
                      alt={`Existing ${index + 1}`} 
                      className="w-full h-full object-cover rounded-md" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index, true)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-0.5"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
                
                {/* New image previews */}
                {imagePreviewUrls.map((url, index) => (
                  <div key={`new-${index}`} className="relative aspect-[4/5]">
                    <img 
                      src={url} 
                      alt={`Preview ${index + 1}`} 
                      className="w-full h-full object-cover rounded-md" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-0.5"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
                
                {/* Add image button - only show if less than 8 images */}
                {existingImages.length + images.length < 8 && (
                  <button
                    type="button"
                    onClick={triggerFileInput}
                    className="w-full aspect-[4/5] border-2 border-dashed border-muted-foreground/20 rounded-md flex items-center justify-center"
                  >
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Camera size={24} />
                      <span className="text-xs mt-1">Add</span>
                    </div>
                  </button>
                )}
              </div>
              
              <span className="text-xs text-muted-foreground">
                Upload high-quality photos of your car (max: 8)
              </span>
            </div>
            
            <span className="text-xs text-muted-foreground">JPG, PNG images only</span>

            {/* Car Details */}
            <div className="space-y-4 w-full">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input 
                    id="brand"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    placeholder="e.g., BMW, Mercedes"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input 
                    id="model"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    placeholder="e.g., M3, C-Class"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input 
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g., 2023"
                  type="number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="power">Horsepower</Label>
                  <Input 
                    id="power"
                    name="power"
                    value={formData.power}
                    onChange={handleChange}
                    placeholder="e.g., 280"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="torque">Torque (Nm)</Label>
                  <Input 
                    id="torque"
                    name="torque"
                    value={formData.torque}
                    onChange={handleChange}
                    placeholder="e.g., 350"
                    type="number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Tell us about your car..."
                  rows={5}
                  className="w-full min-h-[120px] bg-white dark:bg-gray-800 resize-y"
                />
              </div>
              
              {/* Product Links */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={18} />
                  <h2 className="text-base font-medium">Product Links</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input 
                      id="productName"
                      name="name"
                      value={currentProduct.name}
                      onChange={handleProductChange}
                      placeholder="e.g., Wheels, Exhaust System"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="productUrl">URL</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="productUrl"
                        name="url"
                        value={currentProduct.url}
                        onChange={handleProductChange}
                        placeholder="https://..."
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        size="icon"
                        onClick={addProductLink}
                      >
                        <PlusCircle size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
                
                {/* Product Links List */}
                {productLinks.length > 0 && (
                  <div className="space-y-2 mt-4">
                    <Label>Added Products</Label>
                    <div className="rounded-md border divide-y">
                      {productLinks.map((product, index) => (
                        <div key={index} className="flex items-center justify-between p-3">
                          <div className="flex items-center gap-2">
                            <Link size={16} className="text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{product.name}</p>
                              <p className="text-xs text-muted-foreground truncate max-w-[180px]">{product.url}</p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeProductLink(index)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? (uploading ? `Uploading (${Math.round(uploadProgress)}%)` : "Updating Car...") : "Save Changes"}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default EditCarPage;
