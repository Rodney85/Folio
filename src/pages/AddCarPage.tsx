import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import MobileLayout from "@/components/layout/MobileLayout";
import { Camera, X, PlusCircle, Link, ShoppingBag, Loader2 } from "lucide-react";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../convex/_generated/api";
import { uploadToBackblaze } from "@/utils/storageService";

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
    power: "",
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
      const totalImages = [...images, ...newFiles].slice(0, 8);
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

  return (
    <MobileLayout>
      {/* Glassmorphic Loading Modal */}
      {(uploading || loading) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 p-6 rounded-xl w-80 shadow-xl">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <h3 className="text-white font-medium text-lg mb-2">
                {loading && !uploading ? 'Creating your car...' : 'Uploading images...'}
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
        <h1 className="text-2xl font-bold mb-6">Add a New Car</h1>
        
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
                {/* Image previews */}
                {imagePreviewUrls.map((url, index) => (
                  <div key={index} className="relative aspect-[4/5]">
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
                {images.length < 8 && (
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
              
              {/* Upload Progress Indicator */}
              {uploading && (
                <div className="mb-4">
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-1">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-center text-muted-foreground">
                    Uploading: {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
              
              <span className="text-xs text-muted-foreground">
                Upload high-quality photos of your car (max: 8)
              </span>
            </div>
            
            <span className="text-xs text-muted-foreground">JPG, PNG images only</span>

            {/* Car Details */}
            <div className="space-y-4">
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

            <div className="grid grid-cols-2 gap-4">
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
              
              <div className="space-y-2">
                <Label htmlFor="power">Power</Label>
                <Input 
                  id="power"
                  name="power"
                  value={formData.power}
                  onChange={handleChange}
                  placeholder="e.g., 300 HP"
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
                rows={4}
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
            className="w-full" 
            disabled={loading}
          >
            {loading ? (uploading ? `Uploading (${Math.round(uploadProgress)}%)` : "Adding Car...") : "Add Car"}
          </Button>
        </form>
      </div>
    </MobileLayout>
  );
};

export default AddCarPage;
