
import React, { useState, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import KaliIcon from '../components/icons/KaliIcon';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import RefreshIcon from '../components/icons/RefreshIcon';
import XCircleIcon from '../components/icons/XCircleIcon';
import InfoIcon from '../components/icons/InfoIcon';
import SettingsIcon from '../components/icons/SettingsIcon';
import MoveIcon from '../components/icons/MoveIcon';
import CodeBracketIcon from '../components/icons/CodeBracketIcon';

type QualitySetting = 'high' | 'medium' | 'low';

const KaliPage: React.FC<{ refreshKey?: number }> = ({ refreshKey }) => {
    // Default to empty
    const [ngrokUrl, setNgrokUrl] = useLocalStorage<string>('kali-ngrok-url', '');
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);

    React.useEffect(() => {
        if (refreshKey && refreshKey > 0) {
            handleRefresh();
        }
    }, [refreshKey]);
    const [showHelp, setShowHelp] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showClipboard, setShowClipboard] = useState(false);
    const [clipboardText, setClipboardText] = useState('');
    
    // Performance Settings
    const [quality, setQuality] = useLocalStorage<QualitySetting>('vnc-quality', 'medium');
    const [scaleMode, setScaleMode] = useLocalStorage<'remote' | 'scale'>('vnc-scale', 'scale');
    const [viewOnly, setViewOnly] = useState(false);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    const constructConnectionUrl = () => {
        if (!ngrokUrl) return '';

        try {
            // 1. Sanitize the input to get the hostname
            // Removes 'http://', 'https://', and trailing slashes to get just the domain
            let cleanUrl = ngrokUrl.trim().replace(/\/$/, '');
            const hostname = cleanUrl.replace(/(^\w+:|^)\/\//, '');

            // 2. Base VNC Path
            // We serve vnc.html over HTTPS from the ngrok domain
            const baseUrl = `https://${hostname}/vnc.html`;

            // 3. Construct Query Parameters
            // CRITICAL: We must explicitly tell noVNC to connect to the Ngrok Host on Port 443 via WSS
            // If we don't do this, it defaults to port 6080 or localhost, which fails on mobile.
            const params = new URLSearchParams();
            
            params.append('host', hostname);       // Force connection to Ngrok URL
            params.append('port', '443');          // Ngrok HTTPS always terminates on 443
            params.append('encrypt', '1');         // Force WSS (Secure WebSocket)
            params.append('path', 'websockify');   // Standard websockify path
            
            // UX Params
            params.append('autoconnect', 'true');
            params.append('resize', scaleMode);
            params.append('reconnect', 'true');
            params.append('reconnect_delay', '2000');
            if (viewOnly) params.append('view_only', 'true');

            // Quality Tuning
            switch (quality) {
                case 'high':
                    params.append('compression', '2'); 
                    params.append('quality', '9'); 
                    break;
                case 'medium':
                    params.append('compression', '6'); 
                    params.append('quality', '6');
                    break;
                case 'low':
                    params.append('compression', '9'); 
                    params.append('quality', '3'); 
                    break;
            }

            return `${baseUrl}?${params.toString()}`;

        } catch (e) {
            console.error("Invalid URL provided", e);
            return '';
        }
    };

    const handleConnect = (e: React.FormEvent) => {
        e.preventDefault();
        if (!ngrokUrl) return;
        
        setIsLoading(true);
        // Reset iframe to force reload with new params
        setIframeKey(prev => prev + 1);
        
        setTimeout(() => {
            setIsConnected(true);
            setIsLoading(false);
        }, 800);
    };

    const handleDisconnect = () => {
        setIsConnected(false);
        setShowSettings(false);
        setShowClipboard(false);
    };

    const handleRefresh = () => {
        setIframeKey(prev => prev + 1);
    };

    // Helper to inject text (simulated clipboard)
    const handleSendClipboard = () => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.focus();
        }
        setShowClipboard(!showClipboard);
    };

    if (isConnected) {
        return (
            <div className="h-full w-full flex flex-col bg-black relative overflow-hidden">
                <iframe 
                    ref={iframeRef}
                    key={iframeKey}
                    src={constructConnectionUrl()} 
                    className="flex-1 w-full h-full border-none touch-none"
                    allow="clipboard-read; clipboard-write; fullscreen; autoplay"
                    title="Kali Linux VNC"
                    style={{ touchAction: 'none' }} 
                />
                
                {/* Clipboard Helper Overlay */}
                {showClipboard && (
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 w-80 bg-slate-800/90 backdrop-blur border border-slate-600 rounded-lg p-4 shadow-2xl animate-slide-down-and-fade z-20">
                        <h4 className="text-white text-xs font-bold uppercase mb-2">Send Text to Remote</h4>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={clipboardText} 
                                onChange={(e) => setClipboardText(e.target.value)}
                                className="flex-1 bg-black/50 border border-slate-600 rounded px-2 py-1 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                                placeholder="Type text..."
                            />
                            <button 
                                onClick={() => navigator.clipboard.writeText(clipboardText)} 
                                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs font-bold"
                            >
                                Copy
                            </button>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-2">
                            *Due to browser security, copy here then use the noVNC side menu clipboard to paste into Kali.
                        </p>
                    </div>
                )}

                {/* Floating Controls Overlay */}
                <div className="absolute top-4 left-0 right-0 flex justify-center z-10 pointer-events-none">
                    <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-3 shadow-2xl pointer-events-auto transform transition-all hover:scale-105">
                        <div className="flex items-center gap-2 px-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider hidden sm:block">Live</span>
                        </div>
                        
                        <div className="w-px h-4 bg-slate-700"></div>
                        
                        <button 
                            onClick={() => setShowClipboard(!showClipboard)}
                            className={`p-2 rounded-full transition-colors ${showClipboard ? 'bg-indigo-600 text-white' : 'hover:bg-slate-700 text-slate-400 hover:text-white'}`}
                            title="Clipboard Helper"
                        >
                            <CodeBracketIcon className="w-4 h-4" />
                        </button>

                        <button 
                            onClick={handleRefresh}
                            className="p-2 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                            title="Reload Connection"
                        >
                            <RefreshIcon className="w-4 h-4" />
                        </button>
                        
                        <button 
                            onClick={handleDisconnect}
                            className="p-2 bg-red-500/10 hover:bg-red-600 text-red-500 hover:text-white rounded-full transition-colors"
                            title="Disconnect"
                        >
                            <XCircleIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full bg-slate-50 dark:bg-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 overflow-y-auto">
            <div className="max-w-4xl w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Config Section */}
                <div className="flex-1 p-8">
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-slate-700 shadow-inner">
                            <KaliIcon className="w-12 h-12 text-slate-800 dark:text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Kali Remote Desktop</h1>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 text-center max-w-xs">
                            Secure, low-latency VNC access via Websockify & Ngrok.
                        </p>
                    </div>

                    <form onSubmit={handleConnect} className="space-y-6">
                        <div>
                            <label htmlFor="vnc-url" className="block text-xs font-bold uppercase text-slate-500 mb-2">Ngrok Public URL</label>
                            <div className="relative">
                                <input 
                                    id="vnc-url"
                                    type="url" 
                                    value={ngrokUrl}
                                    onChange={(e) => setNgrokUrl(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 rounded-lg pl-4 pr-10 py-3 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-mono text-sm shadow-inner"
                                    placeholder="https://your-tunnel.ngrok-free.app"
                                    required
                                />
                                <div className="absolute right-3 top-3 text-slate-400">
                                    <MoveIcon className="w-5 h-5 opacity-50" />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-2">
                                Paste the full HTTPS URL from your Ngrok terminal. We handle the rest.
                            </p>
                        </div>

                        {/* Performance Settings Toggle */}
                        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700">
                            <button 
                                type="button"
                                onClick={() => setShowSettings(!showSettings)}
                                className="w-full flex items-center justify-between p-3 text-sm font-medium text-slate-700 dark:text-slate-300"
                            >
                                <span className="flex items-center gap-2"><SettingsIcon className="w-4 h-4"/> Connection Settings</span>
                                <span className="text-xs text-indigo-500">{showSettings ? 'Hide' : 'Configure'}</span>
                            </button>
                            
                            {showSettings && (
                                <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700 space-y-4 animate-slide-up">
                                    <div className="grid grid-cols-2 gap-4 mt-3">
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Quality</label>
                                            <select 
                                                value={quality} 
                                                onChange={(e) => setQuality(e.target.value as QualitySetting)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="high">High (Clearer)</option>
                                                <option value="medium">Balanced</option>
                                                <option value="low">Low (Faster)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-slate-500 mb-1">Scaling</label>
                                            <select 
                                                value={scaleMode} 
                                                onChange={(e) => setScaleMode(e.target.value as any)}
                                                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded p-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                                            >
                                                <option value="scale">Fit Window</option>
                                                <option value="remote">Native Res</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="view-only" 
                                            checked={viewOnly} 
                                            onChange={(e) => setViewOnly(e.target.checked)}
                                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="view-only" className="text-sm text-slate-700 dark:text-slate-300">View Only Mode</label>
                                    </div>
                                </div>
                            )}
                        </div>

                        <button 
                            type="submit" 
                            disabled={isLoading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-lg shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 transform active:scale-95"
                        >
                            {isLoading ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Launch Session'}
                        </button>
                    </form>
                    
                    <button 
                        onClick={() => setShowHelp(!showHelp)}
                        className="mt-6 text-xs text-slate-500 hover:text-indigo-500 flex items-center justify-center gap-1 mx-auto transition-colors"
                    >
                        <InfoIcon className="w-3.5 h-3.5" />
                        {showHelp ? "Hide Guide" : "Connection Refused? Read Guide"}
                    </button>
                </div>

                {/* Help Panel */}
                {showHelp && (
                    <div className="md:w-80 bg-slate-100 dark:bg-slate-900/50 border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-700 p-6 overflow-y-auto animate-fade-in custom-scrollbar">
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-indigo-500 rounded-full"></span>
                            Setup Guide
                        </h3>
                        
                        <div className="space-y-6 text-xs text-slate-600 dark:text-slate-400">
                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900 dark:text-white">1. Start VNC & Websockify</h4>
                                <p>Run inside your Kali Terminal:</p>
                                <div className="bg-slate-900 text-green-400 p-2 rounded border border-slate-700 font-mono overflow-x-auto whitespace-nowrap">
                                    vncserver :1 -geometry 1280x720<br/>
                                    websockify -D --web=/usr/share/novnc 6080 0.0.0.0:5901
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="font-bold text-slate-900 dark:text-white">2. Start Ngrok Tunnel</h4>
                                <p>Expose port 6080 (HTTP) securely:</p>
                                <div className="bg-slate-900 text-green-400 p-2 rounded border border-slate-700 font-mono overflow-x-auto whitespace-nowrap">
                                    ngrok http 6080
                                </div>
                            </div>

                            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                                <h4 className="font-bold text-amber-700 dark:text-amber-400 mb-1">Crucial Step!</h4>
                                <p>Copy the <strong className="underline">HTTPS</strong> URL from Ngrok.</p>
                                <p className="mt-1">Example: <code className="bg-black/10 px-1 rounded">https://1a2b...ngrok-free.app</code></p>
                                <p className="mt-2 text-[10px] opacity-80">We auto-configure the port and path.</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default KaliPage;
