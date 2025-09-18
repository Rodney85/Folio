import { useState, useRef, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { X, Download, Copy, Share2 } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
  username: string;
  profileUrl: string;
}

export const ShareModal = ({
  open,
  onClose,
  username,
  profileUrl,
}: ShareModalProps) => {
  const [qrSize, setQrSize] = useState(200);
  const qrRef = useRef<SVGSVGElement>(null);
  const formattedProfileUrl = profileUrl;

  // Handle QR code download
  const handleDownload = () => {
    if (!qrRef.current) return;
    
    const svgData = new XMLSerializer().serializeToString(qrRef.current);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${username}-carfolio-qr.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
      
      toast.success("QR code downloaded successfully!");
    };
    
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };
  
  // Copy profile URL to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(formattedProfileUrl);
      toast.success("Profile link copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy link");
      console.error("Failed to copy: ", error);
    }
  };
  
  // Share via native share API if available
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${username}'s Carfolio Profile`,
          text: `Check out ${username}'s car collection on Carfolio!`,
          url: formattedProfileUrl,
        });
        toast.success("Shared successfully!");
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast.error("Failed to share");
          console.error("Failed to share: ", error);
        }
      }
    } else {
      copyToClipboard();
    }
  };
  
  // Adjust QR size based on screen size
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setQrSize(200);
      } else if (width < 1024) {
        setQrSize(250);
      } else {
        setQrSize(300);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg lg:max-w-xl">
        <DialogHeader className="relative">
          <button 
            onClick={onClose} 
            className="absolute right-0 top-0 rounded-full p-2 opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          <DialogTitle className="flex items-center justify-between pr-8">
            Share Profile
          </DialogTitle>
          <DialogDescription>
            Share your Carfolio profile with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8">
          {/* QR Code */}
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <QRCodeSVG
              ref={qrRef}
              value={formattedProfileUrl}
              size={qrSize}
              bgColor="#FFFFFF"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>
          
          {/* Profile URL */}
          <div className="flex w-full max-w-sm md:max-w-md lg:max-w-lg items-center space-x-2">
            <div className="flex-1 overflow-hidden">
              <p className="truncate text-sm font-medium">{formattedProfileUrl}</p>
            </div>
            <Button variant="outline" size="icon" onClick={copyToClipboard}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex w-full justify-center space-x-4 md:space-x-6">
            <Button
              variant="secondary"
              className="flex items-center gap-2"
              onClick={handleDownload}
            >
              <Download className="h-4 w-4" />
              Download QR
            </Button>
            <Button
              variant="default"
              className="flex items-center gap-2"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareModal;
