import { ChevronLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ResponsiveLayout from "../components/layout/ResponsiveLayout";
import ComingSoon from "../components/ui/coming-soon";

const ProAnalyticsPageContent = () => {
  const navigate = useNavigate();

  return (
    <>
      {/* Top bar */}
      <div className="flex justify-between items-center p-4 border-b border-slate-700 bg-slate-800">
        <button onClick={() => navigate("/analytics")} className="flex items-center text-slate-200 hover:text-white">
          <ChevronLeft className="h-5 w-5 mr-1" />
          <span>Back to Analytics</span>
        </button>
        
        <h1 className="text-xl font-semibold text-white">Pro Analytics</h1>
        
        <div className="w-10"></div>
      </div>

      {/* Main content */}
      <div className="flex flex-col p-4 max-w-5xl mx-auto w-full">
        <ComingSoon
          title="Pro Analytics Dashboard"
          description="Advanced analytics with detailed insights, audience demographics, geographic data, and real-time metrics are coming soon. Get ready for powerful data visualization!"
          icon={<BarChart3 className="h-12 w-12 text-blue-500" />}
        />
      </div>
    </>
  );
};

// Wrap the analytics content in ResponsiveLayout for navigation
const ProAnalyticsPage = () => {
  return (
    <ResponsiveLayout>
      <div className="flex flex-col min-h-screen bg-slate-900 text-slate-50">
        <ProAnalyticsPageContent />
      </div>
    </ResponsiveLayout>
  );
};

export default ProAnalyticsPage;
