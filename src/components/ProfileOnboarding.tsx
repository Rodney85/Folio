import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ProfileSetupForm from "./ProfileSetupForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProfileOnboardingProps {
  onComplete?: () => void;
}

const ProfileOnboarding = ({ onComplete }: ProfileOnboardingProps) => {
  const navigate = useNavigate();
  const isProfileComplete = useQuery(api.users.isProfileComplete);
  const [showDialog, setShowDialog] = useState(!isProfileComplete);

  const handleComplete = () => {
    setShowDialog(false);
    if (onComplete) {
      onComplete();
    }
  };

  const handleSkip = () => {
    setShowDialog(false);
    navigate("/profile");
  };

  // Only show the onboarding dialog if the profile is not complete
  if (isProfileComplete === undefined || isProfileComplete === true) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Welcome to Carfolio! Let's set up your profile to get started.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <ProfileSetupForm isOnboarding={true} onComplete={handleComplete} />
        </div>
        
        <div className="flex justify-end">
          <Button variant="ghost" onClick={handleSkip}>Skip for now</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileOnboarding;
