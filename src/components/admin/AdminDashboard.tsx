import { useQuery } from "convex/react";
import { Link } from "react-router-dom";
import { api } from "../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Users,
    Car,
    Activity,
    TrendingUp,
    ArrowUpRight,
    Clock,
    DollarSign,
    UserMinus,
    AlertCircle,
    ArrowRight
} from "lucide-react";
import {
    Area,
    AreaChart,
    CartesianGrid,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    BarChart,
    Bar,
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";

const AdminDashboard = () => {
    const quickStats = useQuery(api.adminDashboard.getQuickStats);
    const userGrowth = useQuery(api.adminDashboard.getUserGrowthData);
    const recentIssues = useQuery(api.adminIssues.getAllIssues, {
        limit: 10,
        status: "open"
    });
    const newContent = useQuery(api.adminDashboard.getNewContentCount);
    const financialMetrics = useQuery(api.adminDashboard.getFinancialMetrics);
    const churnMetrics = useQuery(api.adminDashboard.getChurnMetrics);
    const usageMetrics = useQuery(api.adminDashboard.getUsageMetrics);

    if (!quickStats || !userGrowth || !recentIssues || !newContent || !financialMetrics || !churnMetrics || !usageMetrics) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 bg-muted rounded animate-pulse" />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i} className="animate-pulse bg-card/50 backdrop-blur-sm border-muted/50">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="h-4 w-24 bg-muted rounded"></div>
                                <div className="h-4 w-4 bg-muted rounded"></div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-8 w-16 bg-muted rounded mb-1"></div>
                                <div className="h-3 w-32 bg-muted rounded"></div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">System overview and key metrics</p>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                        Dashboard Updated: {new Date().toLocaleTimeString()}
                    </span>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quickStats.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1 bg-green-500/10 px-1 rounded">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {quickStats.activeUsers}
                            </span>
                            active in last 7 days
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Cars</CardTitle>
                        <Car className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quickStats.totalCars.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1 bg-green-500/10 px-1 rounded">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +{newContent.cars}
                            </span>
                            new this week
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">MRR</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${financialMetrics.currentMRR.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            ARR: ${financialMetrics.currentARR.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50 shadow-sm hover:shadow-md transition-all">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Churn Rate</CardTitle>
                        <UserMinus className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{churnMetrics.churnRate}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {churnMetrics.churnedUsers} churned users
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Financial Growth Chart */}
                <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-muted/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Revenue Growth</CardTitle>
                        <CardDescription>
                            Monthly Recurring Revenue (MRR) over the last 6 months
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={financialMetrics.history}>
                                    <defs>
                                        <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="month"
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `$${value}`}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--popover))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                                        formatter={(value) => [`$${value}`, "MRR"]}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="mrr"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#colorMrr)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Usage Heatmap (Top Features) */}
                <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-muted/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>Top Features</CardTitle>
                        <CardDescription>
                            Most used features by active users
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={usageMetrics} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="feature"
                                        type="category"
                                        width={100}
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--popover))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                                    />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={24} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* User Growth Chart */}
                <Card className="col-span-4 bg-card/50 backdrop-blur-sm border-muted/50 shadow-sm">
                    <CardHeader>
                        <CardTitle>User Growth</CardTitle>
                        <CardDescription>
                            New user registrations over the last 30 days
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={userGrowth}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                    <XAxis
                                        dataKey="date"
                                        tickFormatter={(value) => {
                                            const date = new Date(value);
                                            return `${date.getMonth() + 1}/${date.getDate()}`;
                                        }}
                                        stroke="hsl(var(--muted-foreground))"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: "hsl(var(--popover))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="hsl(var(--primary))"
                                        fillOpacity={1}
                                        fill="url(#colorCount)"
                                        strokeWidth={2}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Issues Feed */}
                <Card className="col-span-3 bg-card/50 backdrop-blur-sm border-muted/50 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Recent Open Issues</CardTitle>
                            <CardDescription>
                                Latest unopened reports & feedback
                            </CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
                            <Link to="/admin/issues" className="flex items-center gap-1">
                                View All <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-3">
                                {recentIssues.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                                        <Activity className="h-10 w-10 mb-2 opacity-20" />
                                        <p>No issues reported</p>
                                    </div>
                                ) : (
                                    recentIssues.map((issue) => (
                                        <div key={issue._id} className="group flex items-start gap-3 p-3 rounded-lg border bg-background/50 hover:bg-background/80 transition-all duration-200 cursor-pointer">
                                            <div className={`mt-0.5 p-1.5 rounded-full ${issue.priority === 'critical' ? 'bg-red-500/10 text-red-500' :
                                                issue.priority === 'high' ? 'bg-orange-500/10 text-orange-500' :
                                                    issue.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-500' :
                                                        'bg-blue-500/10 text-blue-500'
                                                }`}>
                                                <AlertCircle className="h-4 w-4" />
                                            </div>
                                            <div className="space-y-1 flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium leading-none truncate group-hover:text-primary transition-colors">{issue.title}</p>
                                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                                                        {formatDistanceToNow(issue.createdAt, { addSuffix: true })}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between mt-1">
                                                    <p className="text-xs text-muted-foreground">{issue.userName}</p>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full uppercase font-bold ${issue.status === 'open' ? 'bg-red-500/10 text-red-500' :
                                                        issue.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' :
                                                            issue.status === 'resolved' ? 'bg-green-500/10 text-green-500' :
                                                                'bg-gray-500/10 text-gray-500'
                                                        }`}>
                                                        {issue.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
};

export default AdminDashboard;
