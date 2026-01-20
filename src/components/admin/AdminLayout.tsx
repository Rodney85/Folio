import { useUser } from "@clerk/clerk-react";
import { Navigate, Outlet, Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    Car,
    Settings,
    LogOut,
    Menu,
    X,
    Flag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const AdminLayout = () => {
    const { user, isLoaded, isSignedIn } = useUser();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Wait for auth to load
    if (!isLoaded) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Check if user is signed in and has admin role
    const isAdmin = user?.publicMetadata?.role === "admin";

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
            title: "Settings",
            href: "/admin/settings",
            icon: Settings
        }
    ];

    return (
        <div className="h-screen bg-background flex overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {!isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(true)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-card border-r transition-transform duration-300 ease-in-out flex flex-col h-full",
                    !isSidebarOpen ? "-translate-x-full lg:translate-x-0" : "translate-x-0",
                    // On mobile it's fixed, on desktop it's static but within a flex container that is h-screen
                    // We need to ensure it doesn't scroll with the main content
                    "lg:flex-shrink-0"
                )}
            >
                <div className="h-16 flex items-center px-6 border-b flex-shrink-0">
                    <Link to="/" className="flex items-center gap-2 font-bold text-xl">
                        <span className="text-primary">Folio</span>Admin
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="ml-auto lg:hidden"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.href ||
                            (item.href !== "/admin" && location.pathname.startsWith(item.href));

                        return (
                            <Link
                                key={item.href}
                                to={item.href}
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

                <div className="p-4 border-t space-y-4 flex-shrink-0">
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
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full overflow-hidden">
                <header className="h-16 border-b flex items-center justify-between px-6 bg-background/80 backdrop-blur-sm sticky top-0 z-30 flex-shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>

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
