import React from 'react';
import TwitterIcon from './icons/TwitterIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import WhatsAppIcon from './icons/WhatsAppIcon';
import InstagramIcon from './icons/InstagramIcon';
import EmailIcon from './icons/EmailIcon';
import ShareIcon from './icons/ShareIcon';

interface SocialShareButtonsProps {
  title: string;
  url: string;
  className?: string;
}

const SocialShareButtons: React.FC<SocialShareButtonsProps> = ({ title, url, className = "" }) => {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  
  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    gmail: `mailto:?subject=${encodedTitle}&body=Check out this post: ${encodedUrl}`,
    instagram: `https://www.instagram.com/` // Instagram doesn't have a direct share URL, usually just a link to profile or app
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url
        });
      } catch (err) {
        console.log('Share was cancelled or failed.', err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(url);
        // We could add a toast here, but let's keep it simple as requested
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`}>
      <span className="text-sm font-bold text-slate-500 dark:text-slate-400 flex items-center gap-2">
        <ShareIcon className="w-4 h-4" />
        Share:
      </span>
      <div className="flex items-center gap-2">
        {/* Twitter */}
        <a 
          href={shareLinks.twitter} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-sky-500 hover:text-white dark:hover:bg-sky-500 transition-colors shadow-sm"
          title="Share on Twitter"
        >
          <TwitterIcon className="w-4 h-4" />
        </a>
        
        {/* LinkedIn */}
        <a 
          href={shareLinks.linkedin} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-colors shadow-sm"
          title="Share on LinkedIn"
        >
          <LinkedInIcon className="w-4 h-4" />
        </a>
        
        {/* WhatsApp */}
        <a 
          href={shareLinks.whatsapp} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-green-500 hover:text-white dark:hover:bg-green-500 transition-colors shadow-sm"
          title="Share on WhatsApp"
        >
          <WhatsAppIcon className="w-4 h-4" />
        </a>
        
        {/* Gmail */}
        <a 
          href={shareLinks.gmail} 
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-red-500 hover:text-white dark:hover:bg-red-500 transition-colors shadow-sm"
          title="Share via Email"
        >
          <EmailIcon className="w-4 h-4" />
        </a>
        
        {/* Instagram */}
        <a 
          href={shareLinks.instagram} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-pink-500 hover:text-white dark:hover:bg-pink-500 transition-colors shadow-sm"
          title="Visit Instagram"
        >
          <InstagramIcon className="w-4 h-4" />
        </a>

        {/* Browser Native Share */}
        <button 
          onClick={handleNativeShare}
          className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-md ml-1"
          title="More sharing options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
        </button>
      </div>
    </div>
  );
};

export default SocialShareButtons;
