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

import { processImages, convertHeicToJpeg, isHeic } from "@/utils/imageUtils";
import { motion, AnimatePresence } from "framer-motion";

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
  "Manual",
  "Automatic",
];

const DRIVETRAINS = [
  "RWD",
  "FWD",
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

// Comprehensive models by make
const MODELS_BY_MAKE: Record<string, string[]> = {
  "Acura": ["Integra", "ILX", "TLX", "RLX", "MDX", "RDX", "NSX", "RSX", "TSX", "TL", "ZDX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "4C", "Tonale", "GTV", "Spider", "159", "Giulietta"],
  "Aston Martin": ["Vantage", "DB11", "DB12", "DBS", "DBX", "Rapide", "Valkyrie", "Vanquish"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q3", "Q5", "Q7", "Q8", "R8", "RS3", "RS5", "RS6", "RS7", "S3", "S4", "S5", "TT", "e-tron", "e-tron GT"],
  "Bentley": ["Continental GT", "Flying Spur", "Bentayga", "Mulsanne", "Arnage"],
  "BMW": ["1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z4", "i3", "i4", "i5", "i7", "iX", "M2", "M3", "M4", "M5", "M8"],
  "Bugatti": ["Chiron", "Veyron", "Divo", "Centodieci", "Bolide", "Mistral"],
  "Buick": ["Enclave", "Encore", "Encore GX", "Envista", "Envision", "Regal", "LaCrosse", "Riviera"],
  "Cadillac": ["CT4", "CT5", "Escalade", "XT4", "XT5", "XT6", "Lyriq", "Celestiq", "CTS", "ATS", "STS", "DTS"],
  "Chevrolet": ["Blazer", "Camaro", "Colorado", "Corvette", "Equinox", "Impala", "Malibu", "Silverado", "Suburban", "Tahoe", "Traverse", "Trailblazer", "Bolt", "Monte Carlo", "Spark", "Cruze"],
  "Chrysler": ["300", "Pacifica", "Voyager", "Sebring", "PT Cruiser", "Crossfire"],
  "Citroën": ["C3", "C4", "C5", "C5 Aircross", "Berlingo", "DS3", "DS4", "DS5"],
  "Dodge": ["Challenger", "Charger", "Durango", "Hornet", "Viper", "Dart", "Journey", "Neon"],
  "Ferrari": ["296 GTB", "488", "F8 Tributo", "812 Superfast", "SF90", "Roma", "Portofino", "LaFerrari", "458", "California", "F40", "F50", "Enzo", "Purosangue"],
  "Fiat": ["500", "500X", "500L", "124 Spider", "Panda", "Tipo", "Punto"],
  "Ford": ["Bronco", "Edge", "Escape", "Expedition", "Explorer", "F-150", "Fiesta", "Focus", "Fusion", "Mustang", "Mustang Mach-E", "Ranger", "Maverick", "GT", "Bronco Sport", "Lightning"],
  "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  "GMC": ["Sierra", "Canyon", "Yukon", "Acadia", "Terrain", "Hummer EV", "Envoy"],
  "Honda": ["Accord", "Civic", "CR-V", "Element", "Fit", "HR-V", "Insight", "Odyssey", "Passport", "Pilot", "Ridgeline", "S2000", "Integra", "Prelude", "NSX", "CR-Z"],
  "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Kona", "Palisade", "Ioniq 5", "Ioniq 6", "Veloster", "Genesis Coupe", "Accent", "Venue"],
  "Infiniti": ["Q50", "Q60", "Q70", "QX50", "QX55", "QX60", "QX80", "G35", "G37", "FX35"],
  "Jaguar": ["F-Type", "XE", "XF", "XJ", "F-Pace", "E-Pace", "I-Pace", "XK", "S-Type"],
  "Jeep": ["Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator", "Wagoneer", "Grand Wagoneer"],
  "Kia": ["Forte", "K5", "Stinger", "Seltos", "Sportage", "Sorento", "Telluride", "Soul", "EV6", "EV9", "Niro", "Carnival"],
  "Koenigsegg": ["Jesko", "Gemera", "Regera", "Agera", "One:1", "CC850"],
  "Lamborghini": ["Huracán", "Aventador", "Urus", "Gallardo", "Murciélago", "Diablo", "Countach", "Revuelto"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Defender", "Discovery", "Range Rover Velar", "Range Rover Evoque", "Discovery Sport"],
  "Lexus": ["IS", "ES", "GS", "LS", "RC", "LC", "NX", "RX", "GX", "LX", "UX", "LFA"],
  "Lincoln": ["Aviator", "Corsair", "Nautilus", "Navigator", "Continental", "MKZ", "Town Car"],
  "Lotus": ["Emira", "Evora", "Elise", "Exige", "Esprit", "Eletre"],
  "Maserati": ["Ghibli", "Quattroporte", "Levante", "MC20", "GranTurismo", "GranCabrio", "Grecale"],
  "Mazda": ["Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-50", "CX-9", "CX-90", "MX-5 Miata", "RX-7", "RX-8"],
  "McLaren": ["720S", "765LT", "GT", "Artura", "570S", "600LT", "P1", "Senna", "Elva"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "CLA", "CLS", "GLA", "GLB", "GLC", "GLE", "GLS", "G-Class", "AMG GT", "AMG One", "SL", "SLC", "EQS", "EQE", "Maybach"],
  "Mini": ["Cooper", "Cooper S", "Countryman", "Clubman", "Convertible", "John Cooper Works"],
  "Mitsubishi": ["Outlander", "Eclipse Cross", "Outlander Sport", "Mirage", "Lancer", "Lancer Evolution", "Eclipse", "3000GT"],
  "Nissan": ["Altima", "Maxima", "Sentra", "Versa", "370Z", "Z", "GT-R", "Rogue", "Pathfinder", "Murano", "Kicks", "Frontier", "Titan", "Leaf", "Ariya", "Skyline", "Silvia", "240SX"],
  "Pagani": ["Huayra", "Zonda", "Utopia"],
  "Peugeot": ["208", "308", "508", "2008", "3008", "5008", "RCZ"],
  "Porsche": ["911", "718 Cayman", "718 Boxster", "Taycan", "Panamera", "Macan", "Cayenne", "Carrera GT", "918 Spyder", "GT3", "GT4"],
  "Ram": ["1500", "2500", "3500", "TRX", "ProMaster"],
  "Renault": ["Clio", "Mégane", "Captur", "Kadjar", "Talisman", "Zoe", "Alpine A110"],
  "Rolls-Royce": ["Phantom", "Ghost", "Wraith", "Dawn", "Cullinan", "Spectre", "Silver Shadow"],
  "Subaru": ["Impreza", "WRX", "WRX STI", "BRZ", "Legacy", "Outback", "Forester", "Crosstrek", "Ascent", "Solterra"],
  "Suzuki": ["Swift", "Jimny", "Vitara", "S-Cross", "Ignis", "Hayabusa", "Samurai"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y", "Cybertruck", "Roadster"],
  "Toyota": ["Avalon", "Camry", "Corolla", "GR86", "GR Supra", "GR Corolla", "Highlander", "Land Cruiser", "Prius", "RAV4", "Sequoia", "Tacoma", "Tundra", "Venza", "4Runner", "Crown", "bZ4X", "MR2", "Celica"],
  "Volkswagen": ["Golf", "Golf GTI", "Golf R", "Jetta", "Passat", "Arteon", "Tiguan", "Atlas", "Taos", "ID.4", "ID.Buzz", "Beetle", "Polo", "Scirocco"],
  "Volvo": ["S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40", "EX30", "EX90"]
};

// Fallback: empty list — combobox lets users type anything
const COMMON_MODELS: string[] = [];

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
          className="w-full h-14 px-5 justify-between rounded-2xl bg-white/[0.03] border-white/[0.06] text-white font-medium shadow-inner shadow-black/20 hover:bg-white/[0.06] hover:border-white/10 hover:text-white transition-all duration-300"
        >
          <span className={`truncate ${!value ? 'text-slate-500' : ''}`}>{value || placeholder}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0 bg-zinc-950/95 backdrop-blur-xl border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 z-[100]" align="start">
        <Command className="bg-transparent text-white">
          <CommandInput
            placeholder={`Search ${placeholder.toLowerCase()}...`}
            value={searchValue}
            onValueChange={setSearchValue}
            className="h-12 text-white placeholder:text-slate-500"
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
                  className="bg-white/[0.06] hover:bg-white/10 border-white/[0.08] hover:border-white/15 text-white rounded-xl transition-all duration-200"
                >
                  Use &ldquo;{searchValue}&rdquo;
                </Button>
              )}
            </div>
          </CommandEmpty>
          <CommandList className="max-h-[250px] overflow-y-auto p-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/10">
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
                  className="rounded-xl px-3 py-2.5 aria-selected:bg-blue-500/15 aria-selected:text-blue-300 text-white hover:bg-white/[0.06] cursor-pointer transition-colors duration-150"
                >
                  <Check
                    className={`mr-2 h-4 w-4 text-blue-400 ${value === option ? "opacity-100" : "opacity-0"}`}
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
      if (carData.make && carData.model && carData.year) {
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
  }, [carData.make, carData.model, carData.year]);

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

  const handleModImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploading(true);
      try {
        const processedFile = await convertHeicToJpeg(file);
        setCurrentMod(prev => ({ ...prev, image: processedFile }));
      } catch (err) {
        console.error("Mod image processing failed", err);
      } finally {
        setUploading(false);
      }
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif'];

      const rawFiles = Array.from(e.target.files);
      const validFiles = rawFiles.filter(file => {
        // Check file size
        if (file.size > MAX_FILE_SIZE) {
          toast({
            title: "File too large",
            description: `"${file.name}" exceeds 10MB limit. Please compress or resize the image.`,
            variant: "destructive"
          });
          return false;
        }
        // Check file type (allowing HEIC/HEIF now)
        const isActuallyHeic = isHeic(file);
        if (!ALLOWED_TYPES.includes(file.type) && !isActuallyHeic) {
          toast({
            title: "Invalid file type",
            description: `"${file.name}" is not a valid image. Please use JPEG, PNG, WebP, GIF, or HEIC.`,
            variant: "destructive"
          });
          return false;
        }
        return true;
      });

      if (validFiles.length === 0) return;

      // Process images (convert HEIC to JPEG)
      setUploading(true);
      try {
        console.log("Processing images:", validFiles.map(f => `${f.name} (${f.type})`));
        const newFiles = await processImages(validFiles);
        console.log("Processed images:", newFiles.map(f => `${f.name} (${f.type})`));
        
        const totalImages = [...images, ...newFiles].slice(0, 8);
        setImages(totalImages);
        const newPreviewUrls = totalImages.map(file => URL.createObjectURL(file));
        setImagePreviewUrls(newPreviewUrls);
      } catch (err) {
        console.error("Image processing failed", err);
        toast({
          title: "Processing failed",
          description: "We couldn't process some of your images. Please try with regular JPEG/PNG files.",
          variant: "destructive"
        });
      } finally {
        setUploading(false);
      }
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
    <>
      <ResponsiveLayout>
      <div className="bg-transparent text-white">
        <div className="container mx-auto px-0 md:px-4 py-0 md:py-8 max-w-3xl">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-heading">Add a New Car</h1>
                <p className="text-sm text-slate-400 mt-1">Step {currentStep} of 4</p>
              </div>
            </div>

            {/* Progress Stepper */}
            <div className="flex items-center gap-1 mb-8">
              {steps.map((step, i) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div
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
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`w-4 md:w-8 h-px mx-1 flex-shrink-0 ${currentStep > step.number ? "bg-emerald-500/40" : "bg-white/10"
                      }`} />
                  )}
                </div>
              ))}
            </div>

            <AnimatePresence mode="wait">
            {/* ─── STEP 1: Your Car ─── */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
                      <Combobox
                        options={CAR_MAKES}
                        value={carData.make}
                        onChange={(value) => handleSelectChange("make", value)}
                        placeholder="Select make"
                        emptyMessage="Type to add a custom make"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model <span className="text-red-400">*</span></Label>
                      <Combobox
                        options={modelOptions}
                        value={carData.model}
                        onChange={(value) => handleSelectChange("model", value)}
                        placeholder="Select model"
                        emptyMessage="Type to add a custom model"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">Year <span className="text-red-400">*</span></Label>
                      <Select
                        value={carData.year}
                        onValueChange={(value) => handleSelectChange("year", value)}
                      >
                        <SelectTrigger className="input-premium">
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
                      <Input id="package" name="package" value={carData.package} onChange={handleChange} placeholder="e.g., M Sport, Premium" className="input-premium" />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 2: Specs & Details ─── */}
            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
                        <SelectTrigger className="input-premium">
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
                        <SelectTrigger className="input-premium">
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
                          <Input id="engine" name="engine" value={carData.engine} onChange={handleChange} placeholder="e.g., 2JZ-GTE" className="input-premium" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transmission">Transmission <span className="text-red-400">*</span></Label>
                          <Combobox
                            options={TRANSMISSIONS}
                            value={carData.transmission}
                            onChange={(value) => handleSelectChange("transmission", value)}
                            placeholder="Select transmission"
                            emptyMessage="Type to add custom"
                          />
                        </div>
                      </>
                    )}


                    <div className="space-y-2">
                      <Label htmlFor="drivetrain">Drivetrain <span className="text-red-400">*</span></Label>
                      <Combobox
                        options={DRIVETRAINS}
                        value={carData.drivetrain}
                        onChange={(value) => handleSelectChange("drivetrain", value)}
                        placeholder="Select drivetrain"
                        emptyMessage="Type to add custom"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bodyStyle">Body Style <span className="text-red-400">*</span></Label>
                      <Select
                        value={carData.bodyStyle}
                        onValueChange={(value) => handleSelectChange("bodyStyle", value)}
                      >
                        <SelectTrigger className="input-premium">
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
                      <Input id="exteriorColor" name="exteriorColor" value={carData.exteriorColor} onChange={handleChange} placeholder="e.g., Alpine White" className="input-premium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interiorColor">Interior Color <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="interiorColor" name="interiorColor" value={carData.interiorColor} onChange={handleChange} placeholder="e.g., Cognac Leather" className="input-premium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="generation">Generation <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="generation" name="generation" value={carData.generation} onChange={handleChange} placeholder="e.g., MK4" className="input-premium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="powerHp">Power (HP) <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="powerHp" name="powerHp" value={carData.powerHp} onChange={handleChange} placeholder="e.g., 326" className="input-premium" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="torqueLbFt">Torque (lb-ft) <span className="text-slate-500 font-normal">(Optional)</span></Label>
                      <Input id="torqueLbFt" name="torqueLbFt" value={carData.torqueLbFt} onChange={handleChange} placeholder="e.g., 315" className="input-premium" />
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
                      className="textarea-premium resize-y min-h-[100px] whitespace-pre-line"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {/* ─── STEP 3: Gallery ─── */}
            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
              </motion.div>
            )}

            {/* ─── STEP 4: Mods ─── */}
            {currentStep === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
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
                          className="relative aspect-square w-[100px] bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-center cursor-pointer hover:border-white/20 transition-colors overflow-hidden"
                          onClick={triggerModFileInput}
                        >
                          {currentMod.image ? (
                            <ModThumbnail 
                              file={currentMod.image} 
                              alt="Mod preview" 
                              className="w-full h-full object-cover" 
                            />
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
                          accept="image/*,.heic,.heif"
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
                                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0">
                                  <ModThumbnail 
                                    file={mod.image} 
                                    alt={mod.name} 
                                    className="w-full h-full object-cover" 
                                  />
                                </div>
                              ) : (
                                <div className="w-12 h-12 bg-white/5 rounded-lg flex items-center justify-center shrink-0">
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
              </motion.div>
            )}
            </AnimatePresence>

            {/* Step Navigation - Inline (persistent, just below form content) */}
            <div className="mt-8 pb-8">
              {currentStep === 1 && (
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
              )}

              {currentStep === 2 && (
                <div className="flex justify-between gap-4">
                  <Button type="button" onClick={prevStep} variant="outline" className="border-white/10 text-white hover:bg-white/5 px-6 py-5 rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={nextStep}
                    disabled={!canProceedStep2}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-800 disabled:text-slate-500 text-white px-8 py-5 rounded-xl font-medium"
                  >
                    Next: Gallery
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}

              {currentStep === 3 && (
                <div className="flex justify-between gap-4">
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
              )}

              {currentStep === 4 && (
                <div className="flex justify-between gap-4">
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
              )}
            </div>
          </form>
        </div>
      </div>
    </ResponsiveLayout>

    {/* Elegant Uploading/Adding Overlay */}
    {loading && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md transition-all duration-300">
        <div className="max-w-md w-full mx-4 p-8 rounded-3xl border border-white/10 bg-white/[0.05] shadow-2xl overflow-hidden relative group">
          {/* Animated Background Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 blur-[100px] rounded-full animate-pulse" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-500/20 blur-[100px] rounded-full animate-pulse delay-700" />
          
          <div className="relative flex flex-col items-center text-center space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full animate-ping" />
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <Loader2 className="h-10 w-10 text-white animate-spin" />
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {uploading ? "Uploading Build..." : "Adding to Garage..."}
              </h3>
              <p className="text-slate-400 text-sm max-w-[280px] mx-auto">
                {uploading 
                  ? "We're preparing your build details and gallery. Hang tight!" 
                  : "Finalizing your car's profile..."}
              </p>
            </div>

            {uploading && (
              <div className="w-full space-y-3">
                <div className="flex justify-between items-center text-xs font-medium uppercase tracking-wider text-slate-500">
                  <span>Progress</span>
                  <span className="text-blue-400">{Math.round(uploadProgress)}%</span>
                </div>
                <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-500 ease-out shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
            
            <div className="pt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                Don't close this window
              </span>
            </div>
          </div>
        </div>
      </div>
    )}
    </>
  );
}

// Separate component for mod image preview to handle URL lifecycle
function ModThumbnail({ file, alt, className }: { file: File, alt: string, className?: string }) {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  if (!url) return null;
  return <img src={url} alt={alt} className={className} />;
}
