import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Blob as GenAI_Blob } from '@google/genai';
import { decode, encode, decodeAudioData } from '../utils/audioUtils';
import SpinnerIcon from '../components/icons/SpinnerIcon';
import LiveIcon from '../components/icons/LiveIcon';
import { useNotificationState } from '../contexts/NotificationContext';

const getApiKey = (): string => {
    if (typeof window !== 'undefined' && (window as any).process?.env?.API_KEY) {
        return (window as any).process.env.API_KEY;
    }
    return "YOUR_API_KEY_HERE";
};

const LivePage: React.FC<{onClose?: () => void}> = ({ onClose = () => {} }) => {
    const [status, setStatus] = useState<'idle' | 'connecting' | 'connected' | 'error' | 'disconnected'>('idle');
    const [isMuted, setIsMuted] = useState(false);
    
    const sessionPromiseRef = useRef<Promise<any> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const outputAudioContextRef = useRef<AudioContext | null>(null);
    const nextStartTimeRef = useRef<number>(0);
    const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
    
    const { addNotification } = useNotificationState();

    // FIX: Use a ref to track the latest isMuted state to avoid stale closures in callbacks.
    const isMutedRef = useRef(isMuted);
    useEffect(() => {
        isMutedRef.current = isMuted;
    }, [isMuted]);

    const stopConversation = useCallback(() => {
        sessionPromiseRef.current?.then(session => session.close());
        scriptProcessorRef.current?.disconnect();
        mediaStreamSourceRef.current?.disconnect();
        audioContextRef.current?.close().catch(() => {}); // Safely close context
        outputAudioContextRef.current?.close().catch(() => {}); // Safely close context
        
        sessionPromiseRef.current = null;
        // The onclose callback will handle setting the status to 'disconnected'.
    }, []);

    const startConversation = async () => {
        setStatus('connecting');
        try {
            const apiKey = getApiKey();
            if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
                setStatus('error');
                addNotification({ title: 'API Key Missing', message: 'Live Conversation requires a configured API key to function.', type: 'error' });
                return;
            }

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            
            const ai = new GoogleGenAI({ apiKey });
            
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

            sessionPromiseRef.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        setStatus('connected');
                        addNotification({ title: 'Live Connection', message: 'You are now connected to Sparky.', type: 'success' });
                        
                        mediaStreamSourceRef.current = audioContextRef.current!.createMediaStreamSource(stream);
                        scriptProcessorRef.current = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                        
                        scriptProcessorRef.current.onaudioprocess = (audioProcessingEvent) => {
                            // FIX: Use the ref here to get the latest value of isMuted.
                            if (isMutedRef.current) return;
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            sessionPromiseRef.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        };
                        
                        mediaStreamSourceRef.current.connect(scriptProcessorRef.current);
                        scriptProcessorRef.current.connect(audioContextRef.current!.destination);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                        if (base64Audio) {
                            const outputCtx = outputAudioContextRef.current!;
                            nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
                            const source = outputCtx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(outputCtx.destination);
                            source.addEventListener('ended', () => sourcesRef.current.delete(source));
                            source.start(nextStartTimeRef.current);
                            nextStartTimeRef.current += audioBuffer.duration;
                            sourcesRef.current.add(source);
                        }
                        if (message.serverContent?.interrupted) {
                            for (const source of sourcesRef.current.values()) {
                                source.stop();
                                sourcesRef.current.delete(source);
                            }
                            nextStartTimeRef.current = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live connection error:', e);
                        setStatus('error');
                        addNotification({ title: 'Live Connection Error', message: 'Something went wrong.', type: 'error' });
                        stopConversation();
                    },
                    onclose: () => {
                        setStatus('disconnected');
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
                },
            });
        } catch (err) {
            console.error('Failed to start conversation:', err);
            setStatus('error');
            addNotification({ title: 'Microphone Error', message: 'Could not access the microphone.', type: 'error' });
        }
    };
    
    const createBlob = (data: Float32Array): GenAI_Blob => {
        const int16 = new Int16Array(data.length);
        for (let i = 0; i < data.length; i++) {
            int16[i] = data[i] * 32768;
        }
        return { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
    };

    // FIX: This useEffect now correctly cleans up the connection only when the component unmounts.
    useEffect(() => {
        return () => {
            // Cleanup on component unmount
            stopConversation();
        };
    }, [stopConversation]);
    
    const renderContent = () => {
        switch (status) {
            case 'idle':
            case 'disconnected':
                return (
                    <div className="text-center">
                        <h2 className="text-xl font-bold mb-2">Live Conversation</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Speak directly with Sparky AI in real-time.</p>
                        <button onClick={startConversation} className="bg-gradient-to-r from-rose-500 to-red-500 text-white font-bold py-3 px-6 rounded-full shadow-lg hover:opacity-90 transition-opacity">
                            Start Conversation
                        </button>
                    </div>
                );
            case 'connecting':
                return (
                    <div className="text-center">
                        <SpinnerIcon className="w-12 h-12 mx-auto mb-4" />
                        <h2 className="text-xl font-bold">Connecting...</h2>
                        <p className="text-slate-500 dark:text-slate-400">Please allow microphone access.</p>
                    </div>
                );
            case 'connected':
                return (
                     <div className="text-center flex flex-col items-center justify-center h-full">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                           <div className="absolute inset-0 bg-green-500 rounded-full animate-ping"></div>
                           <div className="relative bg-green-500/50 rounded-full w-24 h-24 flex items-center justify-center">
                               <LiveIcon className="w-12 h-12 text-white" />
                           </div>
                        </div>
                        <h2 className="text-2xl font-bold mt-6">Connected</h2>
                        <p className="text-slate-500 dark:text-slate-400">You are live with Sparky AI.</p>
                        <div className="mt-8 flex gap-4">
                            <button onClick={() => setIsMuted(!isMuted)} className={`font-medium py-2 px-5 rounded-full ${isMuted ? 'bg-yellow-500 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}>
                                {isMuted ? 'Unmute' : 'Mute'}
                            </button>
                             <button onClick={stopConversation} className="bg-red-500 text-white font-medium py-2 px-5 rounded-full">
                                End Call
                            </button>
                        </div>
                    </div>
                );
            case 'error':
                 return (
                    <div className="text-center">
                        <h2 className="text-xl font-bold text-red-500 mb-2">Connection Failed</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-6">Could not start the conversation. Please check your microphone permissions and try again.</p>
                        <button onClick={startConversation} className="bg-indigo-600 text-white font-bold py-3 px-6 rounded-full">
                            Try Again
                        </button>
                    </div>
                );
        }
    }

    return (
        <div className="h-full w-full flex items-center justify-center p-8 bg-slate-50 dark:bg-slate-900">
           {renderContent()}
        </div>
    );
};

export default LivePage;