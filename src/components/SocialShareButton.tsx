
import React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Facebook, Twitter, Instagram, Download, Linkedin } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SocialShareButtonProps {
  cardRef: React.RefObject<HTMLDivElement>;
  memberName: string;
}

export const SocialShareButton: React.FC<SocialShareButtonProps> = ({ cardRef, memberName }) => {
  const [open, setOpen] = React.useState(false);

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
        case 'linkedin':
          window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(shareText)}`, '_blank');
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
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost"
          size="icon"
          className="rounded-full shadow-lg bg-green-600 hover:bg-green-700 text-white border-none focus:ring-2 focus:ring-green-400"
          aria-label="Share Virtual ID Card"
        >
          <Share2 className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="flex flex-col gap-2 w-44 p-2 bg-white/90 text-black border-none shadow-xl dark:bg-gray-900/95 dark:text-white">
        <Button onClick={downloadCardAsImage} variant="ghost" size="sm" className="justify-start w-full rounded-lg text-black dark:text-white hover:bg-green-700/10 dark:hover:bg-green-700/80">
          <Download className="h-4 w-4 mr-2" /> Download
        </Button>
        <Button onClick={() => shareToSocialMedia('facebook')} variant="ghost" size="sm" className="justify-start w-full rounded-lg text-black dark:text-white hover:bg-blue-700/10 dark:hover:bg-blue-700/80">
          <Facebook className="h-4 w-4 mr-2" /> Facebook
        </Button>
        <Button onClick={() => shareToSocialMedia('twitter')} variant="ghost" size="sm" className="justify-start w-full rounded-lg text-black dark:text-white hover:bg-sky-700/10 dark:hover:bg-sky-700/80">
          <Twitter className="h-4 w-4 mr-2" /> Twitter
        </Button>
        <Button onClick={() => shareToSocialMedia('linkedin')} variant="ghost" size="sm" className="justify-start w-full rounded-lg text-black dark:text-white hover:bg-blue-800/10 dark:hover:bg-blue-800/80">
          <Linkedin className="h-4 w-4 mr-2" /> LinkedIn
        </Button>
        <Button onClick={() => shareToSocialMedia('instagram')} variant="ghost" size="sm" className="justify-start w-full rounded-lg text-black dark:text-white hover:bg-pink-700/10 dark:hover:bg-pink-700/80">
          <Instagram className="h-4 w-4 mr-2" /> Instagram
        </Button>
      </PopoverContent>
    </Popover>
  );
};
