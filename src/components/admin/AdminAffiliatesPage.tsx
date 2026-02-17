import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Users,
    Clock,
    CheckCircle,
    XCircle,
    Mail,
    AtSign,
    MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import type { Id } from "../../../convex/_generated/dataModel";

const AdminAffiliatesPage = () => {
    // @ts-ignore – Convex type instantiation
    const applications = useQuery(api.affiliates.getAllApplications);
    // @ts-ignore – Convex type instantiation
    const stats = useQuery(api.affiliates.getApplicationStats);
    // @ts-ignore – Convex type instantiation
    const updateStatus = useMutation(api.affiliates.updateApplicationStatus);
    const { toast } = useToast();

    const handleStatusUpdate = async (id: Id<"affiliateApplications">, status: string) => {
        try {
            await updateStatus({ applicationId: id, status });
            toast({ title: "Updated", description: `Application ${status}.` });
        } catch {
            toast({ title: "Error", description: "Failed to update.", variant: "destructive" });
        }
    };

    if (!applications || !stats) {
        return (
            <div className="space-y-6">
                <h1 className="text-3xl font-bold">Affiliate Applications</h1>
                <div className="grid gap-4 md:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse">
                            <CardContent className="p-6">
                                <div className="h-8 w-16 bg-muted rounded" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Affiliate Applications</h1>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.total}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Approved</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{stats.approved}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-500">{stats.rejected}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Applications List */}
            <Card>
                <CardHeader>
                    <CardTitle>All Applications</CardTitle>
                    <CardDescription>Manage affiliate program applications</CardDescription>
                </CardHeader>
                <CardContent>
                    {applications.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                            No applications yet.
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {applications.map((app) => (
                                <div
                                    key={app._id}
                                    className="flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-lg border bg-card/50 hover:bg-card/80 transition-colors"
                                >
                                    <div className="flex-1 space-y-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium">{app.name}</p>
                                            <span
                                                className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold ${app.status === "pending"
                                                        ? "bg-yellow-500/10 text-yellow-500"
                                                        : app.status === "approved"
                                                            ? "bg-green-500/10 text-green-500"
                                                            : "bg-red-500/10 text-red-500"
                                                    }`}
                                            >
                                                {app.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {app.email}
                                            </span>
                                            {app.socialHandle && (
                                                <span className="flex items-center gap-1">
                                                    <AtSign className="h-3 w-3" />
                                                    {app.socialHandle}
                                                </span>
                                            )}
                                            {app.platform && <span>Platform: {app.platform}</span>}
                                            {app.audienceSize && <span>Audience: {app.audienceSize}</span>}
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {formatDistanceToNow(app.createdAt, { addSuffix: true })}
                                            </span>
                                        </div>
                                        {app.message && (
                                            <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1">
                                                <MessageSquare className="h-3 w-3 mt-0.5 flex-shrink-0" />
                                                <span className="line-clamp-2">{app.message}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="flex gap-2 flex-shrink-0">
                                        {app.status !== "approved" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-green-500 border-green-500/30 hover:bg-green-500/10"
                                                onClick={() => handleStatusUpdate(app._id, "approved")}
                                            >
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Approve
                                            </Button>
                                        )}
                                        {app.status !== "rejected" && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="text-red-500 border-red-500/30 hover:bg-red-500/10"
                                                onClick={() => handleStatusUpdate(app._id, "rejected")}
                                            >
                                                <XCircle className="h-3 w-3 mr-1" />
                                                Reject
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminAffiliatesPage;
