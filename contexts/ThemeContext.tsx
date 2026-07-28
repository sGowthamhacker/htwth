import React, { createContext, useContext, ReactNode, useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import useLocalStorage from '../hooks/useLocalStorage';
import { ThemeStyle, ThemeMode } from '../types';

export interface BackgroundCategory {
  id: string;
  name: string;
  cover: string;
  images: string[];
}

export interface ThemeAnimationInfo {
  themeKey: string;
  themeStyle: ThemeStyle;
  themeMode: ThemeMode;
  isTransitioning: boolean;
  animationClass: string;
}

export interface ThemeContextType {
  themeStyle: ThemeStyle;
  setThemeStyle: (style: ThemeStyle, silent?: boolean) => void;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode, silent?: boolean) => void;
  selectedBackground: string;
  setSelectedBackground: (bg: string, silent?: boolean) => void;
  backgroundCategories: BackgroundCategory[];
  selectedFont: string;
  setSelectedFont: (font: string) => void;
  isTransitioning: boolean;
  triggerTransition: (action: () => void, type?: 'os' | 'theme') => void;
  themeKey: string;
  animationClass: string;
}

const BACKGROUND_CATEGORIES: BackgroundCategory[] = [
  {
    id: 'abstract',
    name: 'Abstract',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614850523296-d8c1af93d400?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=2629&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop',
    ]
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1515515325870-07bf1d34199f?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1534972195531-d756b9bfa9f2?q=80&w=2670&auto=format&fit=crop',
    ]
  },
  {
    id: 'nature',
    name: 'Nature',
    cover: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2675&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2674&auto=format&fit=crop',
    ]
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    cover: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2667&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=2667&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1487017664838-7bc91ef3d3cc?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1518640.webp?q=80&w=2670&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=2674&auto=format&fit=crop',
    ]
  },
  {
    id: 'scifi',
    name: 'Sci-Fi',
    cover: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2672&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2672&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1541873676-a1818975766b?q=80&w=2674&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?q=80&w=2672&auto=format&fit=crop',
    ]
  }
];

