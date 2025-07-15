import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MobileLayout from "@/components/layout/MobileLayout";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { Camera, X, PlusCircle, Link, ShoppingBag, Loader2 } from "lucide-react";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { uploadToBackblaze } from "@/utils/storageService";
import { useMediaQuery } from "../hooks/useMediaQuery";

const AddCarPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const convex = useConvex(); // Convex client for API calls

  // Form state
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    power: "", // Keeping field name as power in state for backend compatibility
    torque: "", // Adding torque field
    description: ""
  });

  // Product links state
  const [productLinks, setProductLinks] = useState<Array<{name: string, url: string}>>([]);
  const [currentProduct, setCurrentProduct] = useState({ name: "", url: "" });

  // Image upload state
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCurrentProduct(prev => ({ ...prev, [name]: value }));
  };

  const addProductLink = () => {
    if (currentProduct.name.trim() === '' || currentProduct.url.trim() === '') {
      toast({
        title: "Missing information",
        description: "Please provide both product name and URL",
        variant: "destructive"
      });
      return;
    }
    
    // Basic URL validation
    try {
      new URL(currentProduct.url); // This will throw if URL is invalid
      setProductLinks([...productLinks, {...currentProduct}]);
      setCurrentProduct({ name: "", url: "" }); // Reset form after adding
    } catch (e) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
        variant: "destructive"
      });
    }
  };

  const removeProductLink = (index: number) => {
    const updatedLinks = [...productLinks];
    updatedLinks.splice(index, 1);
    setProductLinks(updatedLinks);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Limit to 8 images total
      // Reverse the order so first selected appears first in the array
      const totalImages = [...newFiles.reverse(), ...images].slice(0, 8);
      setImages(totalImages);
      
      // Create preview URLs
      const newPreviewUrls = totalImages.map(file => URL.createObjectURL(file));
      setImagePreviewUrls(newPreviewUrls);
    }
  };
  
  const handleRemoveImage = (index: number) => {
    // Remove the image and its preview
    const updatedImages = [...images];
    updatedImages.splice(index, 1);
    setImages(updatedImages);
    
    const updatedPreviewUrls = [...imagePreviewUrls];
    URL.revokeObjectURL(updatedPreviewUrls[index]); // Clean up the URL
    updatedPreviewUrls.splice(index, 1);
    setImagePreviewUrls(updatedPreviewUrls);
  };
  
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Get Convex mutations for car creation and parts
  const createCar = useMutation(api.cars.createCar);
  const createPart = useMutation(api.parts.createPart);
  
  // Detect if we're on mobile
  const isMobile = useMediaQuery("(max-width: 767px)");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);
    setUploadProgress(0);
    
    try {
      // Process the year value
      const yearValue = formData.year ? parseInt(formData.year) : new Date().getFullYear();
      
      // Upload images to Backblaze and collect their URLs
      const imageUrls: string[] = [];
      
      if (images.length > 0) {
        try {
          // Single toast notification for the entire upload process
          toast({
            title: "Uploading images",
            description: `Processing ${images.length} images. Please don't close this page.`
          });
          
          // Process each image file
          for (let i = 0; i < images.length; i++) {
            const image = images[i];
            // Generate a unique filename for the image
            const sanitizedBrand = formData.brand.toLowerCase().replace(/\s+/g, '-');
            const sanitizedModel = formData.model.toLowerCase().replace(/\s+/g, '-');
            const filename = `${sanitizedBrand}-${sanitizedModel}-${Date.now()}`;
            const extension = image.name.split('.').pop() || 'jpg';
            const fullFilename = `${filename}.${extension}`;
            
            // Update progress state
            const progressPercentage = Math.round(((i + 0.5) / images.length) * 100);
            setUploadProgress(progressPercentage);
            
            // Upload the image to Backblaze using server-side approach
            const imageUrl = await uploadToBackblaze(image, fullFilename, convex);
            
            // Add the URL to our collection
            if (imageUrl) {
              imageUrls.push(imageUrl);
              console.log(`Uploaded image to Backblaze: ${imageUrl}`);
              
              // Update progress state again after successful upload
              const completePercentage = Math.round(((i + 1) / images.length) * 100);
              setUploadProgress(completePercentage);
            }
          }
        } catch (error) {
          console.error('Error uploading image to Backblaze:', error);
          toast({
            variant: "destructive",
            title: "Upload failed",
            description: `Failed to upload image: ${error instanceof Error ? error.message : 'Unknown error'}`
          });
          setLoading(false);
          setUploading(false);
          return; // Exit early if upload fails
        }
      }
      
      // Create car in Convex database
      const { carId } = await createCar({
        brand: formData.brand,
        model: formData.model,
        year: yearValue,
        power: formData.power,
        torque: formData.torque ? parseInt(formData.torque) : undefined,
        description: formData.description || undefined,
        images: imageUrls,
        isPublished: true,
      });
      
      // Add product links as parts
      if (productLinks.length > 0) {
        setUploadProgress(100); // Keep progress at 100%
        
        for (const product of productLinks) {
          await createPart({
            carId,
            name: product.name,
            category: "accessory", // Default category
            purchaseUrl: product.url,
            description: ""
          });
        }
      }
      
      toast({
        title: "Car added successfully",
        description: "Your car has been added to your collection!"
      });
      
      // Reset form
      setFormData({
        brand: "",
        model: "",
        year: "",
        power: "",
        torque: "",
        description: ""
      });
      
      // Reset product links
      setProductLinks([]);
      setCurrentProduct({ name: "", url: "" });
      
      // Clean up image previews
      setImages([]);
      setImagePreviewUrls(prevUrls => {
        prevUrls.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
      
      // Navigate to car details page after successful addition
      console.log('Car created with ID:', carId);
      console.log('Product links added:', productLinks.length);
      navigate(`/car/${carId}`);
      
      // Reset loading state
      setLoading(false);
      setUploading(false);
    } catch (error) {
      console.error('Error adding car:', error);
      toast({
        title: "Error adding car",
        description: "There was a problem adding your car. Please try again.",
        variant: "destructive"
      });
      setLoading(false);
      setUploading(false);
    }
  };

  // Content to be rendered
  const pageContent = (
    <div className="container mx-auto p-4">
      {/* Loading overlay */}
      {(uploading || loading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl w-80 shadow-xl">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <div className="text-center">
                <p className="font-medium">
                  {uploading ? `Uploading Images (${Math.round(uploadProgress)}%)` : "Adding your car..."}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-6">Add a New Car</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Car Photos - Up to 8 images */}
          <div className="space-y-4 mb-4">
            <div>
              <Label className="text-base font-medium mb-2 block">Images</Label>
              <p className="text-xs text-slate-400 mb-3">Upload high-quality photos of your car (max 8)</p>
              
              {/* Image Grid */}
              <div className="grid grid-cols-4 gap-3 mb-3">
                {/* Upload Button */}
                {images.length < 8 && (
                  <div 
                    onClick={triggerFileInput} 
                    className="aspect-square border-2 border-dashed border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors bg-slate-800/50"
                  >
                    <Camera size={24} className="text-slate-300" />
                    <span className="text-xs mt-2 text-slate-300 font-medium">Add</span>
                  </div>
                )}
                
                {/* Image Previews */}
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="aspect-square bg-slate-800 rounded-lg relative shadow-md overflow-hidden group">
                    <img 
                      src={url} 
                      alt={`Preview ${index}`} 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-2 right-2 bg-black/70 rounded-full p-1.5 opacity-70 hover:opacity-100 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove image"
                    >
                      <X size={14} className="text-white" />
                    </button>
                  </div>
                ))}
              </div>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/jpeg, image/png"
                multiple
                className="hidden"
              />
              <p className="text-xs text-slate-400 mt-2">JPG, PNG images only</p>
            </div>
          </div>

          {/* Car Details */}
          <div className="space-y-6">
            {/* Top Fields - Brand, Model */}
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="brand" className="text-sm font-medium">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., BMW, Mercedes"
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="model" className="text-sm font-medium">Model</Label>
                <Input
                  id="model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  placeholder="e.g., M3, C-Class"
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
            
            {/* Year, Power, Torque */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="year" className="text-sm font-medium">Year</Label>
                <Input
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="e.g., 2023"
                  required
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="power" className="text-sm font-medium">Power</Label>
                <Input
                  id="power"
                  name="power"
                  value={formData.power}
                  onChange={handleChange}
                  placeholder="e.g., 300 HP"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="torque" className="text-sm font-medium">Torque</Label>
                <Input
                  id="torque"
                  name="torque"
                  value={formData.torque}
                  onChange={handleChange}
                  placeholder="e.g., 450 Nm"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2 mb-4">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your car..."
                rows={4}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px] whitespace-pre-line"
              />
            </div>
            
            {/* Product Links Section */}
            <div className="space-y-4 pt-4 border-t mt-4">
              <div className="flex items-center gap-2">
                <ShoppingBag size={16} />
                <h3 className="text-base font-medium">Shop the Build</h3>
              </div>
              <p className="text-xs text-muted-foreground">
                Add product links for parts used in your build. These will be displayed when someone clicks "Shop the Build".
              </p>
              
              {/* Product Links Form */}
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr,auto] gap-2">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input 
                      id="productName"
                      name="name"
                      value={currentProduct.name}
                      onChange={handleProductChange}
                      placeholder="e.g., Air Filter, Suspension Kit"
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
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-md font-semibold text-center tracking-wide" 
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                {uploading ? `Uploading (${Math.round(uploadProgress)}%)` : "Adding Car..."}
              </>
            ) : "Add Car"}
          </Button>
        </form>
      </div>
    </div>
  );

  // Use ResponsiveLayout for consistent navigation across the app
  return (
    <ResponsiveLayout>
      {pageContent}
    </ResponsiveLayout>
  );
};

export default AddCarPage;
