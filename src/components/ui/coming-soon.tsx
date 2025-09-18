import { Clock, TrendingUp } from "lucide-react";

interface ComingSoonProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
}

const ComingSoon = ({ 
  title = "Coming Soon", 
  description = "This feature is currently under development and will be available soon.",
  icon
}: ComingSoonProps) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <div className="bg-slate-800 rounded-full p-6 mb-6">
        {icon || <Clock className="h-12 w-12 text-blue-500" />}
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
        {title}
      </h2>
      
      <p className="text-slate-400 text-lg max-w-md mb-8 leading-relaxed">
        {description}
      </p>
      
      <div className="flex items-center space-x-2 text-blue-400">
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-75"></div>
        <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse delay-150"></div>
      </div>
    </div>
  );
};

export default ComingSoon;
