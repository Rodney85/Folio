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
import { Loader2 } from "lucide-react";

type ProfileSetupFormProps = {
  isOnboarding?: boolean;
  onComplete?: () => void;
};

const ProfileSetupForm = ({ isOnboarding = false, onComplete }: ProfileSetupFormProps) => {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const navigate = useNavigate();
  
  // Use a type-safe mutation or cast it properly to avoid "excessively deep" errors
  const updateProfile = useMutation(api.users.updateProfile as any);
  
  // useReverification returns an enhanced function that handles security modals automatically.
  // We wrap the user.update call. If Clerk needs verification, it will pop up a modal.
  const reverifiedUpdate = useReverification(async (params: { username: string }) => {
    if (!user) return;
    return user.update(params);
  });

  const profileData = useQuery(api.users.getProfile);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [loading, setLoading] = useState(false);
  
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
      toast.error("Please enter a username.");
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

      // Step 1: Update in Clerk (if username changed)
      // reverifiedUpdate will trigger the OTP modal if Clerk security requires it.
      if (user && profilePayload.username && profilePayload.username !== user.username) {
        try {
          await reverifiedUpdate({ username: profilePayload.username });
        } catch (err: any) {
          console.error("Clerk update error:", err);
          
          // Check for cancelled verification or other errors
          if (err.errors?.[0]?.code === "form_identifier_exists") {
             toast.error("Username is already taken.");
          } else if (err.status === 403 || err.message?.includes("verification")) {
             // This is usually handled by the modal, but just in case
             toast.error("Verification failed or cancelled.");
          } else {
             toast.error(err.errors?.[0]?.message || "Could not update username.");
          }
          setLoading(false);
          return;
        }
      }

      // Step 2: Update in Convex
      await updateProfile(profilePayload);
      toast.success(isOnboarding ? "Profile created!" : "Profile updated.");
      if (isOnboarding && onComplete) {
        onComplete();
      } else {
        navigate('/profile');
      }
    } catch (e: any) {
      console.error("Error saving profile:", e);
      toast.error(e?.data?.message || e?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isOnboarding ? "Complete Your Profile" : "Edit Profile"}</CardTitle>
        <CardDescription>
          {isOnboarding ? "Let's set up your profile to get started." : "Update your profile information."}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="username">Username *</label>
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1">@</span>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="bio">Bio</label>
          <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Social Media Handles</label>
          <div className="grid gap-2">
            <div className="flex items-center space-x-2">
              <label htmlFor="instagram" className="text-pink-500 min-w-[80px]">Instagram</label>
              <Input
                id="instagram"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value)}
                placeholder="Your Instagram username"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="tiktok" className="text-slate-900 dark:text-white min-w-[80px]">TikTok</label>
              <Input
                id="tiktok"
                value={tiktok}
                onChange={(e) => setTiktok(e.target.value)}
                placeholder="Your TikTok username"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="youtube" className="text-red-500 min-w-[80px]">YouTube</label>
              <Input
                id="youtube"
                value={youtube}
                onChange={(e) => setYoutube(e.target.value)}
                placeholder="Your YouTube handle"
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex justify-end space-x-2">
        {!isOnboarding && (
          <Button variant="outline" onClick={() => navigate('/profile')} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={loading || !isAuthenticated}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isOnboarding ? "Complete Setup" : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSetupForm;
