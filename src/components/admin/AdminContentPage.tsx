import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
    Search,
    Car,
    Wrench,
    MoreHorizontal,
    Trash2,
    ExternalLink,
    ChevronLeft,
    ChevronRight,
    DollarSign
} from "lucide-react";
import { Link } from "react-router-dom";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ResponsiveTable, Column } from "@/components/ui/ResponsiveTable";
import { Card, CardContent } from "@/components/ui/card";

const AdminContentPage = () => {
    const { toast } = useToast();
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Pagination state
    const [carsCursor, setCarsCursor] = useState<string | null>(null);
    const [partsCursor, setPartsCursor] = useState<string | null>(null);

    // Delete confirmation state
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [deleteType, setDeleteType] = useState<"car" | "part" | null>(null);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            setCarsCursor(null);
            setPartsCursor(null);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Queries
    const carsData = useQuery(api.adminContent.getAdminCars, {
        limit: 20,
        cursor: carsCursor || undefined,
        searchQuery: debouncedSearch || undefined,
    });

    const partsData = useQuery(api.adminContent.getAdminParts, {
        limit: 20,
        cursor: partsCursor || undefined,
        searchQuery: debouncedSearch || undefined,
    });

    // Mutations
    const deleteCar = useMutation(api.adminContent.deleteCar);
    const deletePart = useMutation(api.adminContent.deletePart);

    const handleDelete = async () => {
        if (!deleteId || !deleteType) return;

        try {
            if (deleteType === "car") {
                await deleteCar({ carId: deleteId as Id<"cars"> });
            } else {
                await deletePart({ partId: deleteId as Id<"parts"> });
            }
            toast({
                title: "Deleted",
                description: `Successfully deleted ${deleteType}.`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete item.",
                variant: "destructive",
            });
        } finally {
            setDeleteId(null);
            setDeleteType(null);
        }
    };

    // Columns Configuration
    const carColumns: Column<any>[] = [
        {
            header: "Car",
            cell: (car) => (
                <div className="font-medium">
                    {car.make} {car.model}
                </div>
            )
        },
        {
            header: "Owner",
            cell: (car) => (
                <div className="flex flex-col">
                    <span>{car.ownerName}</span>
                    <span className="text-xs text-muted-foreground">{car.ownerEmail}</span>
                </div>
            )
        },
        {
            header: "Year",
            accessorKey: "year"
        },
        {
            header: "Status",
            cell: (car) => (
                <Badge variant={car.isPublished ? "default" : "secondary"}>
                    {car.isPublished ? "Published" : "Draft"}
                </Badge>
            )
        },
        {
            header: "Created",
            cell: (car) => (
                <span className="text-muted-foreground text-sm">
                    {car.createdAt ? new Date(car._creationTime).toLocaleDateString() : "N/A"}
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (car) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link to={`/car/${car._id}`} target="_blank">
                                    <ExternalLink className="mr-2 h-4 w-4" /> View Public
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                    setDeleteId(car._id);
                                    setDeleteType("car");
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const partColumns: Column<any>[] = [
        {
            header: "Part",
            cell: (part) => <span className="font-medium">{part.name}</span>
        },
        {
            header: "Category",
            cell: (part) => <Badge variant="outline">{part.category}</Badge>
        },
        {
            header: "Car",
            accessorKey: "carName"
        },
        {
            header: "Price",
            cell: (part) => (
                <span>{part.price ? `$${part.price}` : "-"}</span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (part) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                    setDeleteId(part._id);
                                    setDeleteType("part");
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];


    // Mobile Card Renderers
    const renderCarCard = (car: any) => (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg">{car.make} {car.model}</div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link to={`/car/${car._id}`} target="_blank">
                                    <ExternalLink className="mr-2 h-4 w-4" /> View Public
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                    setDeleteId(car._id);
                                    setDeleteType("car");
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                    {car.year} • {car.ownerName}
                </div>
                <div className="flex flex-wrap gap-2 mb-2">
                    <Badge variant={car.isPublished ? "default" : "secondary"}>
                        {car.isPublished ? "Published" : "Draft"}
                    </Badge>
                </div>
                <div className="text-xs text-muted-foreground">
                    Created {car.createdAt ? new Date(car._creationTime).toLocaleDateString() : "N/A"}
                </div>
            </CardContent>
        </Card>
    );

    const renderPartCard = (part: any) => (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg">{part.name}</div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => {
                                    setDeleteId(part._id);
                                    setDeleteType("part");
                                }}
                            >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="text-sm text-muted-foreground mb-2">
                    {part.carName}
                </div>
                <div className="flex justify-between items-center">
                    <Badge variant="outline">{part.category}</Badge>
                    <div className="font-medium">
                        {part.price ? `$${part.price}` : "-"}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Content Management</h1>
            </div>

            <Tabs defaultValue="cars" className="w-full">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="cars" className="flex items-center gap-2">
                        <Car className="h-4 w-4" />
                        Cars
                    </TabsTrigger>
                    <TabsTrigger value="parts" className="flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        Parts
                    </TabsTrigger>
                </TabsList>

                <div className="my-6 flex items-center gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search content..."
                            className="pl-8 bg-background/50 backdrop-blur-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <TabsContent value="cars" className="space-y-4">
                    <ResponsiveTable
                        data={carsData?.cars || []}
                        columns={carColumns}
                        keyExtractor={(car) => car._id}
                        renderMobileCard={renderCarCard}
                        emptyMessage={carsData ? "No cars found." : "Loading..."}
                    />

                    {/* Simple Pagination for Cars */}
                    <div className="flex items-center justify-end space-x-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCarsCursor(null)} // Reset to start (simple prev for now)
                            disabled={!carsCursor}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            First Page
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCarsCursor(carsData?.nextCursor || null)}
                            disabled={!carsData?.nextCursor}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </TabsContent>

                <TabsContent value="parts" className="space-y-4">
                    <ResponsiveTable
                        data={partsData?.parts || []}
                        columns={partColumns}
                        keyExtractor={(part) => part._id}
                        renderMobileCard={renderPartCard}
                        emptyMessage={partsData ? "No parts found." : "Loading..."}
                    />

                    {/* Simple Pagination for Parts */}
                    <div className="flex items-center justify-end space-x-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPartsCursor(null)}
                            disabled={!partsCursor}
                        >
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            First Page
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPartsCursor(partsData?.nextCursor || null)}
                            disabled={!partsData?.nextCursor}
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-2" />
                        </Button>
                    </div>
                </TabsContent>
            </Tabs>

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the {deleteType}.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default AdminContentPage;
