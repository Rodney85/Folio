import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Bug, Lightbulb, User, FileText, HelpCircle,
    Clock, CheckCircle, XCircle, AlertTriangle,
    ChevronRight, Search, Filter, RefreshCw,
    MessageSquare, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Id } from "../../../convex/_generated/dataModel";

// Helper to get issue type icon
const getTypeIcon = (type: string) => {
    switch (type) {
        case "bug": return <Bug className="h-4 w-4" />;
        case "feature": return <Lightbulb className="h-4 w-4" />;
        case "account": return <User className="h-4 w-4" />;
        case "content": return <FileText className="h-4 w-4" />;
        default: return <HelpCircle className="h-4 w-4" />;
    }
};

// Helper to get status styling
const getStatusBadge = (status: string) => {
    switch (status) {
        case "open":
            return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Open</Badge>;
        case "in_progress":
            return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">In Progress</Badge>;
        case "resolved":
            return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Resolved</Badge>;
        case "closed":
            return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Closed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

// Helper to get priority styling
const getPriorityBadge = (priority: string) => {
    switch (priority) {
        case "critical":
            return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>;
        case "high":
            return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">High</Badge>;
        case "medium":
            return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Medium</Badge>;
        case "low":
            return <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">Low</Badge>;
        default:
            return <Badge variant="outline">{priority}</Badge>;
    }
};

// Format relative time
const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return "Just now";
};

const AdminIssuesPage = () => {
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIssue, setSelectedIssue] = useState<Id<"issues"> | null>(null);
    const [adminNotes, setAdminNotes] = useState("");
    const [resolution, setResolution] = useState("");

    // @ts-ignore - Convex deep type instantiation
    const stats = useQuery(api.adminIssues.getIssueStats);
    // @ts-ignore - Convex deep type instantiation
    const issues = useQuery(api.adminIssues.getAllIssues, {
        status: statusFilter !== "all" ? statusFilter : undefined,
    });
    // @ts-ignore - Convex deep type instantiation
    const issueDetails = useQuery(
        api.adminIssues.getIssueDetails,
        selectedIssue ? { issueId: selectedIssue } : "skip"
    );

    // @ts-ignore - Convex deep type instantiation
    const updateStatus = useMutation(api.adminIssues.updateIssueStatus);
    // @ts-ignore - Convex deep type instantiation
    const addNotes = useMutation(api.adminIssues.addAdminNotes);
    // @ts-ignore - Convex deep type instantiation
    const resolveIssue = useMutation(api.adminIssues.resolveIssue);
    // @ts-ignore - Convex deep type instantiation
    const deleteIssue = useMutation(api.adminIssues.deleteIssue);

    // Filter issues by search
    const filteredIssues = issues?.filter((issue) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            issue.title.toLowerCase().includes(query) ||
            issue.userName.toLowerCase().includes(query) ||
            issue.userEmail.toLowerCase().includes(query)
        );
    });

    const handleStatusChange = async (issueId: Id<"issues">, status: string) => {
        try {
            await updateStatus({ issueId, status });
            toast.success(`Status updated to ${status}`);
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const handleSaveNotes = async () => {
        if (!selectedIssue) return;
        try {
            await addNotes({ issueId: selectedIssue, notes: adminNotes });
            toast.success("Notes saved");
        } catch (error) {
            toast.error("Failed to save notes");
        }
    };

    const handleResolve = async () => {
        if (!selectedIssue || !resolution.trim()) {
            toast.error("Please enter a resolution summary");
            return;
        }
        try {
            await resolveIssue({ issueId: selectedIssue, resolution });
            toast.success("Issue resolved");
            setSelectedIssue(null);
            setResolution("");
        } catch (error) {
            toast.error("Failed to resolve issue");
        }
    };

    const handleDelete = async (issueId: Id<"issues">) => {
        if (!confirm("Are you sure you want to delete this issue?")) return;
        try {
            await deleteIssue({ issueId });
            toast.success("Issue deleted");
            setSelectedIssue(null);
        } catch (error) {
            toast.error("Failed to delete issue");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Issues</h1>
                    <p className="text-muted-foreground">Manage user-reported issues and feature requests</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-400" />
                            <span className="text-2xl font-bold">{stats?.open || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-yellow-400" />
                            <span className="text-2xl font-bold">{stats?.inProgress || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-400" />
                            <span className="text-2xl font-bold">{stats?.resolved || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            <span className="text-2xl font-bold">{stats?.critical || 0}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search issues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 bg-card border-border"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px] bg-card border-border">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Issues List */}
            <Card className="bg-card border-border">
                <CardContent className="p-0">
                    {!filteredIssues?.length ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            <p>No issues found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border">
                            {filteredIssues.map((issue) => (
                                <div
                                    key={issue._id}
                                    className="p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => {
                                        setSelectedIssue(issue._id);
                                        setAdminNotes(issue.adminNotes || "");
                                        setResolution(issue.resolution || "");
                                    }}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3 min-w-0">
                                            <div className="p-2 rounded-lg bg-muted">
                                                {getTypeIcon(issue.type)}
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-medium truncate">{issue.title}</h3>
                                                <p className="text-sm text-muted-foreground truncate">
                                                    {issue.userName} • {formatRelativeTime(issue.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {getPriorityBadge(issue.priority)}
                                            {getStatusBadge(issue.status)}
                                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Issue Details Dialog */}
            <Dialog open={!!selectedIssue} onOpenChange={(open) => !open && setSelectedIssue(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {issueDetails && getTypeIcon(issueDetails.type)}
                            {issueDetails?.title}
                        </DialogTitle>
                        <DialogDescription>
                            Submitted by {issueDetails?.userName} ({issueDetails?.userEmail})
                        </DialogDescription>
                    </DialogHeader>

                    {issueDetails && (
                        <div className="space-y-6">
                            {/* Status and Priority */}
                            <div className="flex gap-4">
                                <div className="space-y-2 flex-1">
                                    <Label>Status</Label>
                                    <Select
                                        value={issueDetails.status}
                                        onValueChange={(value) => handleStatusChange(issueDetails._id, value)}
                                    >
                                        <SelectTrigger className="bg-card">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="open">Open</SelectItem>
                                            <SelectItem value="in_progress">In Progress</SelectItem>
                                            <SelectItem value="resolved">Resolved</SelectItem>
                                            <SelectItem value="closed">Closed</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label>Priority</Label>
                                    <div className="pt-2">{getPriorityBadge(issueDetails.priority)}</div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <div className="p-4 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                                    {issueDetails.description}
                                </div>
                            </div>

                            {/* Context Info */}
                            {(issueDetails.pageUrl || issueDetails.deviceInfo) && (
                                <div className="space-y-2">
                                    <Label>Context</Label>
                                    <div className="p-4 bg-muted rounded-lg text-sm space-y-2">
                                        {issueDetails.pageUrl && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Page:</span>
                                                <span className="truncate">{issueDetails.pageUrl}</span>
                                            </div>
                                        )}
                                        {issueDetails.deviceInfo && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground">Device:</span>
                                                <span className="truncate">{issueDetails.deviceInfo}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <Label>Admin Notes (internal)</Label>
                                <Textarea
                                    value={adminNotes}
                                    onChange={(e) => setAdminNotes(e.target.value)}
                                    placeholder="Add internal notes..."
                                    rows={3}
                                    className="bg-card"
                                />
                                <Button variant="outline" size="sm" onClick={handleSaveNotes}>
                                    Save Notes
                                </Button>
                            </div>

                            {/* Resolution */}
                            {issueDetails.status !== "resolved" && issueDetails.status !== "closed" && (
                                <div className="space-y-2 border-t pt-4">
                                    <Label>Resolution</Label>
                                    <Textarea
                                        value={resolution}
                                        onChange={(e) => setResolution(e.target.value)}
                                        placeholder="Enter resolution summary..."
                                        rows={3}
                                        className="bg-card"
                                    />
                                    <Button onClick={handleResolve} className="bg-green-600 hover:bg-green-700">
                                        <CheckCircle className="h-4 w-4 mr-2" />
                                        Mark as Resolved
                                    </Button>
                                </div>
                            )}

                            {/* Existing Resolution */}
                            {issueDetails.resolution && (
                                <div className="space-y-2">
                                    <Label>Resolution</Label>
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm">
                                        {issueDetails.resolution}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-end gap-2 border-t pt-4">
                                <Button
                                    variant="destructive"
                                    onClick={() => handleDelete(issueDetails._id)}
                                >
                                    Delete Issue
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminIssuesPage;
