import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import ProfileSetupForm from "./ProfileSetupForm";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ProfileOnboardingProps {
  onComplete?: () => void;
}

const ProfileOnboarding = ({ onComplete }: ProfileOnboardingProps) => {
  console.log("!!! PROFILE ONBOARDING MOUNTED !!!");
  const navigate = useNavigate();
  // @ts-ignore - Suppressing TypeScript errors for deep instantiation
  const isProfileComplete = useQuery(api.users.isProfileComplete);
  const updateProfile = useMutation(api.users.updateProfile);
  const [showDialog, setShowDialog] = useState<boolean>(false);

  // State to control dialog visibility
  // Initialize based on profile completion status
  useEffect(() => {
    if (isProfileComplete === false) {
      setShowDialog(true);
    } else if (isProfileComplete === true) {
      setShowDialog(false);
    }
  }, [isProfileComplete]);


  const handleProfileComplete = async () => {
    // Mark the profile as complete and close dialog
    await updateProfile({ profileCompleted: true });
    setShowDialog(false);
    if (onComplete) {
      onComplete();
    }
  };

  // If loading, don't show anything yet
  if (isProfileComplete === undefined) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={(open) => {
      // Prevent closing if profile is incomplete (force user to complete or use skip inside)
      if (!open && !isProfileComplete) {
        return;
      }
      setShowDialog(open);
    }}>
      <DialogContent className="sm:max-w-md" hideCloseButton={true}>
        <DialogHeader>
          <DialogTitle>Complete Your Profile</DialogTitle>
          <DialogDescription>
            Welcome to Carfolio! Let's set up your profile to get started.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ProfileSetupForm isOnboarding={true} onComplete={handleProfileComplete} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileOnboarding;
