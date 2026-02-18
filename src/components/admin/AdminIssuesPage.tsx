import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    Bug, Lightbulb, User, FileText, HelpCircle,
    Clock, CheckCircle, XCircle, AlertTriangle,
    ChevronRight, Search, Filter, RefreshCw,
    MessageSquare
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
            return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Open</Badge>;
        case "in_progress":
            return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 hover:bg-yellow-500/20">In Progress</Badge>;
        case "resolved":
            return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20">Resolved</Badge>;
        case "closed":
            return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-gray-500/20">Closed</Badge>;
        default:
            return <Badge variant="outline">{status}</Badge>;
    }
};

// Helper to get priority styling
const getPriorityBadge = (priority: string) => {
    switch (priority) {
        case "critical":
            return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20">Critical</Badge>;
        case "high":
            return <Badge variant="outline" className="bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20">High</Badge>;
        case "medium":
            return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20">Medium</Badge>;
        case "low":
            return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20 hover:bg-slate-500/20">Low</Badge>;
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
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Issue Tracker</h1>
                    <p className="text-muted-foreground mt-1">Manage user-reported issues and feature requests</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-blue-500" />
                            <span className="text-2xl font-bold">{stats?.open || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">In Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <RefreshCw className="h-5 w-5 text-yellow-500" />
                            <span className="text-2xl font-bold">{stats?.inProgress || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Resolved</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <span className="text-2xl font-bold">{stats?.resolved || 0}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-red-500" />
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
                        className="pl-10 bg-background/50 backdrop-blur-sm"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px] bg-background/50 backdrop-blur-sm">
                        <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
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
            <Card className="bg-card/50 backdrop-blur-sm border-muted/50 overflow-hidden">
                <CardContent className="p-0">
                    {!filteredIssues?.length ? (
                        <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                            <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                            <p className="text-lg font-medium">No issues found</p>
                            <p className="text-sm">Try adjusting your filters or search.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-border/50">
                            {filteredIssues.map((issue) => (
                                <div
                                    key={issue._id}
                                    className="p-4 hover:bg-muted/30 cursor-pointer transition-all duration-200 group"
                                    onClick={() => {
                                        setSelectedIssue(issue._id);
                                        setAdminNotes(issue.adminNotes || "");
                                        setResolution(issue.resolution || "");
                                    }}
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="flex items-start gap-4 min-w-0">
                                            <div className={cn(
                                                "p-2.5 rounded-full shrink-0",
                                                issue.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                    issue.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                        'bg-primary/10 text-primary'
                                            )}>
                                                {getTypeIcon(issue.type)}
                                            </div>
                                            <div className="min-w-0 space-y-1">
                                                <h3 className="font-semibold text-base truncate pr-4 group-hover:text-primary transition-colors">
                                                    {issue.title}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                                                    <span>{issue.userName}</span>
                                                    <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                                                    <span>{formatRelativeTime(issue.createdAt)}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 self-start sm:self-center ml-14 sm:ml-0">
                                            {getPriorityBadge(issue.priority)}
                                            {getStatusBadge(issue.status)}
                                            <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors ml-2" />
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
                        <DialogTitle className="flex items-center gap-2 text-xl">
                            {issueDetails && (
                                <div className="p-2 rounded-md bg-muted">
                                    {getTypeIcon(issueDetails.type)}
                                </div>
                            )}
                            {issueDetails?.title}
                        </DialogTitle>
                        <DialogDescription className="pt-1">
                            Submitted by <span className="font-medium text-foreground">{issueDetails?.userName}</span> ({issueDetails?.userEmail})
                        </DialogDescription>
                    </DialogHeader>

                    {issueDetails && (
                        <div className="space-y-6 mt-4">
                            {/* Status and Priority */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                                    <Select
                                        value={issueDetails.status}
                                        onValueChange={(value) => handleStatusChange(issueDetails._id, value)}
                                    >
                                        <SelectTrigger>
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
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Priority</Label>
                                    <div className="flex items-center h-10">
                                        {getPriorityBadge(issueDetails.priority)}
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Description</Label>
                                <div className="p-4 bg-muted/50 rounded-lg text-sm whitespace-pre-wrap border leading-relaxed">
                                    {issueDetails.description}
                                </div>
                            </div>

                            {/* Context Info */}
                            {(issueDetails.pageUrl || issueDetails.deviceInfo) && (
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Context</Label>
                                    <div className="p-4 bg-muted/30 rounded-lg text-sm space-y-2 border">
                                        {issueDetails.pageUrl && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground w-16 shrink-0">Page:</span>
                                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs truncate">{issueDetails.pageUrl}</code>
                                            </div>
                                        )}
                                        {issueDetails.deviceInfo && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-muted-foreground w-16 shrink-0">Device:</span>
                                                <span className="truncate">{issueDetails.deviceInfo}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Admin Notes */}
                            <div className="space-y-2">
                                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Internal Notes</Label>
                                <div className="space-y-2">
                                    <Textarea
                                        value={adminNotes}
                                        onChange={(e) => setAdminNotes(e.target.value)}
                                        placeholder="Add notes visible only to admins..."
                                        rows={3}
                                        className="bg-background/50"
                                    />
                                    <div className="flex justify-end">
                                        <Button variant="outline" size="sm" onClick={handleSaveNotes}>
                                            Save Notes
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Resolution */}
                            {issueDetails.status !== "resolved" && issueDetails.status !== "closed" && (
                                <div className="space-y-2 border-t pt-6">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Resolution</Label>
                                    <div className="space-y-2">
                                        <Textarea
                                            value={resolution}
                                            onChange={(e) => setResolution(e.target.value)}
                                            placeholder="Describe how this issue was resolved..."
                                            rows={3}
                                        />
                                        <Button onClick={handleResolve} className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Mark as Resolved
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Existing Resolution */}
                            {issueDetails.resolution && (
                                <div className="space-y-2 border-t pt-4">
                                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Resolution</Label>
                                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-sm flex gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                                        <div>
                                            {issueDetails.resolution}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex justify-between items-center border-t pt-6 mt-6">
                                <span className="text-xs text-muted-foreground">Issue ID: {issueDetails._id}</span>
                                <Button
                                    variant="ghost"
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleDelete(issueDetails._id)}
                                >
                                    Delete Issue
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div >
    );
};

export default AdminIssuesPage;
