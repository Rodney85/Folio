import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useUser } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";

type ProfileSetupFormProps = {
  isOnboarding?: boolean;
  onComplete?: () => void;
};

const ProfileSetupForm = ({ isOnboarding = false, onComplete }: ProfileSetupFormProps) => {
  const { user } = useUser();
  const navigate = useNavigate();
  const updateProfile = useMutation(api.users.updateProfile);
  
  // Get current profile data
  const profileData = useQuery(api.users.getProfile);
  
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [instagram, setInstagram] = useState("");
  const [tiktok, setTiktok] = useState("");
  const [youtube, setYoutube] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Initialize form with current user data when available
  useEffect(() => {
    if (profileData) {
      setUsername(profileData.username || "");
      setBio(profileData.bio || "");
      setInstagram(profileData.instagram || "");
      setTiktok(profileData.tiktok || "");
      setYoutube(profileData.youtube || "");
    }
  }, [profileData]);

  // Helper function to extract username from social media URLs
  const extractSocialUsername = (url: string, domain: string) => {
    if (!url) return "";
    
    // If the URL already looks like a username (no http/domain), return as is
    if (!url.includes('http') && !url.includes(domain)) {
      return url.trim();
    }
    
    try {
      // Handle full URLs
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const pathParts = urlObj.pathname.split('/');
      // Get username from path - usually the first non-empty part after domain
      const username = pathParts.filter(part => part).shift() || "";
      return username;
    } catch (error) {
      // If URL parsing fails, try to extract directly
      const parts = url.split(domain);
      if (parts.length > 1) {
        return parts[1].split('/')[0].split('?')[0].trim();
      }
      return url.trim(); // Return original if extraction fails
    }
  };

  const handleSave = async () => {
    // Only require username during initial onboarding
    if (isOnboarding && !username.trim()) {
      toast.error("Please enter a username for your profile.");
      return;
    }
    
    setLoading(true);
    
    try {
      // Clean up social media URLs to extract usernames
      const instagramUsername = instagram ? extractSocialUsername(instagram, 'instagram.com/') : undefined;
      const tiktokUsername = tiktok ? extractSocialUsername(tiktok, 'tiktok.com/@') : undefined;
      const youtubeUsername = youtube ? extractSocialUsername(youtube, 'youtube.com/') : undefined;
      
      // Only send fields that have values
      const profileData: Record<string, string | undefined> = {};
      
      // For non-onboarding updates, all fields should be sent to maintain existing data
      // This prevents fields from being unintentionally reset
      profileData.username = username.trim();
      profileData.bio = bio.trim();
      profileData.instagram = instagramUsername;
      profileData.tiktok = tiktokUsername;
      profileData.youtube = youtubeUsername;
      
      // Update profile in Convex database
      await updateProfile(profileData);
      
      toast.success(
        isOnboarding 
          ? "Your profile has been created successfully!" 
          : "Your profile has been updated successfully."
      );
      
      if (isOnboarding && onComplete) {
        onComplete();
      } else {
        navigate('/profile');
      }
    } catch (e) {
      console.error("Error saving profile:", e);
      toast.error("Something went wrong while saving your profile.");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isOnboarding ? "Complete Your Profile" : "Edit Profile"}</CardTitle>
        <CardDescription>
          {isOnboarding 
            ? "Let's set up your profile to get started with Carfolio." 
            : "Update your profile information."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
              placeholder="Your Instagram username or URL"
            />
          </div>
          
          {/* TikTok */}
          <div className="flex items-center space-x-2">
            <label htmlFor="tiktok" className="text-black min-w-[80px]">TikTok</label>
            <Input
              id="tiktok"
              value={tiktok}
              onChange={(e) => setTiktok(e.target.value)}
              placeholder="Your TikTok username or URL"
            />
          </div>
          
          {/* YouTube */}
          <div className="flex items-center space-x-2">
            <label htmlFor="youtube" className="text-red-600 min-w-[80px]">YouTube</label>
            <Input
              id="youtube"
              value={youtube}
              onChange={(e) => setYoutube(e.target.value)}
              placeholder="Your YouTube username or URL"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        {!isOnboarding && (
          <Button variant="outline" onClick={() => navigate('/profile')} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button onClick={handleSave} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isOnboarding ? "Complete Setup" : "Save Changes"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProfileSetupForm;
