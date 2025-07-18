
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Instagram, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SocialShareButtonProps {
  cardRef: React.RefObject<HTMLDivElement>;
  memberName: string;
}

export const SocialShareButton: React.FC<SocialShareButtonProps> = ({ cardRef, memberName }) => {
  const downloadCardAsImage = async () => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html-to-image')).toPng;
      const dataUrl = await html2canvas(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const link = document.createElement('a');
      link.download = `${memberName.replace(/\s+/g, '_')}_virtual_id.png`;
      link.href = dataUrl;
      link.click();
      
      toast({
        title: "Downloaded!",
        description: "Your Virtual ID Card has been downloaded as an image.",
      });
    } catch (error) {
      console.error('Error downloading image:', error);
      toast({
        title: "Error",
        description: "Failed to download the image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const shareToSocialMedia = async (platform: string) => {
    if (!cardRef.current) return;

    try {
      const html2canvas = (await import('html-to-image')).toBlob;
      const blob = await html2canvas(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });

      if (!blob) throw new Error('Failed to generate image');

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `${memberName}_virtual_id.png`, { type: 'image/png' });
        
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: 'My Virtual ID Card',
            text: `Check out my Virtual ID Card!`,
            files: [file]
          });
          return;
        }
      }

      // Fallback for platforms without native sharing
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });

      const shareText = `Check out my Virtual ID Card! 🎉`;
      const shareUrl = window.location.origin;

      switch (platform) {
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`, '_blank');
          break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank');
          break;
        case 'instagram':
          // Instagram doesn't support direct URL sharing, so we download the image
          const link = document.createElement('a');
          link.download = `${memberName.replace(/\s+/g, '_')}_virtual_id.png`;
          link.href = dataUrl;
          link.click();
          toast({
            title: "Image Downloaded",
            description: "Share this image on Instagram manually!",
          });
          break;
        default:
          downloadCardAsImage();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "Error",
        description: "Failed to share. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-wrap gap-2 justify-center mt-4">
      <Button 
        onClick={downloadCardAsImage}
        variant="outline" 
        size="sm"
        className="flex items-center space-x-2"
      >
        <Download className="h-4 w-4" />
        <span>Download</span>
      </Button>
      
      <Button 
        onClick={() => shareToSocialMedia('facebook')}
        variant="outline" 
        size="sm"
        className="flex items-center space-x-2"
      >
        <Facebook className="h-4 w-4" />
        <span>Facebook</span>
      </Button>
      
      <Button 
        onClick={() => shareToSocialMedia('twitter')}
        variant="outline" 
        size="sm"
        className="flex items-center space-x-2"
      >
        <Twitter className="h-4 w-4" />
        <span>Twitter</span>
      </Button>
      
      <Button 
        onClick={() => shareToSocialMedia('instagram')}
        variant="outline" 
        size="sm"
        className="flex items-center space-x-2"
      >
        <Instagram className="h-4 w-4" />
        <span>Instagram</span>
      </Button>
      
      {navigator.share && (
        <Button 
          onClick={() => shareToSocialMedia('native')}
          variant="outline" 
          size="sm"
          className="flex items-center space-x-2"
        >
          <Share2 className="h-4 w-4" />
          <span>Share</span>
        </Button>
      )}
    </div>
  );
};
