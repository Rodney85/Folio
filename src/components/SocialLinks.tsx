import React from 'react';
import { toast } from "sonner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTiktok, faInstagram, faYoutube } from "@fortawesome/free-brands-svg-icons";

interface SocialLinksProps {
  instagram?: string;
  tiktok?: string;
  youtube?: string;
  disableEdit?: boolean;
}

const SocialLinks: React.FC<SocialLinksProps> = ({ 
  instagram, 
  tiktok, 
  youtube,
  disableEdit = false
}) => {
  return (
    <div className="flex space-x-8 mb-6">
      {/* Instagram Icon */}
      <a 
        href={instagram ? `https://instagram.com/${instagram}` : "#"} 
        target={instagram ? "_blank" : "_self"}
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!instagram && !disableEdit) {
            e.preventDefault();
            toast("Instagram not configured", {
              description: "Configure your Instagram link in your profile settings."
            });
          }
        }}
      >
        <FontAwesomeIcon 
          icon={faInstagram} 
          className={`h-6 w-6 ${instagram ? 'text-pink-600 hover:text-pink-700' : 'text-gray-400 hover:text-gray-500'}`} 
        />
      </a>
      
      {/* TikTok Icon */}
      <a 
        href={tiktok ? `https://tiktok.com/@${tiktok}` : "#"} 
        target={tiktok ? "_blank" : "_self"}
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!tiktok && !disableEdit) {
            e.preventDefault();
            toast("TikTok not configured", {
              description: "Configure your TikTok link in your profile settings."
            });
          }
        }}
      >
        <FontAwesomeIcon 
          icon={faTiktok} 
          className={`h-6 w-6 ${tiktok ? 'text-black hover:text-gray-800' : 'text-gray-400 hover:text-gray-500'}`} 
        />
      </a>
      
      {/* YouTube Icon */}
      <a 
        href={youtube ? `https://youtube.com/${youtube}` : "#"} 
        target={youtube ? "_blank" : "_self"}
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!youtube && !disableEdit) {
            e.preventDefault();
            toast("YouTube not configured", {
              description: "Configure your YouTube link in your profile settings."
            });
          }
        }}
      >
        <FontAwesomeIcon 
          icon={faYoutube} 
          className={`h-6 w-6 ${youtube ? 'text-red-600 hover:text-red-700' : 'text-gray-400 hover:text-red-600'}`} 
        />
      </a>
    </div>
  );
};

export default SocialLinks;
