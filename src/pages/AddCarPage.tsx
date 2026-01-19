import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { Camera, X, PlusCircle, ShoppingBag, Loader2, Link, Lock, Crown } from "lucide-react";
import { useMutation, useConvex, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { uploadToBackblaze } from "@/utils/storageService";
import { trackCarAdded } from "@/utils/analytics";
import * as carDB from "@/services/carDatabaseService";
import { Switch } from "@/components/ui/switch";

// Form constants for select options
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1950 + 1 }, (_, i) => (CURRENT_YEAR - i).toString());

const TRANSMISSIONS = [
  "Manual",
  "Automatic",
  "Semi-Automatic",
  "CVT",
  "DCT (Dual Clutch)",
  "DSG",
  "Tiptronic",
  "Sequential"
];

const DRIVETRAINS = [
  "FWD",
  "RWD",
  "AWD",
  "4WD",
  "Part-time 4WD",
  "Full-time 4WD"
];

const BODY_STYLES = [
  "Sedan",
  "Coupe",
  "Hatchback",
  "Wagon",
  "SUV",
  "Crossover",
  "Convertible",
  "Truck",
  "Van",
  "Minivan",
  "Roadster",
  "Shooting Brake"
];

const COLORS = [
  "Black",
  "White",
  "Silver",
  "Gray",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Brown",
  "Purple",
  "Gold",
  "Bronze",
  "Beige",
  "Champagne",
  "Burgundy"
];

const CAR_MAKES = [
  "Acura",
  "Alfa Romeo",
  "Aston Martin",
  "Audi",
  "Bentley",
  "BMW",
  "Bugatti",
  "Buick",
  "Cadillac",
  "Chevrolet",
  "Chrysler",
  "Citroën",
  "Dodge",
  "Ferrari",
  "Fiat",
  "Ford",
  "Genesis",
  "GMC",
  "Honda",
  "Hyundai",
  "Infiniti",
  "Jaguar",
  "Jeep",
  "Kia",
  "Koenigsegg",
  "Lamborghini",
  "Land Rover",
  "Lexus",
  "Lincoln",
  "Lotus",
  "Maserati",
  "Mazda",
  "McLaren",
  "Mercedes-Benz",
  "Mini",
  "Mitsubishi",
  "Nissan",
  "Pagani",
  "Peugeot",
  "Porsche",
  "Ram",
  "Renault",
  "Rolls-Royce",
  "Subaru",
  "Suzuki",
  "Tesla",
  "Toyota",
  "Volkswagen",
  "Volvo"
];

// Common models by make (simplified list)
const MODELS_BY_MAKE: Record<string, string[]> = {
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X3", "X5", "X6", "X7", "Z4", "i3", "i4", "i8", "M2", "M3", "M4", "M5", "M8"],
  "Toyota": ["Avalon", "Camry", "Corolla", "GR86", "Highlander", "Land Cruiser", "Prius", "RAV4", "Sequoia", "Supra", "Tacoma", "Tundra", "Venza", "4Runner"],
  "Honda": ["Accord", "Civic", "CR-V", "Element", "Fit", "HR-V", "Insight", "Odyssey", "Passport", "Pilot", "Ridgeline", "S2000"],
  "Ford": ["Bronco", "Edge", "Escape", "Expedition", "Explorer", "F-150", "Fiesta", "Focus", "Fusion", "Mustang", "Ranger", "Transit"],
  "Chevrolet": ["Blazer", "Camaro", "Colorado", "Corvette", "Equinox", "Impala", "Malibu", "Silverado", "Suburban", "Tahoe", "Traverse"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "R8", "TT", "e-tron"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "AMG GT"]
};

// Fallback common models for makes not in MODELS_BY_MAKE
const COMMON_MODELS = [
  "Coupe",
  "Sedan",
  "Hatchback",
  "SUV",
  "Convertible",
  "Wagon",
  "Crossover",
  "Sport",
  "GT",
  "RS",
  "Type-R",
  "STI"
];

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

// Reusable Combobox component
interface ComboboxProps {
  options: string[];
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  emptyMessage: string;
}

