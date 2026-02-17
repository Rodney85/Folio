import { TrendingUp } from "lucide-react";
import ResponsiveLayout from "../components/layout/ResponsiveLayout";
import ComingSoon from "../components/ui/coming-soon";

const AnalyticsPageContent = () => {
  return (
    <>
      {/* Top space for mobile - white background */}
      <div className="h-14 bg-white w-full"></div>

      {/* Main content */}
      <div className="flex flex-col p-4 md:p-6 lg:p-8 max-w-3xl md:max-w-4xl lg:max-w-6xl mx-auto w-full">
        <ComingSoon
          title="Analytics Dashboard"
          description="We're building an advanced analytics dashboard to help you track your car profile views, product clicks, and audience insights. Stay tuned!"
          icon={<TrendingUp className="h-12 w-12 text-blue-500" />}
        />
      </div>
    </>
  );
};

// Wrap the analytics content in the ResponsiveLayout for navigation
const AnalyticsPage = () => {
  return (
    <ResponsiveLayout>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <AnalyticsPageContent />
      </div>
    </ResponsiveLayout>
  );
};

export default AnalyticsPage;
