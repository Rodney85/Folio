import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    MoreHorizontal,
    Search,
    Filter,
    ChevronLeft,
    ChevronRight,
    Shield,
    ShieldAlert,
    User
} from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { formatDistanceToNow } from "date-fns";

const AdminUsersPage = () => {
    const { toast } = useToast();

    // State for filters and search
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
    const [subscriptionFilter, setSubscriptionFilter] = useState<string | undefined>(undefined);
    const [activityFilter, setActivityFilter] = useState<string | undefined>(undefined);

    // Pagination state
    const [cursor, setCursor] = useState<string | null>(null);
    const [pageHistory, setPageHistory] = useState<string[]>([]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
            // Reset pagination on search change
            setCursor(null);
            setPageHistory([]);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    // Query users
    // Define args separately to avoid "excessively deep type instantiation" error
    const queryArgs = {
        limit: 20,
        cursor: cursor || undefined,
        searchQuery: debouncedSearch || undefined,
        roleFilter: roleFilter === "all" ? undefined : roleFilter,
        subscriptionFilter: subscriptionFilter === "all" ? undefined : subscriptionFilter,
        activityFilter: activityFilter === "all" ? undefined : activityFilter,
    };

    const usersData = useQuery(api.adminUsers.getFilteredUsers, queryArgs);

    const users = usersData?.users || [];
    const nextCursor = usersData?.nextCursor || null;

    // Mutations
    const updateUserRole = useMutation(api.adminUsers.updateUserRole);

    const handleNextPage = () => {
        if (nextCursor) {
            setPageHistory([...pageHistory, cursor || ""]);
            setCursor(nextCursor);
        }
    };

    const handlePrevPage = () => {
        if (pageHistory.length > 0) {
            const prevCursor = pageHistory[pageHistory.length - 1];
            setCursor(prevCursor === "" ? null : prevCursor);
            setPageHistory(pageHistory.slice(0, -1));
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await updateUserRole({ userId: userId as any, role: newRole });
            toast({
                title: "Role updated",
                description: `User role updated to ${newRole}`,
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update user role",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Users</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                        Export CSV
                    </Button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row gap-4 items-center bg-card p-4 rounded-lg border">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name or email..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto ml-auto">
                    <Select value={roleFilter} onValueChange={setRoleFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={subscriptionFilter} onValueChange={setSubscriptionFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Plan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Plans</SelectItem>
                            <SelectItem value="free">Free</SelectItem>
                            <SelectItem value="starter">Starter</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={activityFilter} onValueChange={setActivityFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Activity" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Any Activity</SelectItem>
                            <SelectItem value="active">Active (30d)</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>

                    {(roleFilter || subscriptionFilter || activityFilter || searchQuery) && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                                setRoleFilter(undefined);
                                setSubscriptionFilter(undefined);
                                setActivityFilter(undefined);
                                setSearchQuery("");
                                setCursor(null);
                            }}
                        >
                            <Filter className="h-4 w-4 text-muted-foreground" />
                        </Button>
                    )}
                </div>
            </div>

            {/* Users Table */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Cars</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {!usersData ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    Loading...
                                </TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No users found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            users.map((user) => (
                                <TableRow key={user._id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={user.pictureUrl} />
                                                <AvatarFallback>{user.name?.[0] || "U"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.name}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {user.role === "admin" ? (
                                            <Badge variant="default" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                                <Shield className="w-3 h-3 mr-1" /> Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="font-normal">
                                                <User className="w-3 h-3 mr-1" /> User
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">
                                            {user.subscriptionStatus || "free"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.carsCount}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {user.createdAt ? (
                                            typeof user.createdAt === 'number'
                                                ? new Date(user.createdAt).toLocaleDateString()
                                                : new Date(parseInt(user.createdAt)).toLocaleDateString()
                                        ) : "N/A"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem asChild>
                                                    <Link to={`/admin/users/${user._id}`}>View Details</Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuLabel>Change Role</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user._id, "user")}>
                                                    <User className="mr-2 h-4 w-4" /> Make User
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user._id, "admin")}>
                                                    <ShieldAlert className="mr-2 h-4 w-4" /> Make Admin
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={pageHistory.length === 0}
                >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={!nextCursor}
                >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            </div>
        </div>
    );
};

export default AdminUsersPage;
