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
import { Camera, X, PlusCircle, ShoppingBag, Loader2, Link, Lock, Crown, ArrowRight, ArrowLeft, Car, Settings, Image, Wrench, CheckCircle2 } from "lucide-react";
import { useMutation, useConvex, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { uploadToBackblaze } from "@/utils/storageService";
import { trackCarAdded } from "@/utils/analytics";
import * as carDB from "@/services/carDatabaseService";
import { type CarTrim } from "@/services/carDatabaseService";
import { Switch } from "@/components/ui/switch";

// Form constants for select options
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR + 1 - 1900 + 1 }, (_, i) => (CURRENT_YEAR + 1 - i).toString());

const FUEL_TYPES = [
  "Gasoline",
  "Diesel",
  "Hybrid",
  "Electric",
  "Other"
];

const TRANSMISSIONS = [
  "Automatic",
  "Manual",
  "Dual-Clutch (DCT)",
  "CVT"
];

const DRIVETRAINS = [
  "FWD",
  "RWD",
  "AWD",
  "4WD"
];

const BODY_STYLES = [
  "Sedan",
  "Coupe",
  "SUV / Crossover",
  "Hatchback",
  "Wagon",
  "Truck",
  "Van / Minivan",
  "Convertible"
];

const COLOR_SWATCHES = [
  { name: "Black", tailwind: "bg-black" },
  { name: "White", tailwind: "bg-white" },
  { name: "Silver / Gray", tailwind: "bg-slate-400" },
  { name: "Blue", tailwind: "bg-blue-600" },
  { name: "Red", tailwind: "bg-red-600" },
  { name: "Green", tailwind: "bg-emerald-600" },
  { name: "Yellow", tailwind: "bg-yellow-400" },
  { name: "Orange", tailwind: "bg-orange-500" },
  { name: "Brown / Beige", tailwind: "bg-amber-800" },
  { name: "Purple", tailwind: "bg-purple-600" },
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
  fuelType: "",
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
          className="w-full justify-between bg-white/5 border-white/10 text-white hover:bg-white/10 hover:text-white font-normal"
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-slate-950 border-white/10 z-[100]" align="start">
        <Command className="bg-transparent text-white">
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchValue}
            onValueChange={setSearchValue}
            className="text-white placeholder:text-slate-500 border-none focus:ring-0"
          />
          <CommandEmpty>
            <div className="flex flex-col items-center justify-center p-4">
              <p className="text-sm text-slate-400 mb-2">{emptyMessage}</p>
              {searchValue && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onChange(searchValue);
                    setOpen(false);
                    setSearchValue("");
                  }}
                  className="bg-white/10 hover:bg-white/20 border-white/20 text-white"
                >
                  Use "{searchValue}"
                </Button>
              )}
            </div>
          </CommandEmpty>
          <CommandList className="max-h-[250px] overflow-y-auto">
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
                  className="aria-selected:bg-white/10 text-white hover:bg-white/5 cursor-pointer"
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
  // @ts-ignore - Convex type instantiation issue
  const canAddCar = useQuery(api.freemium.canAddCar);
  // @ts-ignore - Convex type instantiation issue
  const canUseAffiliateLinks = useQuery(api.freemium.canUseAffiliateLinks);
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
  const [currentStep, setCurrentStep] = useState(1); // Wizard step (1-4)
  const [availableTrims, setAvailableTrims] = useState<CarTrim[]>([]);
  const [selectedTrimId, setSelectedTrimId] = useState<string>("");
  const [loadingTrims, setLoadingTrims] = useState(false);

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

  // Fetch trims when Make, Model, and Year are filled
  useEffect(() => {
    async function fetchTrims() {
      if (carData.make && carData.model && carData.year && !useCustomEntry) {
        setLoadingTrims(true);
        try {
          const trims = await carDB.getTrims(carData.make, carData.model, carData.year);
          setAvailableTrims(trims || []);
          setSelectedTrimId(""); // Reset trim selection if car identity changes
        } catch (error) {
          console.error("Failed to load trims", error);
          setAvailableTrims([]);
        } finally {
          setLoadingTrims(false);
        }
      } else {
        setAvailableTrims([]);
        setSelectedTrimId("");
      }
    }
    fetchTrims();
  }, [carData.make, carData.model, carData.year, useCustomEntry]);

  // Handle Trim Selection
  const handleTrimSelect = (trimId: string) => {
    setSelectedTrimId(trimId);
    if (!trimId) return;

    const trim = availableTrims.find(t => t.model_trim === trimId);
    if (trim) {
      const engine = carDB.formatEngine(trim);
      const transmission = carDB.formatTransmission(trim);
      const drivetrain = carDB.formatDrivetrain(trim);
      const bodyStyle = carDB.formatBodyStyle(trim);
      const hp = carDB.formatHorsepower(trim).replace(' HP', '');
      const torque = carDB.formatTorque(trim).replace(' lb-ft', '');

      // Attempt to guess fuel type if unknown, otherwise prompt user
      let fuelType = "Gasoline";
      if (trim.model_engine_fuel?.toLowerCase().includes("diesel")) fuelType = "Diesel";
      if (trim.model_engine_fuel?.toLowerCase().includes("hybrid")) fuelType = "Hybrid";
      if (trim.model_engine_fuel?.toLowerCase().includes("electric")) fuelType = "Electric";

      setCarData(prev => ({
        ...prev,
        package: trim.model_trim || prev.package,
        engine: engine !== 'Unknown' ? engine : prev.engine,
        transmission,
        drivetrain: DRIVETRAINS.includes(drivetrain) ? drivetrain : prev.drivetrain,
        bodyStyle: BODY_STYLES.includes(bodyStyle) ? bodyStyle : prev.bodyStyle,
        powerHp: hp || prev.powerHp,
        torqueLbFt: torque || prev.torqueLbFt,
        fuelType: fuelType
      }));
    }
  };

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
        engine: carData.fuelType === "Electric" ? "" : carData.engine,
        transmission: carData.fuelType === "Electric" ? "" : carData.transmission,
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


  if (userProfile === undefined) {
    return (
      <ResponsiveLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (canAddCar === false && !isAdmin) {
    return (
      <ResponsiveLayout>
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-8 shadow-2xl">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold mb-4">Garage Full</h1>
            <p className="text-xl text-slate-300 mb-8">
              You've reached the free tier limit of 3 cars.
              Upgrade to Pro or OG for unlimited garage slots.
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

  // Wizard step definitions
  const steps = [
    { number: 1, label: "Your Car", icon: Car },
    { number: 2, label: "Specs", icon: Settings },
    { number: 3, label: "Gallery", icon: Image },
    { number: 4, label: "Mods", icon: Wrench },
  ];

  const canProceedStep1 = !!carData.make && !!carData.model && !!carData.year;

  const canProceedStep2 = !!carData.fuelType
    && !!carData.bodyStyle
    && !!carData.drivetrain
    && !!carData.exteriorColor
    && (carData.fuelType === "Electric" || (!!carData.engine && !!carData.transmission));

  const canProceedStep3 = images.length > 0;

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1));

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-transparent text-white">
        <div className="container mx-auto px-0 md:px-4 py-0 md:py-8 max-w-3xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading">Add a New Car</h1>
                <p className="text-sm text-slate-400 mt-1">Step {currentStep} of 4</p>
              </div>
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

            {/* Progress Stepper */}
            <div className="flex items-center gap-1 mb-8">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-center flex-1">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(step.number)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 w-full justify-center ${currentStep === step.number
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : currentStep > step.number
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-white/5 text-slate-500 border border-white/5"
                      }`}
                  >
                    {currentStep > step.number ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                    <span className="hidden sm:inline">{step.label}</span>
                  </button>
                  {i < steps.length - 1 && (
                    <div className={`w-4 md:w-8 h-px mx-1 flex-shrink-0 ${currentStep > step.number ? "bg-emerald-500/40" : "bg-white/10"
                      }`} />
                  )}
                </div>
              ))}
            </div>

            {/* ─── STEP 1: Your Car ─── */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-5 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Car className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Identify Your Car</h2>
                      <p className="text-xs text-slate-400">Start with the basics — make, model, and year.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make <span className="text-red-400">*</span></Label>
                      {useCustomEntry ? (
                        <Input
                          id="make"
                          name="make"
                          value={carData.make}
                          onChange={handleChange}
                          placeholder="e.g., Rivian"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      ) : (
                        <Combobox
                          options={CAR_MAKES}
                          value={carData.make}
                          onChange={(value) => handleSelectChange("make", value)}
                          placeholder="Select make"
                          emptyMessage="No makes found"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model <span className="text-red-400">*</span></Label>
                      {useCustomEntry ? (
                        <Input
                          id="model"
                          name="model"
                          value={carData.model}
                          onChange={handleChange}
                          placeholder="e.g., R1S"
                          className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                        />
                      ) : (
                        <Combobox
                          options={modelOptions}
                          value={carData.model}
                          onChange={(value) => handleSelectChange("model", value)}
                          placeholder="Select model"
                          emptyMessage="No models found. Type to add custom."
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year <span className="text-red-400">*</span></Label>
                      <Select
                        value={carData.year}
                        onValueChange={(value) => handleSelectChange("year", value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>2020s</SelectLabel>
                            {YEARS.filter(year => year >= "2020" && year <= "2029").map((year) => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>2010s</SelectLabel>
                            {YEARS.filter(year => year >= "2010" && year <= "2019").map((year) => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>2000s</SelectLabel>
                            {YEARS.filter(year => year >= "2000" && year <= "2009").map((year) => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>1990s</SelectLabel>
                            {YEARS.filter(year => year >= "1990" && year <= "1999").map((year) => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectGroup>
                          <SelectGroup>
                            <SelectLabel>1980s & earlier</SelectLabel>
                            {YEARS.filter(year => year < "1990").map((year) => (
                              <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="package">Package / Trim <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="package" name="package" value={carData.package} onChange={handleChange} placeholder="e.g., M Sport, Premium" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                    </div>
                  </div>
                </div>

                {/* Next button */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedStep1}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-xl font-medium"
                  >
                    Next: Specs
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── STEP 2: Specs & Details ─── */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-5 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                      <Settings className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Specs & Details</h2>
                      <p className="text-xs text-slate-400">Engine, drivetrain, performance, and colors.</p>
                    </div>
                  </div>

                  {availableTrims.length > 0 && (
                    <div className="mb-6 p-4 rounded-xl border border-blue-500/30 bg-blue-500/5">
                      <Label className="text-blue-400 mb-2 block">Match your exact spec to auto-fill:</Label>
                      <Select value={selectedTrimId} onValueChange={handleTrimSelect}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white w-full">
                          <SelectValue placeholder="Select a trim model (Optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTrims.map((trim, idx) => (
                            <SelectItem key={trim.model_trim || idx} value={trim.model_trim || `trim-${idx}`}>
                              {trim.model_trim ? trim.model_trim : `Base Model`}
                              {trim.model_engine_cc && ` — ${(parseInt(trim.model_engine_cc) / 1000).toFixed(1)}L`}
                              {trim.model_transmission_type && ` — ${trim.model_transmission_type}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type <span className="text-red-400">*</span></Label>
                      <Select
                        value={carData.fuelType}
                        onValueChange={(value) => handleSelectChange("fuelType", value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select fuel type" />
                        </SelectTrigger>
                        <SelectContent>
                          {FUEL_TYPES.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    {carData.fuelType !== "Electric" && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="engine">Engine <span className="text-red-400">*</span></Label>
                          <Input id="engine" name="engine" value={carData.engine} onChange={handleChange} placeholder="e.g., 2JZ-GTE" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transmission">Transmission <span className="text-red-400">*</span></Label>
                          <Select
                            value={carData.transmission}
                            onValueChange={(value) => handleSelectChange("transmission", value)}
                          >
                            <SelectTrigger className="bg-white/5 border-white/10 text-white">
                              <SelectValue placeholder="Select transmission" />
                            </SelectTrigger>
                            <SelectContent>
                              {TRANSMISSIONS.map((t) => (
                                <SelectItem key={t} value={t}>{t}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </>
                    )}


                    <div className="space-y-2">
                      <Label htmlFor="drivetrain">Drivetrain <span className="text-red-400">*</span></Label>
                      <Select
                        value={carData.drivetrain}
                        onValueChange={(value) => handleSelectChange("drivetrain", value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select drivetrain" />
                        </SelectTrigger>
                        <SelectContent>
                          {DRIVETRAINS.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bodyStyle">Body Style <span className="text-red-400">*</span></Label>
                      <Select
                        value={carData.bodyStyle}
                        onValueChange={(value) => handleSelectChange("bodyStyle", value)}
                      >
                        <SelectTrigger className="bg-white/5 border-white/10 text-white">
                          <SelectValue placeholder="Select body style" />
                        </SelectTrigger>
                        <SelectContent>
                          {BODY_STYLES.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exteriorColor">Exterior Color <span className="text-red-400">*</span></Label>
                      <Input id="exteriorColor" name="exteriorColor" value={carData.exteriorColor} onChange={handleChange} placeholder="e.g., Alpine White" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interiorColor">Interior Color <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="interiorColor" name="interiorColor" value={carData.interiorColor} onChange={handleChange} placeholder="e.g., Cognac Leather" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="generation">Generation <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="generation" name="generation" value={carData.generation} onChange={handleChange} placeholder="e.g., MK4" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="powerHp">Power (HP) <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="powerHp" name="powerHp" value={carData.powerHp} onChange={handleChange} placeholder="e.g., 326" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="torqueLbFt">Torque (lb-ft) <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="torqueLbFt" name="torqueLbFt" value={carData.torqueLbFt} onChange={handleChange} placeholder="e.g., 315" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="mt-8 space-y-2">
                    <Label htmlFor="description">Description <span className="text-slate-500 font-normal">(Optional)</span></Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={carData.description}
                      onChange={handleChange}
                      placeholder="Tell us about your car — the story, the build, the vision..."
                      rows={4}
                      className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:ring-blue-500 focus:border-blue-500 resize-y min-h-[100px] whitespace-pre-line"
                    />
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button type="button" onClick={prevStep} variant="outline" className="border-white/10 text-white hover:bg-white/5 px-6 py-5 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button type="button" onClick={nextStep} disabled={!canProceedStep2} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-5 rounded-xl font-medium">
                    Next: Gallery
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Gallery ─── */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-5 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <Image className="h-5 w-5 text-amber-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Photo Gallery</h2>
                      <p className="text-xs text-slate-400">Upload up to 8 photos. First image becomes the cover.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagePreviewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-[4/3] group rounded-xl overflow-hidden border border-white/10">
                        <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                        {index === 0 && (
                          <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-500/90 backdrop-blur-sm text-[10px] font-bold text-white rounded-full uppercase tracking-wider">
                            Cover
                          </div>
                        )}
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          className="absolute top-2 right-2 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X size={14} />
                        </Button>
                      </div>
                    ))}
                    {images.length < 8 && (
                      <div
                        className="relative aspect-[4/3] border-2 border-dashed border-white/10 bg-white/[0.02] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/30 hover:bg-blue-500/5 transition-all duration-200"
                        onClick={triggerFileInput}
                      >
                        <Camera size={28} className="text-slate-500 mb-2" />
                        <p className="text-xs text-slate-500 font-medium">Add Photo</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{images.length}/8</p>
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

                {/* Navigation */}
                <div className="flex justify-between">
                  <Button type="button" onClick={prevStep} variant="outline" className="border-white/10 text-white hover:bg-white/5 px-6 py-5 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedStep3}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-5 rounded-xl font-medium"
                  >
                    Next: Mods
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* ─── STEP 4: Mods ─── */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-5 md:p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Wrench className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold">Shop the Build</h2>
                      <p className="text-xs text-slate-400">Add parts used in your build. These become shoppable product links.</p>
                    </div>
                  </div>

                  {/* Add Mod Form */}
                  <div className="space-y-4 p-4 border border-white/10 rounded-xl bg-white/[0.02]">
                    <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-4 items-start">
                      {/* Mod Image */}
                      <div className="space-y-2">
                        <Label htmlFor="modImage">Image</Label>
                        <div
                          className="relative aspect-square w-[100px] bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors"
                          onClick={triggerModFileInput}
                        >
                          {currentMod.image ? (
                            <img src={URL.createObjectURL(currentMod.image)} alt="Mod preview" className="w-full h-full object-cover rounded-xl" />
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
                          <div className="space-y-2">
                            <Label htmlFor="modName">Mod Name</Label>
                            <Input id="modName" name="name" value={currentMod.name} onChange={handleModChange} placeholder="e.g., Performance Air Filter" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="modCategory">Category</Label>
                            <Input id="modCategory" name="category" value={currentMod.category} onChange={handleModChange} placeholder="e.g., Engine, Suspension" className="bg-white/5 border-white/10 text-white placeholder:text-slate-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="modUrl">Purchase URL</Label>
                            {canUseAffiliateLinks === false && (
                              <div
                                className="flex items-center text-xs text-yellow-500 cursor-pointer hover:underline"
                                onClick={() => navigate('/subscription')}
                              >
                                <Lock size={12} className="mr-1" />
                                <span>Pro Feature</span>
                              </div>
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              id="modUrl"
                              name="purchaseUrl"
                              value={currentMod.purchaseUrl}
                              onChange={handleModChange}
                              placeholder="https://example.com/product"
                              disabled={canUseAffiliateLinks === false}
                              className={`bg-white/5 border-white/10 text-white placeholder:text-slate-500 ${canUseAffiliateLinks === false ? "opacity-50 cursor-not-allowed pr-10" : ""}`}
                            />
                            {canUseAffiliateLinks === false && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                <Lock size={16} className="text-slate-500" />
                              </div>
                            )}
                          </div>
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
                    <div className="space-y-2 mt-6">
                      <Label className="text-sm font-medium">Added Mods ({mods.length})</Label>
                      <div className="rounded-xl border border-white/10 divide-y divide-white/5 overflow-hidden">
                        {mods.map((mod, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                            <div className="flex items-center gap-4">
                              {mod.image ? (
                                <img src={URL.createObjectURL(mod.image)} alt={mod.name} className="w-12 h-12 object-cover rounded-lg" />
                              ) : (
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center">
                                  <ShoppingBag size={20} className="text-slate-500" />
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium">{mod.name}</p>
                                <p className="text-xs text-slate-400">{mod.category}</p>
                              </div>
                            </div>
                            <Button type="button" variant="ghost" size="icon" onClick={() => removeModFromList(index)} className="text-slate-400 hover:text-red-400">
                              <X size={16} />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Navigation + Submit */}
                <div className="flex justify-between">
                  <Button type="button" onClick={prevStep} variant="outline" className="border-white/10 text-white hover:bg-white/5 px-6 py-5 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white px-8 py-5 rounded-xl font-semibold shadow-lg shadow-blue-500/20"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 size={20} className="mr-2 animate-spin" />
                        {uploading ? `Uploading (${Math.round(uploadProgress)}%)` : "Adding Car..."}
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="mr-2 h-5 w-5" />
                        Add to Garage
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
