import { useParams, Link } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveTable, Column } from "@/components/ui/ResponsiveTable";
import {
    ArrowLeft,
    Mail,
    Calendar,
    Shield,
    Car,
    Wrench,
    Activity,
    Clock,
    DollarSign,
    MoreHorizontal
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const AdminUserDetails = () => {
    const { id } = useParams<{ id: string }>();

    const user = useQuery(api.adminUsers.getUserDetails, {
        userId: id as Id<"users">
    });

    if (!user) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Car Columns
    const carColumns: Column<any>[] = [
        {
            header: "Vehicle",
            cell: (car) => (
                <div className="font-medium">
                    {car.year} {car.make} {car.model}
                </div>
            )
        },
        {
            header: "Mileage",
            cell: (car) => (
                <span className="text-muted-foreground">{car.mileage?.toLocaleString()} mi</span>
            )
        },
        {
            header: "Added",
            cell: (car) => (
                <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(car.creationTime, { addSuffix: true })}
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
                                <Link to={`/cars/${car._id}`} target="_blank">View Public Page</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    const renderCarCard = (car: any) => (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg">{car.year} {car.make} {car.model}</div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="-mr-2 -mt-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                                <Link to={`/cars/${car._id}`} target="_blank">View Public Page</Link>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                    Added {formatDistanceToNow(car.creationTime, { addSuffix: true })}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="block text-xs uppercase text-muted-foreground">Mileage</span>
                        {car.mileage?.toLocaleString()} mi
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    // Part Columns
    const partColumns: Column<any>[] = [
        {
            header: "Part Name",
            cell: (part) => (
                <div className="font-medium">{part.name}</div>
            )
        },
        {
            header: "Manufacturer",
            cell: (part) => (
                <span className="text-muted-foreground">{part.manufacturer || "N/A"}</span>
            )
        },
        {
            header: "Status",
            cell: (part) => (
                <Badge variant={part.status === "installed" ? "default" : "secondary"}>
                    {part.status}
                </Badge>
            )
        },
        {
            header: "Price",
            cell: (part) => (
                <div className="flex items-center">
                    <DollarSign className="h-3 w-3 mr-1 text-muted-foreground" />
                    {part.price || 0}
                </div>
            )
        },
        {
            header: "Added",
            cell: (part) => (
                <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(part.creationTime, { addSuffix: true })}
                </span>
            )
        }
    ];

    const renderPartCard = (part: any) => (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg">{part.name}</div>
                    <Badge variant={part.status === "installed" ? "default" : "secondary"}>
                        {part.status}
                    </Badge>
                </div>
                <div className="text-sm text-muted-foreground mb-4">
                    {part.manufacturer}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <span className="block text-xs uppercase text-muted-foreground">Price</span>
                        ${part.price || 0}
                    </div>
                    <div>
                        <span className="block text-xs uppercase text-muted-foreground">Added</span>
                        {formatDistanceToNow(part.creationTime, { addSuffix: true })}
                    </div>
                </div>
            </CardContent>
        </Card>
    );


    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link to="/admin/users">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">User Details</h1>
            </div>

            {/* User Header */}
            <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                            <AvatarImage src={user.pictureUrl} />
                            <AvatarFallback className="text-2xl">{user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-3">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                {user.role === "admin" && (
                                    <Badge variant="default" className="bg-primary/10 text-primary border-0">
                                        <Shield className="w-3 h-3 mr-1" /> Admin
                                    </Badge>
                                )}
                                <Badge variant="outline" className="capitalize">
                                    {user.subscriptionStatus || "free"}
                                </Badge>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    {user.email}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    Joined {user.createdAt ? new Date(Number(user.createdAt)).toLocaleDateString() : "N/A"}
                                </div>
                                {user.stats?.lastLogin && (
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        Last login {formatDistanceToNow(user.stats.lastLogin, { addSuffix: true })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <Button variant="outline" asChild>
                                <a href={`mailto:${user.email}`}>Contact User</a>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Cars</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Car className="h-5 w-5 text-primary" />
                            {user.stats?.totalCars || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Parts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Wrench className="h-5 w-5 text-primary" />
                            {user.stats?.totalParts || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Profile Views</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-green-500" />
                            {user.stats?.profileViews || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Product Clicks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            {user.stats?.productClicks || 0}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="activity" className="w-full">
                <TabsList className="bg-muted/50 p-1">
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    <TabsTrigger value="cars">Cars</TabsTrigger>
                    <TabsTrigger value="parts">Parts</TabsTrigger>
                </TabsList>

                <TabsContent value="activity" className="space-y-4 mt-6">
                    <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                        <CardHeader>
                            <CardTitle>Activity History</CardTitle>
                            <CardDescription>Recent actions performed by this user</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-6">
                                    {user.recentActivity?.map((activity: any) => (
                                        <div key={activity._id} className="flex gap-4 relative pb-6 last:pb-0 border-l ml-2 pl-6 last:border-0 border-muted">
                                            <div className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium leading-none">
                                                    {activity.type === 'user_login' && 'Logged in'}
                                                    {activity.type === 'profile_view' && 'Viewed their profile'}
                                                    {activity.type === 'car_view' && 'Viewed a car'}
                                                    {activity.type === 'part_view' && 'Viewed a part'}
                                                    {activity.type === 'user_created' && 'Account created'}
                                                    {!['user_login', 'profile_view', 'car_view', 'part_view', 'user_created'].includes(activity.type) && activity.type}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(activity.createdAt, { addSuffix: true })}
                                                </p>
                                                {activity.metadata && (
                                                    <pre className="text-xs bg-muted p-2 rounded mt-2 overflow-x-auto text-muted-foreground">
                                                        {JSON.stringify(activity.metadata, null, 2)}
                                                    </pre>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {(!user.recentActivity || user.recentActivity.length === 0) && (
                                        <div className="text-center text-muted-foreground py-8">
                                            No recent activity found
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="cars" className="mt-6">
                    <ResponsiveTable
                        data={user.cars || []}
                        columns={carColumns}
                        keyExtractor={(car) => car._id}
                        renderMobileCard={renderCarCard}
                        emptyMessage="No cars found for this user."
                    />
                </TabsContent>

                <TabsContent value="parts" className="mt-6">
                    <ResponsiveTable
                        data={user.parts || []}
                        columns={partColumns}
                        keyExtractor={(part) => part._id}
                        renderMobileCard={renderPartCard}
                        emptyMessage="No parts found for this user."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default AdminUserDetails;