const ALL_BACKGROUND_IMAGES = BACKGROUND_CATEGORIES.flatMap(c => c.images);

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeTransitionOverlay: React.FC<{ 
  isVisible: boolean; 
  type?: 'os' | 'theme'; 
  mode?: ThemeMode; 
  style?: ThemeStyle;
}> = ({ isVisible, type = 'os', mode = 'dark', style = 'windows' }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState(type === 'theme' ? 'UPDATING THEME SETTINGS' : 'CALIBRATING ENVIRONMENT');
  const [step, setStep] = useState(1);

  // Lock target theme parameters on animation start so colors stay 100% stable during transition
  const [lockedTheme, setLockedTheme] = useState<{ mode: ThemeMode; style: ThemeStyle }>({ mode, style });

  // Memoize sparks parameters so random values are never recomputed during interval progress updates
  const sparks = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((idx) => ({
      id: idx,
      xOffset: ((idx * 37) % 100) - 50,
      scale: 0.6 + ((idx * 17) % 40) / 100,
      duration: 2.2 + ((idx * 13) % 12) / 10,
      delay: idx * 0.3,
      left: `${15 + idx * 14}%`,
    }));
  }, []);

  useEffect(() => {
    if (isVisible) {
      setLockedTheme({ mode, style });
      setProgress(0);
      setStep(1);
      setStatusText(type === 'theme' ? 'UPDATING THEME SETTINGS' : 'CALIBRATING ENVIRONMENT');

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) return 100;
          const next = prev + 3;
          if (next > 35 && next < 75) {
            setStep(2);
            setStatusText(type === 'theme' ? 'APPLYING COLOR PALETTE' : 'SYNCHRONIZING OS ENGINE');
          } else if (next >= 75) {
            setStep(3);
            setStatusText(type === 'theme' ? 'FINALIZING THEME' : 'OPTIMIZING WORKSPACE');
          }
          return next;
        });
      }, 40);

      return () => clearInterval(interval);
    }
  }, [isVisible]);

  const activeMode = lockedTheme.mode;
  const activeStyle = lockedTheme.style;
  const isLight = activeMode === 'light';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center pointer-events-auto select-none overflow-hidden transform-gpu"
        >
          {/* Shutter Glass Panels with Solid High-Tech Grid */}
          <div className="absolute inset-0 flex flex-wrap pointer-events-none transform-gpu">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: i % 2 === 0 ? '-100%' : '100%', 
                  y: i < 2 ? '-100%' : '100%',
                  opacity: 0 
                }}
                animate={{ x: 0, y: 0, opacity: 0.98 }}
                exit={{ 
                  x: i % 2 === 0 ? '-100%' : '100%', 
                  y: i < 2 ? '-100%' : '100%',
                  opacity: 0,
                  transition: { duration: 0.35, ease: "easeInOut" }
                }}
                transition={{ 
                  duration: 0.4,
                  ease: [0.16, 1, 0.3, 1],
                  delay: i * 0.02
                }}
                className={`absolute overflow-hidden backdrop-blur-xl transform-gpu will-change-transform ${
                  isLight 
                    ? 'bg-slate-100/98 border-[0.5px] border-slate-300/60 shadow-xl' 
                    : 'bg-slate-950/98 border-[0.5px] border-white/10 shadow-2xl'
                }`}
                style={{
                  width: '50.5%',
                  height: '50.5%',
                  top: i < 2 ? 0 : 'auto',
                  bottom: i >= 2 ? 0 : 'auto',
                  left: i % 2 === 0 ? 0 : 'auto',
                  right: i % 2 !== 0 ? 0 : 'auto',
                }}
              >
                {/* Tech Grid Lines */}
                <div className={`absolute inset-0 [background-size:20px_20px] ${
                  isLight 
                    ? 'opacity-[0.08] bg-[radial-gradient(#4f46e5_1px,transparent_1px)]' 
                    : 'opacity-[0.06] bg-[radial-gradient(#6366f1_1px,transparent_1px)]'
                }`} />
                
                {/* Shimmer Light Beams */}
                <motion.div 
                  animate={{ 
                    x: ['-100%', '200%'],
                    opacity: [0, 0.35, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: "linear", delay: i * 0.4 }}
                  className={`absolute top-0 bottom-0 w-64 bg-gradient-to-r from-transparent skew-x-[35deg] blur-xl transform-gpu ${
                    isLight ? 'via-indigo-500/30 to-transparent' : 'via-cyan-400/20 to-transparent'
                  }`}
                />
              </motion.div>
            ))}
          </div>

          {/* Floating Atmospheric Ambient Sparks */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden transform-gpu">
            {sparks.map((spark) => (
              <motion.div
                key={spark.id}
                initial={{ 
                  x: `${spark.xOffset}%`, 
                  y: '110%', 
                  scale: spark.scale,
                  opacity: 0 
                }}
                animate={{ 
                  y: '-10%', 
                  opacity: [0, 0.7, 0] 
                }}
                transition={{ 
                  duration: spark.duration, 
                  repeat: Infinity, 
                  delay: spark.delay,
                  ease: "easeOut"
                }}
                className={`absolute w-2 h-2 rounded-full transform-gpu ${
                  isLight 
                    ? 'bg-indigo-600 shadow-[0_0_10px_#6366f1]' 
                    : 'bg-cyan-400 shadow-[0_0_10px_#38bdf8]'
                }`}
                style={{ left: spark.left }}
              />
            ))}
          </div>

          {/* Central Holographic HUD Card */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: -16 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`relative z-10 flex flex-col items-center w-88 max-w-[90vw] px-7 py-8 rounded-3xl backdrop-blur-xl transform-gpu will-change-transform overflow-hidden ${
              isLight
                ? 'bg-white/95 border border-slate-200/90 shadow-[0_20px_60px_rgba(0,0,0,0.12)] text-slate-800'
                : 'bg-slate-900/92 border border-white/15 shadow-[0_0_80px_rgba(0,0,0,0.85)] text-slate-100'
            }`}
          >
            {/* Top Right & Bottom Left HUD Bracket Accents */}
            <div className={`absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm ${
              isLight ? 'border-indigo-600/60' : 'border-cyan-400/60'
            }`} />
            <div className={`absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 rounded-bl-sm ${
              isLight ? 'border-violet-500/60' : 'border-indigo-400/60'
            }`} />

            {/* Ambient Multi-layer Backlight Glow */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.35, 0.65, 0.35] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className={`absolute -inset-6 rounded-full blur-3xl -z-10 ${
                isLight 
                  ? 'bg-gradient-to-r from-indigo-400/25 via-sky-400/20 to-purple-400/25' 
                  : 'bg-gradient-to-r from-indigo-500/25 via-sky-500/20 to-purple-500/25'
              }`}
            />

            {/* Top Pill Badge */}
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-mono font-medium tracking-wider uppercase mb-5 ${
              isLight 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700' 
                : 'bg-slate-800/80 border-white/10 text-indigo-300'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {type === 'theme' ? 'THEME RECONFIGURATION' : `${activeStyle.toUpperCase()} OS RECONFIGURATION`}
            </div>

            {/* Logo Ring Badge with Dual Counter-Rotating Rings */}
            <div className="relative mb-6 flex items-center justify-center w-24 h-24">
              {/* Outer Counter-Clockwise Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
                className={`absolute inset-0 rounded-full border border-dashed ${
                  isLight ? 'border-indigo-400/40' : 'border-cyan-400/40'
                }`}
              />
              {/* Inner Clockwise Glowing Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "linear" }}
                className={`absolute inset-1 rounded-2xl border-2 border-b-transparent ${
                  isLight 
                    ? 'border-indigo-300/60 border-t-indigo-600 border-r-violet-500' 
                    : 'border-indigo-500/50 border-t-indigo-400 border-r-cyan-400'
                }`}
              />
              {/* Center Logo Emblem Box */}
              <div className={`w-16 h-16 rounded-2xl border flex items-center justify-center ${
                isLight 
                  ? 'bg-white border-slate-200 shadow-[0_0_25px_rgba(79,70,229,0.2)]' 
                  : 'bg-slate-950/90 border-white/20 shadow-[0_0_30px_rgba(99,102,241,0.5)]'
              }`}>
                <img 
                  src="https://res.cloudinary.com/dlovm3y8x/image/upload/v1/llogo-removebg-preview_obh2ek.png" 
                  className="w-10 h-10 object-contain drop-shadow-[0_0_12px_rgba(99,102,241,0.5)]" 
                  alt="Logo" 
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>

            {/* Step Indicators */}
            <div className="flex items-center gap-2 mb-3">
              {[1, 2, 3].map((s) => (
                <div 
                  key={s} 
                  className={`h-1 rounded-full transition-all duration-300 ${
                    s === step 
                      ? isLight ? 'w-6 bg-indigo-600 shadow-[0_0_8px_rgba(79,70,229,0.5)]' : 'w-6 bg-cyan-400 shadow-[0_0_8px_#38bdf8]' 
                      : s < step 
                        ? isLight ? 'w-2 bg-violet-500' : 'w-2 bg-indigo-500' 
                        : isLight ? 'w-2 bg-slate-200' : 'w-2 bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Dynamic Status Text */}
            <motion.p 
              key={statusText}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-xs font-mono font-semibold tracking-wider text-center mb-4 h-5 ${
                isLight ? 'text-slate-800' : 'text-slate-200'
              }`}
            >
              {statusText}
            </motion.p>

            {/* Futuristic Progress Bar */}
            <div className={`w-full h-2.5 rounded-full overflow-hidden border relative p-0.5 ${
              isLight ? 'bg-slate-100 border-slate-200/80' : 'bg-slate-950/90 border-white/10'
            }`}>
              <motion.div 
                className={`h-full rounded-full transition-all duration-75 relative ${
                  isLight 
                    ? 'bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600 shadow-[0_0_12px_rgba(79,70,229,0.5)]' 
                    : 'bg-gradient-to-r from-indigo-500 via-cyan-400 to-indigo-400 shadow-[0_0_14px_rgba(56,189,248,0.9)]'
                }`}
                style={{ width: `${progress}%` }}
              >
                {/* Laser Streak Tip */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full shadow-[0_0_8px_#ffffff]" />
              </motion.div>
            </div>

            {/* Percentage & System Code */}
            <div className="w-full flex items-center justify-between mt-3 text-[11px] font-mono">
              <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>SYS_BUILD_2026</span>
              <span className={isLight ? 'font-bold text-indigo-600' : 'font-bold text-cyan-300'}>{progress}%</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeStyle, _setThemeStyle] = useLocalStorage<ThemeStyle>('themeStyle', 'windows');
  const [themeMode, _setThemeMode] = useLocalStorage<ThemeMode>('themeMode', () => {
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionType, setTransitionType] = useState<'os' | 'theme'>('os');
  const [appliedThemeStyle, setAppliedThemeStyle] = useState(themeStyle);
  const [appliedThemeMode, setAppliedThemeMode] = useState(themeMode);
  const [transitionTarget, setTransitionTarget] = useState<{ mode: ThemeMode; style: ThemeStyle }>({
    mode: themeMode,
    style: themeStyle,
  });

  const triggerTransition = (
    action: () => void, 
    type: 'os' | 'theme' = 'os',
    targetMode: ThemeMode = appliedThemeMode,
    targetStyle: ThemeStyle = appliedThemeStyle
  ) => {
    setTransitionType(type);
    setTransitionTarget({ mode: targetMode, style: targetStyle });
    setIsTransitioning(true);

    if (typeof window !== 'undefined') {
      window.document.documentElement.classList.add('theme-transitioning');
    }

    setTimeout(() => {
      action();
    }, 900);

    setTimeout(() => {
      setIsTransitioning(false);
      if (typeof window !== 'undefined') {
        window.document.documentElement.classList.remove('theme-transitioning');
      }
    }, 2800);
  };

  const setThemeStyle = (style: ThemeStyle, silent: boolean = false) => {
    if (style === themeStyle || isTransitioning) return;
    
    if (silent) {
      _setThemeStyle(style);
      setAppliedThemeStyle(style);
      return;
    }

    triggerTransition(() => {
      _setThemeStyle(style);
      setAppliedThemeStyle(style); 
    }, 'os', appliedThemeMode, style);
  };

  const setThemeMode = (mode: ThemeMode, silent: boolean = false) => {
    if (mode === themeMode || isTransitioning) return;

    if (silent) {
      _setThemeMode(mode);
      setAppliedThemeMode(mode);
      return;
    }

    triggerTransition(() => {
      _setThemeMode(mode);
      setAppliedThemeMode(mode);
    }, 'theme', mode, appliedThemeStyle);
  };

  const setSelectedBackground = (bg: string, silent: boolean = false) => {
    if (silent) {
      _setSelectedBackground(bg);
      return;
    }
    triggerTransition(() => _setSelectedBackground(bg), 'theme', appliedThemeMode, appliedThemeStyle);
  };
  
  const [selectedBackground, _setSelectedBackground] = useLocalStorage<string>('selectedBackground', ALL_BACKGROUND_IMAGES[0] || '');
  const [selectedFont, setSelectedFont] = useLocalStorage<string>('selectedFont', 'Inter');

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('windows', 'mac');
    root.classList.add(appliedThemeStyle);

    if (appliedThemeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    root.style.setProperty('--font-sans', selectedFont);

  }, [appliedThemeStyle, appliedThemeMode, selectedBackground, selectedFont]);

  const themeKey = `${appliedThemeStyle}-${appliedThemeMode}-${isTransitioning ? 'animating' : 'stable'}`;
  const animationClass = isTransitioning 
    ? `theme-transitioning theme-${appliedThemeStyle}-${appliedThemeMode}` 
    : `theme-stable theme-${appliedThemeStyle}-${appliedThemeMode}`;

  return (
    <ThemeContext.Provider value={{
      themeStyle, setThemeStyle,
      themeMode, setThemeMode,
      selectedBackground, setSelectedBackground,
      backgroundCategories: BACKGROUND_CATEGORIES,
      selectedFont, setSelectedFont,
      isTransitioning,
      triggerTransition,
      themeKey,
      animationClass,
    }}>
      {children}
      <ThemeTransitionOverlay isVisible={isTransitioning} type={transitionType} mode={transitionTarget.mode} style={transitionTarget.style} />
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const useThemeAnimation = (): ThemeAnimationInfo => {
  const context = useTheme();
  return {
    themeKey: context.themeKey,
    themeStyle: context.themeStyle,
    themeMode: context.themeMode,
    isTransitioning: context.isTransitioning,
    animationClass: context.animationClass,
  };
};
