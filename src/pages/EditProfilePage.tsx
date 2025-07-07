import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Camera, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import ProfileSetupForm from '@/components/ProfileSetupForm';

export default function EditProfilePage() {
  const { user } = useUser();
  const navigate = useNavigate();
  const [imageUploading, setImageUploading] = useState(false);
  
  // Handle profile image upload using Clerk
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageUploading(true);
    
    try {
      if (user) {
        await user.setProfileImage({ file });
        toast({
          title: "Profile photo updated",
          description: "Your profile photo has been updated.",
        });
      }
    } catch (error) {
      console.error("Error uploading profile image:", error);
      toast({
        title: "Image upload failed",
        description: "We couldn't upload your profile image.",
        variant: "destructive",
      });
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-md">
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back
      </Button>
      
      <div className="mb-6 flex flex-col items-center">
        <div className="relative">
          <img 
            src={user?.imageUrl || '/placeholder-avatar.png'} 
            alt="Profile" 
            className="w-24 h-24 rounded-full object-cover"
          />
          <label 
            htmlFor="profileImage" 
            className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full cursor-pointer"
          >
            {imageUploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </label>
          <input 
            id="profileImage" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleImageUpload}
            disabled={imageUploading}
          />
        </div>
      </div>
      
      {/* Use our reusable ProfileSetupForm component for the edit form */}
      <ProfileSetupForm />
    </div>
  );
};
