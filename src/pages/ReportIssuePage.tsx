import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ChevronLeft, Send, Bug, Lightbulb, User, FileText, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ResponsiveLayout } from "@/components/layout/ResponsiveLayout";
import MobileLayout from "@/components/layout/MobileLayout";
import { useMediaQuery } from "@/hooks/useMediaQuery";

// Issue type options
const issueTypes = [
    { value: "bug", label: "Bug Report", icon: Bug, description: "Something isn't working" },
    { value: "feature", label: "Feature Request", icon: Lightbulb, description: "Suggest an improvement" },
    { value: "account", label: "Account Issue", icon: User, description: "Login, profile, settings" },
    { value: "content", label: "Content Issue", icon: FileText, description: "Cars, parts, images" },
    { value: "other", label: "Other", icon: HelpCircle, description: "General inquiry" },
];

// Priority options
const priorities = [
    { value: "low", label: "Low", color: "bg-slate-500" },
    { value: "medium", label: "Medium", color: "bg-blue-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
];

const ReportIssuePage = () => {
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width: 767px)");
    // @ts-ignore - Convex deep type instantiation
    const submitIssueMutation = useMutation(api.issues.submitIssue);

    const [formData, setFormData] = useState({
        type: "",
        title: "",
        description: "",
        priority: "medium",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Get device and page info
    const getDeviceInfo = () => {
        const ua = navigator.userAgent;
        const platform = navigator.platform;
        return `${platform} - ${ua.substring(0, 100)}`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.type) {
            toast.error("Please select an issue type");
            return;
        }
        if (!formData.title.trim()) {
            toast.error("Please enter a title");
            return;
        }
        if (!formData.description.trim()) {
            toast.error("Please describe the issue");
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await submitIssueMutation({
                type: formData.type,
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                pageUrl: window.location.href,
                deviceInfo: getDeviceInfo(),
            });

            if (result.success) {
                toast.success("Issue reported successfully! We'll look into it.");
                navigate(-1);
            }
        } catch (error) {
            console.error("Failed to submit issue:", error);
            toast.error("Failed to submit issue. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Form content - shared between layouts
    const formContent = (
        <div className="min-h-full bg-transparent text-white">
            {/* Header */}
            <div className={`sticky top-0 z-10 bg-[#020204]/95 backdrop-blur-2xl border-b border-white/5 ${!isMobile ? '' : ''}`}>
                <div className="flex items-center p-4 max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="mr-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <h1 className="text-lg font-semibold">Report an Issue</h1>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className={`max-w-2xl mx-auto p-4 space-y-6 ${isMobile ? 'pb-24' : 'pb-8'}`}>
                {/* Issue Type Selection */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium text-white">What type of issue is this?</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {issueTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = formData.type === type.value;
                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, type: type.value })}
                                    className={cn(
                                        "flex flex-col items-center p-4 rounded-xl border transition-all",
                                        isSelected
                                            ? "border-blue-500 bg-blue-500/10 text-blue-400"
                                            : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"
                                    )}
                                >
                                    <Icon className={cn("h-6 w-6 mb-2", isSelected ? "text-blue-400" : "text-slate-400")} />
                                    <span className="text-sm font-medium">{type.label}</span>
                                    <span className="text-xs text-slate-400 mt-1">{type.description}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Title */}
                <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium text-white">
                        Title <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="title"
                        placeholder="Brief summary of the issue"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={100}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500"
                    />
                    <p className="text-xs text-slate-500 text-right">
                        {formData.title.length}/100
                    </p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description" className="text-sm font-medium text-white">
                        Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                        id="description"
                        placeholder="Please describe the issue in detail. Include steps to reproduce if it's a bug."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        maxLength={2000}
                        rows={6}
                        className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 resize-none"
                    />
                    <p className="text-xs text-slate-500 text-right">
                        {formData.description.length}/2000
                    </p>
                </div>

                {/* Priority */}
                <div className="space-y-3">
                    <Label className="text-sm font-medium text-white">Priority (optional)</Label>
                    <div className="flex gap-3">
                        {priorities.map((p) => {
                            const isSelected = formData.priority === p.value;
                            return (
                                <button
                                    key={p.value}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, priority: p.value })}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                                        isSelected
                                            ? "border-blue-500 bg-blue-500/10"
                                            : "border-white/10 bg-white/5 hover:border-white/30"
                                    )}
                                >
                                    <span className={cn("w-2 h-2 rounded-full", p.color)} />
                                    <span className="text-sm">{p.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Info note */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <p className="text-sm text-blue-400">
                        <strong>Note:</strong> Your current page URL and device info will be automatically included to help us diagnose the issue.
                    </p>
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    disabled={isSubmitting || !formData.type || !formData.title || !formData.description}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    size="lg"
                >
                    {isSubmitting ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <Send className="h-4 w-4 mr-2" />
                            Submit Issue
                        </>
                    )}
                </Button>
            </form>
        </div>
    );

    // Use appropriate layout based on viewport
    return isMobile ? (
        <MobileLayout noPadding={true}>
            {formContent}
        </MobileLayout>
    ) : (
        <ResponsiveLayout noPadding={true}>
            {formContent}
        </ResponsiveLayout>
    );
};

export default ReportIssuePage;