const Combobox = ({ options, value, onChange, placeholder, emptyMessage }: ComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent text-white hover:bg-slate-800 hover:text-white"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandEmpty>{emptyMessage}</CommandEmpty>
          <CommandList>
            <CommandGroup>
              {filteredOptions.map((option) => (
                <CommandItem
                  key={option}
                  value={option}
                  onSelect={(currentValue) => {
                    onChange(currentValue);
                    setOpen(false);
                    setSearchValue("");
                  }}
                >
                  <Check
                    className={`mr-2 h-4 w-4 ${value === option ? "opacity-100" : "opacity-0"}`}
                  />
                  {option}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default function AddCarPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useAuth();
  // @ts-ignore - Convex type instantiation issue
  const userProfile = useQuery(api.users.getProfile);
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const convex = useConvex();
  const createCar = useMutation(api.cars.createCar);
  const createPart = useMutation(api.parts.createPart);

  const isAdmin = Boolean(
    user?.publicMetadata?.role === "admin" ||
    user?.primaryEmailAddress?.emailAddress?.toLowerCase().endsWith("@carfolio.cc")
  );

  const [carData, setCarData] = useState(initialCarData);
  const [mods, setMods] = useState<(typeof initialModData)[]>([]);
  const [currentMod, setCurrentMod] = useState(initialModData);
  const modFileInputRef = useRef<HTMLInputElement>(null);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modelOptions, setModelOptions] = useState<string[]>(COMMON_MODELS);
  const [useCustomEntry, setUseCustomEntry] = useState(false); // Toggle between API and manual entry

  // Update model options when make changes
  useEffect(() => {
    if (carData.make) {
      const makeSpecificModels = MODELS_BY_MAKE[carData.make];
      if (makeSpecificModels) {
        setModelOptions(makeSpecificModels);
      } else {
        setModelOptions(COMMON_MODELS);
      }
    } else {
      setModelOptions(COMMON_MODELS);
    }
  }, [carData.make]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCarData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setCarData(prev => ({ ...prev, [name]: value }));
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
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

      const newFiles = Array.from(e.target.files).filter(file => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File too large",
            description: `"${file.name}" exceeds 10MB limit. Please compress or resize the image.`,
            variant: "destructive"
          });
          return false;
        }
        // Check file type
        if (!ALLOWED_TYPES.includes(file.type)) {
          toast({
            title: "Invalid file type",
            description: `"${file.name}" is not a valid image. Please use JPEG, PNG, WebP, or GIF.`,
            variant: "destructive"
          });
          return false;
        }
        return true;
      });

      if (newFiles.length === 0) return;

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
      const message = error instanceof Error ? error.message : "Failed to add car. Please try again.";
      toast({ title: "Error", description: message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formGridClass = "grid grid-cols-1 md:grid-cols-2 gap-4";

  if (userProfile === undefined) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!userProfile?.isSubscribed && !isAdmin) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-2xl">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Premium Feature</h1>
            <p className="text-xl text-slate-300 mb-8">
              Adding cars to your garage is available exclusively to Premium subscribers.
              Showcase your builds to the world with unlimited car profiles.
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
      </ResponsiveLayout>
    );
  }

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-transparent text-white">
        <div className="container mx-auto px-0 md:px-4 py-0 md:py-8 max-w-4xl">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Add a New Car</h1>
              <div className="flex items-center gap-2">
                <Label htmlFor="custom-mode" className="text-sm text-muted-foreground cursor-pointer">
                  Custom Entry
                </Label>
                <Switch
                  id="custom-mode"
                  checked={useCustomEntry}
                  onCheckedChange={setUseCustomEntry}
                />
              </div>
            </div>

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
                      <Camera size={24} className="mx-auto" />
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
                  <Combobox
                    options={CAR_MAKES}
                    value={carData.make}
                    onChange={(value) => handleSelectChange("make", value)}
                    placeholder="Select make"
                    emptyMessage="No makes found"
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model</Label>
                  <Combobox
                    options={modelOptions}
                    value={carData.model}
                    onChange={(value) => handleSelectChange("model", value)}
                    placeholder="Select model"
                    emptyMessage="No models found. Type to add custom."
                  />
                </div>
                <div>
                  <Label htmlFor="year">Year</Label>
                  <Select
                    value={carData.year}
                    onValueChange={(value) => handleSelectChange("year", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>2020s</SelectLabel>
                        {YEARS.filter(year => year >= "2020" && year <= "2029").map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>2010s</SelectLabel>
                        {YEARS.filter(year => year >= "2010" && year <= "2019").map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>2000s</SelectLabel>
                        {YEARS.filter(year => year >= "2000" && year <= "2009").map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>1990s</SelectLabel>
                        {YEARS.filter(year => year >= "1990" && year <= "1999").map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>1980s</SelectLabel>
                        {YEARS.filter(year => year >= "1980" && year <= "1989").map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>1970s</SelectLabel>
                        {YEARS.filter(year => year >= "1970" && year <= "1979").map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>1960s</SelectLabel>
                        {YEARS.filter(year => year >= "1960" && year <= "1969").map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      <SelectGroup>
                        <SelectLabel>1950s</SelectLabel>
                        {YEARS.filter(year => year >= "1950" && year <= "1959").map((year) => (
                          <SelectItem key={year} value={year}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
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
                  <Select
                    value={carData.transmission}
                    onValueChange={(value) => handleSelectChange("transmission", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select transmission" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSMISSIONS.map((transmission) => (
                        <SelectItem key={transmission} value={transmission}>
                          {transmission}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="drivetrain">Drivetrain</Label>
                  <Select
                    value={carData.drivetrain}
                    onValueChange={(value) => handleSelectChange("drivetrain", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select drivetrain" />
                    </SelectTrigger>
                    <SelectContent>
                      {DRIVETRAINS.map((drivetrain) => (
                        <SelectItem key={drivetrain} value={drivetrain}>
                          {drivetrain}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="bodyStyle">Body Style</Label>
                  <Select
                    value={carData.bodyStyle}
                    onValueChange={(value) => handleSelectChange("bodyStyle", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select body style" />
                    </SelectTrigger>
                    <SelectContent>
                      {BODY_STYLES.map((style) => (
                        <SelectItem key={style} value={style}>
                          {style}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="exteriorColor">Exterior Color</Label>
                  <Select
                    value={carData.exteriorColor}
                    onValueChange={(value) => handleSelectChange("exteriorColor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exterior color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-slate-600"
                              style={{ backgroundColor: color.toLowerCase() }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interiorColor">Interior Color</Label>
                  <Select
                    value={carData.interiorColor}
                    onValueChange={(value) => handleSelectChange("interiorColor", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interior color" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLORS.map((color) => (
                        <SelectItem key={color} value={color}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-slate-600"
                              style={{ backgroundColor: color.toLowerCase() }}
                            />
                            {color}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          <Camera size={20} className="mx-auto" />
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
                </>) : "Add Car"}
            </Button>
          </form>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
