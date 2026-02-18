import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ShoppingBag,
  ExternalLink,
  Package,
  ShoppingBasket,
  DollarSign,
  ImageIcon,
  Car,
  Loader2,
  Copy,
  Tag
} from "lucide-react";
import CarImageWithUrl from "@/components/cars/CarImageWithUrl";
import { useIsMobile } from "@/hooks/use-mobile";
import { motion } from "framer-motion";

const ShopBuildPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Analytics tracking
  const logAnalytics = useMutation(api.analytics.logEvent);

  // Fetch car details and parts
  const car = useQuery(api.cars.getCarById, { carId: id as Id<"cars"> });
  const parts = useQuery(api.parts.getCarParts, id ? { carId: id as Id<"cars"> } : "skip");
  // @ts-ignore
  const ownerTier = useQuery(api.freemium.getPublicUserTier, car ? { userId: car.userId } : "skip");

  // Get unique categories for filtering
  const categories = parts ? [...new Set(parts.map(part => part.category))].filter(Boolean) as string[] : [];

  // Filter parts by category if a filter is active
  const filteredParts = activeFilter
    ? parts?.filter(part => part.category === activeFilter)
    : parts;

  // Track page view
  useEffect(() => {
    if (car) {
      logAnalytics({
        type: "shop_build_page_view",
        carId: id as Id<"cars">,
        visitorDevice: isMobile ? "mobile" : "desktop",
      });
    }
  }, [car, id, logAnalytics, isMobile]);

  // Track product clicks
  const handleProductClick = (partId: Id<"parts">, partName: string) => {
    logAnalytics({
      type: "product_click",
      partId,
      carId: id as Id<"cars">,
      visitorDevice: isMobile ? "mobile" : "desktop",
    });
  };

  // Copy coupon code to clipboard
  const handleCopyCoupon = async () => {
    const couponCode = "CARFOLIO10";
    try {
      await navigator.clipboard.writeText(couponCode);
      toast({
        title: "Coupon code copied!",
        description: `${couponCode} has been copied to your clipboard.`,
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually.",
        variant: "destructive",
      });
    }
  };

  // Loading state
  if (!car) {
    return (
      <ResponsiveLayout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="min-h-[300px] flex items-center justify-center"
        >
          <div className="text-center p-8 max-w-md">
            <div className="bg-slate-800/30 p-8 rounded-xl backdrop-blur-sm">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-lg text-slate-200">Loading shop build...</p>
            </div>
          </div>
        </motion.div>
      </ResponsiveLayout>
    );
  }

  // Not found state
  if (car === null) {
    return (
      <ResponsiveLayout>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="min-h-[300px] flex items-center justify-center"
        >
          <div className="text-center p-8 max-w-md">
            <div className="bg-slate-800/30 p-8 rounded-xl backdrop-blur-sm">
              <Car className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2 text-white">Car Not Found</h2>
              <p className="text-slate-300 mb-6">
                The car you're looking for doesn't exist or has been removed.
              </p>
              <Button
                onClick={() => navigate('/cars')}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cars
              </Button>
            </div>
          </div>
        </motion.div>
      </ResponsiveLayout>
    );
  }

  const totalValue = parts?.reduce((sum, part) => sum + (part.price || 0), 0) || 0;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <ResponsiveLayout>
      <div className="bg-slate-900 text-slate-100">
        {/* Header with car details */}
        <header className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-full text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold text-white">Shop the Build</h1>
                  <p className="text-sm text-slate-400">
                    {car.make} {car.model} ({car.year})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-slate-800 py-1.5 px-3 rounded-full flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium text-slate-200">
                    {parts?.length || 0} Parts
                  </span>
                </div>
                {totalValue > 0 && (
                  <div className="bg-slate-800 py-1.5 px-3 rounded-full flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-400" />
                    <span className="text-sm font-medium text-slate-200">
                      ${totalValue.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Coupon Code Section */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <Card className="border-2 border-dashed border-blue-500/50 bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-sm overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-500/20 p-3 rounded-full">
                      <Tag className="h-6 w-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">Exclusive Discount Code</h3>
                      <p className="text-sm text-slate-300">Save 10% on featured parts from this build</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800/80 px-6 py-3 rounded-lg border border-slate-700">
                      <code className="text-xl font-mono font-bold text-blue-400 tracking-wider">CARFOLIO10</code>
                    </div>
                    <Button
                      onClick={handleCopyCoupon}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="lg"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Code
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Category filters */}
          {categories.length > 1 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <Button
                  variant={activeFilter === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveFilter(null)}
                  className={cn(
                    "rounded-full",
                    activeFilter === null ? "bg-blue-600" : "border-slate-700 text-slate-300"
                  )}
                >
                  All Parts
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeFilter === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(category)}
                    className={cn(
                      "rounded-full",
                      activeFilter === category ? "bg-blue-600" : "border-slate-700 text-slate-300"
                    )}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Parts display - Grid layout */}
          {filteredParts && filteredParts.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredParts.map((part) => (
                <motion.div
                  key={part._id}
                  variants={itemVariants}
                  onMouseEnter={() => setHoveredCard(part._id)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <Card className={cn(
                    "overflow-hidden transition-all duration-300 border-slate-800 bg-slate-800/50 backdrop-blur-sm",
                    hoveredCard === part._id ? "shadow-lg shadow-blue-500/10 scale-[1.02] border-slate-700" : ""
                  )}>
                    {/* Image section */}
                    <div className="relative aspect-video overflow-hidden">
                      {part.image ? (
                        <div className="relative h-full w-full group">
                          <CarImageWithUrl
                            storageId={part.image}
                            alt={part.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60" />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-700/30">
                          <ImageIcon className="h-12 w-12 text-slate-500" />
                        </div>
                      )}

                      {/* Price tag */}
                      {part.price && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-green-600 text-white hover:bg-green-700">
                            ${part.price.toFixed(2)}
                          </Badge>
                        </div>
                      )}

                      {/* Category tag */}
                      <div className="absolute top-3 left-3">
                        <Badge
                          variant="outline"
                          className="bg-slate-900/70 border-slate-700 text-slate-300 backdrop-blur-sm"
                        >
                          {part.category}
                        </Badge>
                      </div>
                    </div>

                    {/* Content section */}
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl text-slate-100">
                        {part.name}
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="pb-0">
                      {part.description && (
                        <CardDescription className="text-slate-400 mb-4 line-clamp-2 leading-relaxed">
                          {part.description}
                        </CardDescription>
                      )}
                    </CardContent>

                    <CardFooter className="pt-2 pb-4">
                      {part.purchaseUrl && ownerTier !== "free" ? (
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => {
                            handleProductClick(part._id, part.name);
                            window.open(part.purchaseUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Product
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full border-slate-700 text-slate-300" disabled>
                          <ShoppingBasket className="h-4 w-4 mr-2" />
                          {part.purchaseUrl ? "Link Locked" : "Contact for Purchase"}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-auto"
            >
              <Card className="border-slate-800 bg-slate-800/30 overflow-hidden">
                <div className="py-16 text-center">
                  <div className="bg-slate-800/70 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShoppingBag className="h-10 w-10 text-slate-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-100 mb-3">No Parts Available</h3>
                  <p className="text-slate-400 max-w-md mx-auto">
                    {activeFilter
                      ? `No parts found in the "${activeFilter}" category.`
                      : "This build doesn't have any parts listed yet."}
                  </p>
                  {activeFilter && (
                    <Button
                      variant="outline"
                      onClick={() => setActiveFilter(null)}
                      className="mt-6 border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      Show All Parts
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default ShopBuildPage; 