import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { X, User, FileText, Instagram, Youtube, Camera } from "lucide-react";
import { Card } from "@/components/ui/card";

export const ProfileSetupBanner = () => {
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);

  // Get profile completion status
  // @ts-ignore - Suppressing TypeScript error for deep instantiation
  const completionStatus = useQuery(api.users.getProfileCompletionStatus);

  // Don't show if dismissed, loading, or profile is complete
  if (dismissed || !completionStatus || completionStatus.isComplete) {
    return null;
  }

  const { percentage, missingFields } = completionStatus;

  // Map missing fields to friendly names and icons
  const fieldInfo: Record<string, { label: string; icon: JSX.Element }> = {
    username: { label: "Username", icon: <User className="h-4 w-4" /> },
    bio: { label: "Bio", icon: <FileText className="h-4 w-4" /> },
    instagram: { label: "Instagram", icon: <Instagram className="h-4 w-4" /> },
    tiktok: {
      label: "TikTok",
      icon: (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      )
    },
    youtube: { label: "YouTube", icon: <Youtube className="h-4 w-4" /> },
    profile_photo: { label: "Profile Photo", icon: <Camera className="h-4 w-4" /> },
  };

  return (
    <Card className="relative bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 p-4 mb-4">
      {/* Dismiss button */}
      <button
        onClick={() => setDismissed(true)}
        className="absolute top-2 right-2 p-1 hover:bg-background/50 rounded-full transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between pr-6">
          <div>
            <h3 className="font-semibold text-sm">Complete Your Profile</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {percentage}% complete
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => navigate('/profile/edit')}
            className="h-8"
          >
            Continue Setup
          </Button>
        </div>

        {/* Progress bar */}
        <Progress value={percentage} className="h-2" />

        {/* Missing fields */}
        {missingFields.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {missingFields.map((field) => {
              const info = fieldInfo[field];
              if (!info) return null;

              return (
                <div
                  key={field}
                  className="flex items-center gap-1.5 text-xs bg-background/50 px-2 py-1 rounded-md"
                >
                  {info.icon}
                  <span>{info.label}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProfileSetupBanner;
