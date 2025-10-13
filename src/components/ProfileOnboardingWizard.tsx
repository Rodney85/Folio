import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@clerk/clerk-react";
import { Loader2, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProfileOnboardingWizardProps {
  onComplete?: () => void;
}

const ProfileOnboardingWizard = ({ onComplete }: ProfileOnboardingWizardProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateProfile);
  const isProfileComplete = useQuery(api.users.isProfileComplete);

  const [showDialog, setShowDialog] = useState(!isProfileComplete);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");

  // Hide dialog if profile is complete
  useEffect(() => {
    if (isProfileComplete) {
      setShowDialog(false);
    }
  }, [isProfileComplete]);

  const steps = [
    {
      title: "Welcome to Carfolio!",
      description: "Let's set up your profile in a few quick steps. You can skip any step and complete it later.",
      content: (
        <div className="text-center space-y-4 py-6">
          <div className="text-4xl">🚗</div>
          <p className="text-muted-foreground">
            Your cars. Your builds. One link to share it all.
          </p>
        </div>
      ),
      canSkip: true,
    },
    {
      title: "Choose Your Username",
      description: "This is how people will find you on Carfolio.",
      content: (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="username">
              Username
            </label>
            <div className="flex items-center">
              <span className="text-muted-foreground mr-1">@</span>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your-username"
                autoFocus
              />
            </div>
          </div>
        </div>
      ),
      canSkip: false, // Username is required
      validate: () => {
        if (!username.trim()) {
          toast.error("Please enter a username");
          return false;
        }
        return true;
      },
    },
    {
      title: "Add a Bio",
      description: "Tell people about yourself and your passion for cars.",
      content: (
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="bio">
              Bio
            </label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself and your builds..."
              rows={4}
            />
          </div>
        </div>
      ),
      canSkip: true,
    },
    {
      title: "Connect Social Media",
      description: "Link your social accounts so people can follow your journey (all optional).",
      content: (
        <div className="space-y-4 py-4">
          {/* Instagram */}
          <div className="flex items-center space-x-2">
            <label htmlFor="instagram" className="text-pink-500 min-w-[80px] text-sm">
              Instagram
            </label>
            <Input
              id="instagram"
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="your-handle"
            />
          </div>

          {/* TikTok */}
          <div className="flex items-center space-x-2">
            <label htmlFor="tiktok" className="text-black min-w-[80px] text-sm">
              TikTok
            </label>
            <Input
              id="tiktok"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="your-handle"
            />
          </div>

          {/* YouTube */}
          <div className="flex items-center space-x-2">
            <label htmlFor="youtube" className="text-red-600 min-w-[80px] text-sm">
              YouTube
            </label>
            <Input
              id="youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="your-channel"
            />
          </div>
        </div>
      ),
      canSkip: true,
    },
  ];

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  const handleNext = async () => {
    // Validate if step has validation
    if (currentStepData.validate && !currentStepData.validate()) {
      return;
    }

    // If last step, save and finish
    if (currentStep === steps.length - 1) {
      await handleFinish();
      return;
    }

    // Save data for step 1 (username) before moving forward
    if (currentStep === 1 && username.trim()) {
      setLoading(true);
      try {
        await updateProfile({ username: username.trim() });
      } catch (error) {
        console.error("Error saving username:", error);
        toast.error("Failed to save username");
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    // Move to next step
    setCurrentStep(currentStep + 1);
  };

  const handleSkip = () => {
    if (currentStep === steps.length - 1) {
      // If skipping last step, just finish
      handleFinish();
      return;
    }

    setCurrentStep(currentStep + 1);
  };

  const handleFinish = async () => {
    setLoading(true);

    try {
      // Save all data
      await updateProfile({
        username: username.trim() || undefined,
        bio: bio.trim() || undefined,
        instagram: instagram.trim() || undefined,
        tiktok: tiktok.trim() || undefined,
        youtube: youtube.trim() || undefined,
      });

      toast.success("Profile setup complete!");

      setShowDialog(false);
      if (onComplete) {
        onComplete();
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  if (!showDialog || isProfileComplete === undefined) {
    return null;
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        {/* Progress bar */}
        <div className="mb-4">
          <Progress value={progress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        <DialogHeader>
          <DialogTitle>{currentStepData.title}</DialogTitle>
          <DialogDescription>{currentStepData.description}</DialogDescription>
        </DialogHeader>

        {/* Step content */}
        <div className="py-2">{currentStepData.content}</div>

        {/* Actions */}
        <div className="flex justify-between mt-4">
          {currentStepData.canSkip ? (
            <Button variant="ghost" onClick={handleSkip} disabled={loading}>
              Skip
            </Button>
          ) : (
            <div />
          )}

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                disabled={loading}
              >
                Back
              </Button>
            )}
            <Button onClick={handleNext} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {currentStep === steps.length - 1 ? (
                <>
                  <Check className="mr-2 h-4 w-4" /> Finish
                </>
              ) : (
                "Next"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileOnboardingWizard;
