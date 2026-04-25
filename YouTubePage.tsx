import React, { useState, useEffect, useRef } from 'react';
import { useNotificationState } from './contexts/NotificationContext';
import SpinnerIcon from './components/icons/SpinnerIcon';
import YouTubeIcon from './components/icons/YouTubeIcon';
import useLocalStorage from './hooks/useLocalStorage';

// Declare the YT object on the window to fix TypeScript errors
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const suggestedVideos = [
    { id: 'aqz-KE-bpKQ', title: 'Big Buck Bunny (Creative Commons)', author: 'Blender' },
    { id: 'M7lc1UVf-VE', title: 'Coffee Run - Blender Open Movie', author: 'Blender' },
    { id: 'dQw4w9WgXcQ', title: 'Never Gonna Give You Up', author: 'Rick Astley' },
    { id: 'e-ORhEE9VVg', title: 'Glass Half - Blender Open Movie', author: 'Blender' },
];

const YouTubePage: React.FC = () => {
    const playerRef = useRef<any | null>(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [videoId, setVideoId] = useLocalStorage('youtube-current-video-id', suggestedVideos[0].id);
    const [videoUrlInput, setVideoUrlInput] = useState('');
    const [playerError, setPlayerError] = useState<{ code: number; videoId: string } | null>(null);
    const { addNotification } = useNotificationState();

    const extractVideoId = (url: string): string | null => {
        try {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                return urlObj.pathname.slice(1);
            }
            if (urlObj.hostname.includes('youtube.com')) {
                const videoIdParam = urlObj.searchParams.get('v');
                if (videoIdParam) return videoIdParam;
            }
        } catch (e) {
            if (url.match(/^[a-zA-Z0-9_-]{11}$/)) {
                return url;
            }
        }
        return null;
    };
    
    useEffect(() => {
        const createPlayer = () => {
            if (playerRef.current || !document.getElementById('youtube-player-embed')) {
                return;
            }
            playerRef.current = new window.YT.Player('youtube-player-embed', {
                height: '100%',
                width: '100%',
                videoId: videoId,
                playerVars: {
                    'playsinline': 1,
                    'autoplay': 1,
                    'controls': 1,
                    'mute': 1,
                    'rel': 0,
                    'modestbranding': 1,
                    'origin': window.location.origin
                },
                events: {
                    'onReady': () => setIsPlayerReady(true),
                    'onStateChange': (event: any) => {
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            setPlayerError(null);
                        }
                    },
                    'onError': (event: any) => {
                        console.error("YouTube Player Error:", event.data);
                        const currentVideoId = playerRef.current?.getVideoData?.()?.video_id || videoId;
                        setPlayerError({ code: event.data, videoId: currentVideoId });
                        let message = 'An unexpected error occurred while trying to play the video.';
                        if (event.data === 101 || event.data === 150) {
                            message = 'Playback is restricted. This video is private or the owner does not allow it to be embedded.';
                        }
                        addNotification({ title: `YouTube Player Error`, message, type: 'error' });
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            createPlayer();
        } else {
            const existingCallback = window.onYouTubeIframeAPIReady;
            window.onYouTubeIframeAPIReady = () => {
                if (existingCallback) existingCallback();
                createPlayer();
            };
        }
        
        return () => {
            if (playerRef.current && typeof playerRef.current.destroy === 'function') {
                playerRef.current.destroy();
            }
            playerRef.current = null;
        };
    }, [addNotification, videoId]);

    useEffect(() => {
        if (playerRef.current && isPlayerReady && typeof playerRef.current.loadVideoById === 'function') {
            setPlayerError(null);
            playerRef.current.loadVideoById(videoId);
        }
    }, [videoId, isPlayerReady]);
    
    const handleSetVideo = () => {
        const newVideoId = extractVideoId(videoUrlInput);
        if (newVideoId) {
            setPlayerError(null);
            setVideoId(newVideoId);
            setVideoUrlInput('');
        } else {
            addNotification({ title: 'Invalid URL', message: 'Please enter a valid YouTube video URL or ID.', type: 'warning' });
        }
    };
    
    const handleSuggestionClick = (newVideoId: string) => {
        setPlayerError(null);
        setVideoId(newVideoId);
    };

    return (
        <div className="h-full w-full flex flex-col md:flex-row bg-slate-100 dark:bg-slate-900">
            <main className="flex-1 flex flex-col p-4">
                <div className="aspect-video w-full bg-black rounded-lg shadow-lg overflow-hidden flex-shrink-0 relative">
                    <div id="youtube-player-embed" className="w-full h-full"></div>
                    {!isPlayerReady && !playerError && (
                         <div className="w-full h-full flex items-center justify-center absolute top-0 left-0 pointer-events-none">
                            <SpinnerIcon className="w-12 h-12 text-slate-500"/>
                        </div>
                    )}
                    {playerError && (
                        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-4 animate-fade-in">
                            <h3 className="text-xl font-bold text-white mb-2">Video Unavailable</h3>
                            <p className="text-red-400 mb-4 max-w-sm">This video cannot be played here due to restrictions from the owner.</p>
                            <a
                                href={`https://www.youtube.com/watch?v=${playerError.videoId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-colors"
                            >
                                <YouTubeIcon className="w-5 h-5" /> Watch on YouTube
                            </a>
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            value={videoUrlInput}
                            onChange={(e) => setVideoUrlInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSetVideo()}
                            placeholder="Paste YouTube URL or Video ID"
                            className="modern-input flex-1"
                        />
                        <button onClick={handleSetVideo} className="btn !w-auto px-4 !m-0">Load Video</button>
                    </div>
                     <div className="text-center mt-3">
                        <a
                            href={`https://www.youtube.com/watch?v=${videoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-slate-500 hover:underline dark:text-slate-400 dark:hover:text-slate-300"
                        >
                            Open current video on YouTube &rarr;
                        </a>
                    </div>
                </div>
            </main>
            <aside className="w-full md:w-80 flex-shrink-0 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col">
                <h2 className="text-lg font-bold mb-4">Suggestions</h2>
                <div className="space-y-3 overflow-y-auto">
                    {suggestedVideos.map(video => (
                        <button key={video.id} onClick={() => handleSuggestionClick(video.id)} className={`w-full text-left p-2 rounded-lg flex items-center gap-3 transition-colors ${videoId === video.id ? 'bg-indigo-100 dark:bg-indigo-900/50' : 'hover:bg-slate-200 dark:hover:bg-slate-800'}`}>
                            <img src={`https://i.ytimg.com/vi/${video.id}/mqdefault.jpg`} alt={video.title} className="w-24 h-14 object-cover rounded flex-shrink-0" />
                            <div>
                                <p className="text-sm font-semibold line-clamp-2">{video.title}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{video.author}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </aside>
        </div>
    );
};

export default YouTubePage;