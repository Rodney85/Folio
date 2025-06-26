import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { ChevronLeft, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

const EditProfilePage = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.publicMetadata?.bio as string || "");
  const [instagram, setInstagram] = useState(user?.publicMetadata?.instagram as string || "");
  const [tiktok, setTiktok] = useState(user?.publicMetadata?.tiktok as string || "");
  const [youtube, setYoutube] = useState(user?.publicMetadata?.youtube as string || "");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Update user metadata in Clerk
      await user?.update({
        username: username,
        publicMetadata: {
          ...user.publicMetadata,
          bio: bio,
          instagram: instagram,
          tiktok: tiktok,
          youtube: youtube
        }
      });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Error updating profile",
        description: "There was an error updating your profile. Please try again.",
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Top bar */}
      <div className="flex justify-between items-center p-4 border-b">
        <button onClick={() => navigate('/profile')} className="flex items-center">
          <ChevronLeft className="h-5 w-5 mr-1" />
        </button>
        <h1 className="text-lg font-medium flex-1 text-center">Edit Profile</h1>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleSave}
          disabled={loading}
        >
          Save
        </Button>
      </div>

      {/* Profile photo */}
      <div className="flex flex-col items-center p-6 pb-8">
        <div className="relative">
          <img 
            src={user?.imageUrl || "https://via.placeholder.com/100"} 
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
          <button 
            className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-2 rounded-full"
            onClick={() => {
              // In a real app, this would open a file picker 
              toast({
                title: "Feature coming soon",
                description: "Photo upload will be available soon!"
              });
            }}
          >
            <Camera size={16} />
          </button>
        </div>
        <span className="text-sm text-muted-foreground mt-3">Change photo</span>
      </div>
      
      {/* Form fields */}
      <div className="px-4 space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">About you</label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Username</label>
              <Input 
                value={username} 
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Bio</label>
              <Textarea 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                className="mt-1 min-h-[80px]"
                placeholder="Tell others a bit about yourself..."
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-1">
          <label className="text-sm font-medium">Socials</label>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Instagram</label>
              <Input 
                value={instagram} 
                onChange={(e) => setInstagram(e.target.value)} 
                className="mt-1"
                placeholder="Your Instagram username"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Tiktok</label>
              <Input 
                value={tiktok} 
                onChange={(e) => setTiktok(e.target.value)} 
                className="mt-1"
                placeholder="Your Tiktok username"
              />
            </div>
            
            <div>
              <label className="text-xs text-muted-foreground">Youtube</label>
              <Input 
                value={youtube} 
                onChange={(e) => setYoutube(e.target.value)} 
                className="mt-1"
                placeholder="Your Youtube channel name"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
