import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  ShoppingBag, 
  ExternalLink, 
  Package, 
  DollarSign,
  Calendar,
  User,
  Car,
  Loader2
} from "lucide-react";
import CarImageWithUrl from "@/components/cars/CarImageWithUrl";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const ShopBuildPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isMobile = useMediaQuery("(max-width: 767px)");
  
  // Analytics tracking
  const logAnalytics = useMutation(api.analytics.logEvent);

  // Fetch car details and parts
  const car = useQuery(api.cars.getCarById, { carId: id as Id<"cars"> });
  const parts = useQuery(api.parts.getCarParts, id ? { carId: id as Id<"cars"> } : "skip");
  const user = useQuery(api.users.getUserById, car?.userId ? { userId: car.userId } : "skip");

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
      partId: partId,
      carId: id as Id<"cars">,
      visitorDevice: isMobile ? "mobile" : "desktop",
    });
  };

  if (!car) {
    return (
      <ResponsiveLayout>
        <div className="p-4 flex items-center justify-center h-full">
          <div className="text-center">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading shop build...</p>
          </div>
        </div>
      </ResponsiveLayout>
    );
  }

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

  const totalValue = parts?.reduce((sum, part) => sum + (part.price || 0), 0) || 0;

  return (
    <ResponsiveLayout>
      <div className="bg-background text-foreground min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigate(-1)}
                  className="rounded-full"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-semibold">Shop the Build</h1>
                  <p className="text-sm text-muted-foreground">
                    {car.make} {car.model} ({car.year})
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium">
                  {parts?.length || 0} Parts
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 max-w-6xl">
          {/* Car Overview */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {car.make} {car.model} ({car.year})
                  </CardTitle>
                  <p className="text-muted-foreground mt-1">
                    Built by {user?.username || 'Unknown User'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    ${totalValue.toFixed(2)}
                  </div>
                  <p className="text-sm text-muted-foreground">Total Build Value</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Car Image */}
                <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                  {car.images && car.images.length > 0 ? (
                    <CarImageWithUrl
                      storageId={car.images[0]}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Car Specs */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Specifications</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {car.powerHp && (
                        <div>
                          <span className="text-muted-foreground">Horsepower:</span>
                          <span className="ml-2 font-medium">{car.powerHp}</span>
                        </div>
                      )}
                      {car.torqueLbFt && (
                        <div>
                          <span className="text-muted-foreground">Torque:</span>
                          <span className="ml-2 font-medium">{car.torqueLbFt}</span>
                        </div>
                      )}
                      {car.engine && (
                        <div>
                          <span className="text-muted-foreground">Engine:</span>
                          <span className="ml-2 font-medium">{car.engine}</span>
                        </div>
                      )}
                      {car.transmission && (
                        <div>
                          <span className="text-muted-foreground">Transmission:</span>
                          <span className="ml-2 font-medium">{car.transmission}</span>
                        </div>
                      )}
                      {car.drivetrain && (
                        <div>
                          <span className="text-muted-foreground">Drivetrain:</span>
                          <span className="ml-2 font-medium">{car.drivetrain}</span>
                        </div>
                      )}
                      {car.bodyStyle && (
                        <div>
                          <span className="text-muted-foreground">Body Style:</span>
                          <span className="ml-2 font-medium">{car.bodyStyle}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {car.description && (
                    <div>
                      <h3 className="font-semibold mb-2">Description</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {car.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parts Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Build Parts</h2>
              <Badge variant="secondary">
                {parts?.length || 0} Parts
              </Badge>
            </div>

            {parts && parts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {parts.map((part) => (
                  <Card key={part._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-muted">
                      {part.image ? (
                        <CarImageWithUrl
                          storageId={part.image}
                          alt={part.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{part.name}</CardTitle>
                        {part.price && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-600">
                              ${part.price.toFixed(2)}
                            </div>
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="w-fit">
                        {part.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {part.description && (
                        <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                          {part.description}
                        </p>
                      )}
                      
                      {part.purchaseUrl ? (
                        <Button
                          className="w-full"
                          onClick={() => {
                            handleProductClick(part._id, part.name);
                            window.open(part.purchaseUrl, '_blank');
                          }}
                        >
                          <ExternalLink className="h-4 w-4 mr-2" />
                          View Product
                        </Button>
                      ) : (
                        <Button variant="outline" className="w-full" disabled>
                          <Package className="h-4 w-4 mr-2" />
                          Contact for Purchase
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Parts Available</h3>
                  <p className="text-muted-foreground">
                    This build doesn't have any parts listed yet.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          
        </div>
      </div>
    </ResponsiveLayout>
  );
};

export default ShopBuildPage; 