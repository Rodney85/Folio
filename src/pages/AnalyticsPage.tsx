import { TrendingUp, Lock, BarChart3, Users, MousePointerClick } from "lucide-react";
import ResponsiveLayout from "@/components/layout/ResponsiveLayout";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

const AnalyticsPageContent = () => {
  const navigate = useNavigate();
  // @ts-ignore - Convex type instantiation issue
  const premiumStatus = useQuery(api.freemium.isUserPremium);

  // Loading state
  if (premiumStatus === undefined) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  // Paywall for free users
  if (!premiumStatus.isPremium) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto mt-12 bg-slate-900/50 border border-slate-800 rounded-2xl backdrop-blur-sm shadow-xl">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Lock className="h-8 w-8 text-blue-400" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">Unlock Pro Analytics</h1>
        <p className="text-lg text-slate-300 mb-8 max-w-md">
          Gain deep insights into your build's performance. Track views, product clicks, and see who's checking out your ride.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-8">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="font-semibold text-white">Profile Views</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <MousePointerClick className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="font-semibold text-white">Link Clicks</div>
          </div>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <BarChart3 className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="font-semibold text-white">Growth Trends</div>
          </div>
        </div>

        <Button
          size="lg"
          onClick={() => navigate('/subscription')}
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold px-8 py-6 h-auto text-lg w-full md:w-auto shadow-lg shadow-blue-500/20"
        >
          Upgrade to Pro
        </Button>
      </div>
    );
  }

  // Premium content (Coming Soon)
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-2xl mx-auto mt-12">
      <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6 animate-pulse">
        <TrendingUp className="h-10 w-10 text-blue-400" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Analytics Dashboard</h1>
      <p className="text-lg text-slate-300 mb-8">
        We're building an advanced analytics dashboard exclusively for Pro members.
        You'll soon be able to track your car profile views, product clicks, and audience insights right here.
      </p>

      <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 rounded-full text-sm font-medium border border-blue-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        Coming Soon for Pro Members
      </div>
    </div>
  );
};

const AnalyticsPage = () => {
  return (
    <ResponsiveLayout>
      <div className="flex flex-col min-h-screen bg-[#020204] text-white">
        <AnalyticsPageContent />
      </div>
    </ResponsiveLayout>
  );
};

export default AnalyticsPage;
