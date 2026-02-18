import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Badge } from "@/components/ui/badge";
import {
    Mail,
    CheckCircle2,
    XCircle,
    Info,
    Calendar,
    FileText
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { ResponsiveTable, Column } from "@/components/ui/ResponsiveTable";
import { Card, CardContent } from "@/components/ui/card";

const AdminMessagesPage = () => {
    const messages = useQuery(api.admin.getSentEmails);

    // Columns Configuration
    const columns: Column<any>[] = [
        {
            header: "Status",
            cell: (message) => (
                message.status === "sent" ? (
                    <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-0">
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Sent
                    </Badge>
                ) : (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="destructive" className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-0">
                                    <XCircle className="w-3 h-3 mr-1" /> Failed
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{message.error || "Unknown error"}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )
            )
        },
        {
            header: "Recipient",
            cell: (message) => (
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{message.to}</span>
                </div>
            )
        },
        {
            header: "Subject",
            accessorKey: "subject",
            className: "max-w-[300px] truncate"
        },
        {
            header: "Template",
            cell: (message) => (
                <Badge variant="outline" className="font-mono text-xs">
                    {message.template}
                </Badge>
            )
        },
        {
            header: "Sent",
            cell: (message) => (
                <span className="text-muted-foreground text-sm">
                    {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                </span>
            )
        },
        {
            header: "Message ID",
            className: "text-right font-mono text-xs text-muted-foreground hidden md:table-cell",
            accessorKey: "messageId"
        }
    ];

    // Mobile Card Renderer
    const renderMessageCard = (message: any) => (
        <Card className="mb-4">
            <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-2">
                    <div className="font-bold text-lg truncate pr-2">{message.subject}</div>
                    {message.status === "sent" ? (
                        <Badge variant="default" className="bg-green-500/10 text-green-500 border-0 shrink-0">
                            Sent
                        </Badge>
                    ) : (
                        <Badge variant="destructive" className="bg-red-500/10 text-red-500 border-0 shrink-0">
                            Failed
                        </Badge>
                    )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Mail className="h-4 w-4" />
                    {message.to}
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        <span className="font-mono text-xs">{message.template}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs">
                            {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                        </span>
                    </div>
                </div>
                {message.error && (
                    <div className="mt-4 p-2 bg-red-500/10 text-red-500 text-xs rounded">
                        Error: {message.error}
                    </div>
                )}
            </CardContent>
        </Card>
    );

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <h1 className="text-3xl font-bold tracking-tight">System Messages</h1>
                <div className="flex items-center gap-2">
                    {/* Add export or other actions here if needed */}
                </div>
            </div>

            <div className="bg-card/50 backdrop-blur-sm rounded-md border border-muted/50">
                <ResponsiveTable
                    data={messages || []}
                    columns={columns}
                    keyExtractor={(message) => message._id}
                    renderMobileCard={renderMessageCard}
                    emptyMessage={messages ? "No messages log found." : "Loading..."}
                />
            </div>
        </div>
    );
};

export default AdminMessagesPage;
