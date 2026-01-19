import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Users,
    Car,
    Wrench,
    Activity,
    TrendingUp,
    UserPlus,
    ArrowUpRight,
    Clock,
    DollarSign,
    UserMinus,
    MousePointer
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
    Legend,
    LineChart,
    Line
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminDashboard = () => {
    const quickStats = useQuery(api.adminDashboard.getQuickStats);
    const userGrowth = useQuery(api.adminDashboard.getUserGrowthData);
    const recentActivity = useQuery(api.adminDashboard.getRecentActivities, { limit: 10 });
    const newContent = useQuery(api.adminDashboard.getNewContentCount);

    // New Analytics Queries
    const financialMetrics = useQuery(api.adminDashboard.getFinancialMetrics);
    const churnMetrics = useQuery(api.adminDashboard.getChurnMetrics);
    const usageMetrics = useQuery(api.adminDashboard.getUsageMetrics);

    if (!quickStats || !userGrowth || !recentActivity || !newContent || !financialMetrics || !churnMetrics || !usageMetrics) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                    <Card key={i} className="animate-pulse">
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
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">Last updated: {new Date().toLocaleTimeString()}</span>
                </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quickStats.totalUsers.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                {quickStats.activeUsers}
                            </span>
                            active in last 7 days
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Cars</CardTitle>
                        <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{quickStats.totalCars.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <span className="text-green-500 flex items-center mr-1">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                +{newContent.cars}
                            </span>
                            new this week
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MRR</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${financialMetrics.currentMRR.toFixed(2)}</div>
                        <p className="text-xs text-muted-foreground flex items-center mt-1">
                            ARR: ${financialMetrics.currentARR.toFixed(2)}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                        <UserMinus className="h-4 w-4 text-muted-foreground" />
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
                <Card className="col-span-4">
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
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
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
                                            backgroundColor: "hsl(var(--card))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))" }}
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
                <Card className="col-span-3">
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
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="hsl(var(--border))" />
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
                                            backgroundColor: "hsl(var(--card))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))" }}
                                    />
                                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} barSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* User Growth Chart */}
                <Card className="col-span-4">
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
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
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
                                            backgroundColor: "hsl(var(--card))",
                                            borderColor: "hsl(var(--border))",
                                            borderRadius: "var(--radius)",
                                        }}
                                        labelStyle={{ color: "hsl(var(--foreground))" }}
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

                {/* Recent Activity Feed */}
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Latest actions across the platform
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-6">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4">
                                        <Avatar className="h-9 w-9 mt-0.5">
                                            <AvatarImage src={`https://avatar.vercel.sh/${activity.user.email || 'user'}`} />
                                            <AvatarFallback>{activity.user.name?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium leading-none">
                                                <span className="font-semibold">{activity.user.name}</span>
                                                <span className="text-muted-foreground font-normal">
                                                    {activity.type === 'user_login' && ' logged in'}
                                                    {activity.type === 'profile_view' && ' viewed a profile'}
                                                    {activity.type === 'car_view' && ` viewed ${activity.item.title}`}
                                                    {activity.type === 'part_view' && ` viewed ${activity.item.title}`}
                                                    {activity.type === 'user_created' && ' joined the platform'}
                                                </span>
                                            </p>
                                            <div className="flex items-center text-xs text-muted-foreground">
                                                <Clock className="mr-1 h-3 w-3" />
                                                {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
