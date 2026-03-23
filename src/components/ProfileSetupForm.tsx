import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser, useReverification } from "@clerk/clerk-react";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

type ProfileSetupFormProps = {
  isOnboarding?: boolean;
  onComplete?: () => void;
};

const ProfileSetupForm = ({ isOnboarding = false, onComplete }: ProfileSetupFormProps) => {
  const { user } = useUser();
  const { status: reverifyStatus, prepare: prepareReverify, attempt: attemptReverify } = useReverification();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateProfile as any);

  const profileData = useQuery(api.users.getProfile);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [loading, setLoading] = useState(false);
  
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || "");
      setBio(profileData.bio || "");
      setInstagram(profileData.instagram || "");
      setTiktok(profileData.tiktok || "");
      setYoutube(profileData.youtube || "");
    }
  }, [profileData]);

  const extractSocialUsername = (url: string, domain: string) => {
    if (!url) return "";
    if (!url.includes('http') && !url.includes(domain)) return url.trim();
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathParts = urlObj.pathname.split('/');
      return pathParts.filter(part => part).shift() || "";
    } catch (error) {
      const parts = url.split(domain);
      if (parts.length > 1) return parts[1].split('/')[0].split('?')[0].trim();
      return url.trim();
    }
  };
  
  const handleSave = async () => {
    if (!isAuthenticated) {
      toast.error("Please wait while we connect to the server...");
      return;
    }

    if (isOnboarding && !username.trim()) {
      toast.error("Please enter a username for your profile.");
      return;
    }

    setLoading(true);

    try {
      const instagramUsername = instagram ? extractSocialUsername(instagram, 'instagram.com/') : undefined;
      const tiktokUsername = tiktok ? extractSocialUsername(tiktok, 'tiktok.com/@') : undefined;
      const youtubeHandle = youtube ? extractSocialUsername(youtube, 'youtube.com/').replace(/^@/, '') : undefined;

      const profilePayload: any = {
        username: username.trim(),
        bio: bio.trim(),
        instagram: instagramUsername,
        tiktok: tiktokUsername,
        youtube: youtubeHandle,
      };

      if (isOnboarding) {
        profilePayload.profileCompleted = true;
      }

      // Sync with Clerk FIRST if username is changing
      if (user && profilePayload.username && profilePayload.username !== user.username) {
        try {
          // Check if we need to trigger reverification
          await user.update({ username: profilePayload.username as string });
          // If update succeeded without error, proceed to Convex
        } catch (err: any) {
          // Handle "reverification required" error
          if (err.errors && err.errors[0]?.code === "verification_required") {
            // Trigger Clerk's verification email/sms
            if (prepareReverify) {
              await prepareReverify();
              setPendingPayload(profilePayload);
              setIsVerifying(true);
              setLoading(false);
              toast.info("A verification code has been sent to your primary email.");
              return; // Wait for OTP
            }
          }
          throw err; // Rethrow other errors
        }
      }

      await updateProfile(profilePayload);
      toast.success(isOnboarding ? "Profile created!" : "Profile updated.");
      if (isOnboarding && onComplete) onComplete(); else navigate('/profile');
    } catch (e: any) {
      console.error("Error saving profile:", e);
      toast.error(e?.data?.message || e?.message || "Something went wrong.");
    } finally {
      if (!isVerifying) setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!verificationCode || verificationCode.length < 6) {
      toast.error("Please enter a valid 6-digit code.");
      return;
    }

    setLoading(true);
    try {
      if (attemptReverify) {
        await attemptReverify(verificationCode);
        
        // Verification succeeded, now finalize the update
        if (pendingPayload) {
          // Re-try the username update now that we're verified
          await user?.update({ username: pendingPayload.username });
          await updateProfile(pendingPayload);
          toast.success("Username verified and profile updated!");
          if (isOnboarding && onComplete) onComplete(); else navigate('/profile');
        }
      }
    } catch (err: any) {
      console.error("Verification failed:", err);
      toast.error(err.errors?.[0]?.message || "Invalid verification code.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isVerifying ? "Verify Your Identity" : (isOnboarding ? "Complete Your Profile" : "Edit Profile")}</CardTitle>
        <CardDescription>
          {isVerifying 
            ? "For security, we've sent a code to your email to confirm this change."
            : (isOnboarding ? "Let's set up your profile to get started." : "Update your profile information.")}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isVerifying ? (
          <div className="flex flex-col items-center justify-center py-4 space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <ShieldCheck className="w-8 h-8 text-primary animate-pulse" />
            </div>
            
            <div className="space-y-2 text-center">
              <label className="text-sm font-medium">Enter 6-digit verification code</label>
              <InputOTP 
                maxLength={6} 
                value={verificationCode} 
                onChange={(val) => setVerificationCode(val)}
                disabled={loading}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Didn't receive a code? <button onClick={() => prepareReverify?.()} className="text-primary hover:underline">Resend</button>
            </p>
          </div>
        ) : (
          <>
            {/* Username */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="username">
                Username *
              </label>
              <div className="flex items-center">
                <span className="text-muted-foreground mr-1">@</span>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username"
                  required
                />
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="bio">
                Bio
              </label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            {/* Social Media */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Social Media</label>
              
              {/* Instagram */}
              <div className="flex items-center space-x-2">
                <label htmlFor="instagram" className="text-pink-500 min-w-[80px]">Instagram</label>
                <Input
                  id="instagram"
                  value={instagram}
                  onChange={(e) => setInstagram(e.target.value)}
                  placeholder="Your Instagram username"
                />
              </div>
              
              {/* TikTok */}
              <div className="flex items-center space-x-2">
                <label htmlFor="tiktok" className="text-slate-900 dark:text-white min-w-[80px]">TikTok</label>
                <Input
                  id="tiktok"
                  value={tiktok}
                  onChange={(e) => setTiktok(e.target.value)}
                  placeholder="Your TikTok username"
                />
              </div>
              
              {/* YouTube */}
              <div className="flex items-center space-x-2">
                <label htmlFor="youtube" className="text-red-600 min-w-[80px]">YouTube</label>
                <Input
                  id="youtube"
                  value={youtube}
                  onChange={(e) => setYoutube(e.target.value)}
                  placeholder="Your YouTube handle"
                />
              </div>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {isVerifying ? (
          <>
            <Button variant="ghost" onClick={() => setIsVerifying(false)} disabled={loading}>Back</Button>
            <Button onClick={handleVerifyOTP} disabled={loading || verificationCode.length < 6}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify & Save
            </Button>
          </>
        ) : (
          <>
            {!isOnboarding && (
              <Button variant="outline" onClick={() => navigate('/profile')} disabled={loading || !isAuthenticated}>
                Cancel
              </Button>
            )}
            <Button onClick={handleSave} disabled={loading || !isAuthenticated}>
              {(loading || !isAuthenticated) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!isAuthenticated ? "Connecting..." : (isOnboarding ? "Complete Setup" : "Save Changes")}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
};

export default ProfileSetupForm;
