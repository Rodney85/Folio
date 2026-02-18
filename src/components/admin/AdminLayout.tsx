import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Car,
    Settings,
    LogOut,
    Menu,
    Flag,
    Handshake,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

const AdminLayout = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const location = useLocation();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    // Check if user is signed in and has admin role from Convex
    const convexUser = useQuery(api.users.getProfile);

    // Show loading state while fetching user profile
    if (!isLoaded || (isSignedIn && convexUser === undefined)) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isAdmin = convexUser?.role === "admin";

    if (!isSignedIn || !isAdmin) {
        return <Navigate to="/" replace />;
    }

    const navItems = [
        {
            title: "Dashboard",
            href: "/admin",
            icon: LayoutDashboard
        },
        {
            title: "Users",
            href: "/admin/users",
            icon: Users
        },
        {
            title: "Content",
            href: "/admin/content",
            icon: Car
        },
        {
            title: "Issues",
            href: "/admin/issues",
            icon: Flag
        },
        {
            title: "Messages",
            href: "/admin/messages",
            icon: Mail
        },
        {
            title: "Settings",
            href: "/admin/settings",
            icon: Settings
        }
    ];

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-background/50 backdrop-blur-xl">
            <div className="h-16 flex items-center px-6 border-b flex-shrink-0">
                <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                    <span className="text-primary">Folio</span>Admin
                </Link>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href ||
                        (item.href !== "/admin" && location.pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                            )}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.title}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 border-t space-y-4 flex-shrink-0 bg-background/50 backdrop-blur-xl">
                <div className="flex items-center gap-3 px-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                        <img
                            src={user.imageUrl}
                            alt={user.fullName || "Admin"}
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{user.fullName}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.primaryEmailAddress?.emailAddress}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" asChild>
                        <Link to="/">
                            <LogOut className="h-4 w-4 mr-2" />
                            Exit
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col w-64 border-r fixed inset-y-0 z-50 bg-background/80 backdrop-blur-md">
                <SidebarContent />
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden lg:pl-64 transition-all duration-300">
                <header className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-xxl sticky top-0 z-30 flex-shrink-0">
                    <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                        <SheetTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="lg:hidden"
                            >
                                <Menu className="h-5 w-5" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 border-r w-72">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Admin Navigation</SheetTitle>
                            </SheetHeader>
                            <SidebarContent />
                        </SheetContent>
                    </Sheet>

                    <div className="flex items-center gap-4 ml-auto">
                        {/* Add header actions here if needed */}
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
