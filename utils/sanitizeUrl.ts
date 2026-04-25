export const sanitizeUrl = (url: string | null | undefined): string | undefined => {
  if (!url) return undefined;
  const lowerUrl = url.trim().toLowerCase();
  
  if (lowerUrl.startsWith('javascript:') || lowerUrl.startsWith('data:') || lowerUrl.startsWith('vbscript:')) {
    return 'about:blank';
  }
  return url;
};
