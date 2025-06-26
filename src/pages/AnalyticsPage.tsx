import { useState } from "react";
import MobileLayout from "@/components/layout/MobileLayout";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, Calendar, Fuel } from "lucide-react";

const AnalyticsPage = () => {
  // Mock data for analytics
  const [statistics] = useState({
    totalCars: 9,
    totalMileage: 127580,
    averageMpg: 24.7,
    servicesDue: 2,
    monthlyExpenses: 342,
    monthlyFuel: 210,
    monthlyMaintenance: 132
  });

  // Mock usage data for chart display
  const [usageData] = useState([
    { month: "Jan", mileage: 820 },
    { month: "Feb", mileage: 932 },
    { month: "Mar", mileage: 901 },
    { month: "Apr", mileage: 934 },
    { month: "May", mileage: 1290 },
    { month: "Jun", mileage: 1330 },
  ]);

  return (
    <MobileLayout>
      <div className="p-4 pb-20">
        <h1 className="text-2xl font-bold mb-4">Car Analytics</h1>
        <p className="text-muted-foreground mb-6">
          Track and analyze your car collection performance
        </p>

        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-2 gap-4 my-4">
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2 text-primary" />
                    Total Cars
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">{statistics.totalCars}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-primary" />
                    Total Mileage
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">{statistics.totalMileage.toLocaleString()} mi</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Fuel className="h-4 w-4 mr-2 text-primary" />
                    Avg. MPG
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">{statistics.averageMpg}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-primary" />
                    Services Due
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <p className="text-2xl font-bold">{statistics.servicesDue}</p>
                </CardContent>
              </Card>
            </div>

            <Card className="my-4">
              <CardHeader>
                <CardTitle>Monthly Expenses</CardTitle>
                <CardDescription>Your car expenses for the past month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Fuel</span>
                    <span className="font-medium">${statistics.monthlyFuel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Maintenance</span>
                    <span className="font-medium">${statistics.monthlyMaintenance}</span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="font-medium">Total</span>
                    <span className="font-bold">${statistics.monthlyExpenses}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="usage">
            <Card className="my-4">
              <CardHeader>
                <CardTitle>Monthly Usage</CardTitle>
                <CardDescription>Mileage tracked per month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full flex items-end justify-between space-x-2">
                  {usageData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div 
                        className="bg-primary rounded-t w-8" 
                        style={{ height: `${(item.mileage / 1500) * 150}px` }}
                      ></div>
                      <span className="text-xs mt-2">{item.month}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="expenses">
            <Card className="my-4">
              <CardHeader>
                <CardTitle>Expense Breakdown</CardTitle>
                <CardDescription>Your spending by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Fuel</span>
                      <span className="text-sm font-medium">62%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "62%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Maintenance</span>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "28%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Insurance</span>
                      <span className="text-sm font-medium">10%</span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                      <div className="bg-primary h-full" style={{ width: "10%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
};

export default AnalyticsPage;
