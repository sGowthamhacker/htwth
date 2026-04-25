import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useLocalStorage from '../hooks/useLocalStorage';
import { ThemeStyle, ThemeMode } from '../types';

export interface BackgroundCategory {
  id: string;
  name: string;
  cover: string;
  images: string[];
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
  triggerTransition: (action: () => void) => void;
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

const ThemeTransitionOverlay: React.FC<{ isVisible: boolean }> = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-auto"
        >
          <div className="absolute inset-0 flex flex-wrap pointer-events-auto">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: i % 2 === 0 ? '-100%' : '100%', 
                  y: i < 2 ? '-100%' : '100%',
                  opacity: 0 
                }}
                animate={{ x: 0, y: 0, opacity: 1 }}
                exit={{ 
                  x: i % 2 === 0 ? '-110%' : '110%', 
                  y: i < 2 ? '-110%' : '110%',
                  opacity: 0,
                  transition: { duration: 0.5, delay: i * 0.05 }
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 70,
                  damping: 18,
                  mass: 1.2,
                  delay: i * 0.08 
                }}
                className="bg-slate-900 border-[0.5px] border-white/10 absolute overflow-hidden shadow-2xl"
                style={{
                  width: '50.5%',
                  height: '50.5%',
                  top: i < 2 ? 0 : 'auto',
                  bottom: i >= 2 ? 0 : 'auto',
                  left: i % 2 === 0 ? 0 : 'auto',
                  right: i % 2 !== 0 ? 0 : 'auto',
                }}
              >
                 {/* Secondary edge trace line */}
                 <motion.div 
                   initial={{ opacity: 0 }}
                   animate={{ opacity: [0, 1, 0] }}
                   transition={{ repeat: Infinity, duration: 4, delay: i * 1 }}
                   className={`absolute ${i < 2 ? 'bottom-0' : 'top-0'} ${i % 2 === 0 ? 'right-0' : 'left-0'} ${i < 2 ? 'w-full h-px' : 'w-px h-full'} bg-indigo-500/20`}
                 />

                 <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px]"></div>
                 
                 {/* Internal shimmer scan */}
                 <motion.div 
                   animate={{ 
                     x: i % 2 === 0 ? ['-100%', '200%'] : ['100%', '-200%'],
                     opacity: [0, 0.3, 0]
                   }}
                   transition={{ repeat: Infinity, duration: 3, ease: "linear", delay: i * 0.5 }}
                   className="absolute top-0 bottom-0 w-64 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[25deg] blur-3xl"
                 />

                 {/* Corner Branding - Technical "Logo Pieces" that form a seal at the center */}
                  <div className={`absolute ${i < 2 ? 'bottom-0' : 'top-0'} ${i % 2 === 0 ? 'right-0' : 'left-0'} w-16 h-16 md:w-20 md:h-20 overflow-hidden pointer-events-none`}>
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ 
                        scale: isVisible ? 1.05 : 0.8, 
                        opacity: isVisible ? [0, 1, 1, 0] : 0,
                      }}
                      transition={{ 
                        opacity: { times: [0, 0.2, 0.8, 1], duration: 2.2, delay: 0.4 },
                        scale: { delay: 0.4, duration: 0.6, ease: "easeOut" }
                      }}
                      className="relative w-32 h-32 md:w-40 md:h-40"
                      style={{
                        left: i % 2 === 0 ? 0 : '-100%',
                        top: i < 2 ? 0 : '-100%'
                      }}
                    >
                      <img 
                        src="https://res.cloudinary.com/dlovm3y8x/image/upload/v1/llogo-removebg-preview_obh2ek.png" 
                        className="w-full h-full object-contain brightness-150" 
                        alt="" 
                        referrerPolicy="no-referrer"
                      />
                    </motion.div>
                  </div>
              </motion.div>
            ))}
          </div>

          {/* Central Logo/Glyph - Reveal after finish */}
          <motion.div
            initial={{ scale: 0.4, opacity: 0, filter: 'blur(10px)' }}
            animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ scale: 1.2, opacity: 0, filter: 'blur(20px)' }}
            transition={{ delay: 1.2, duration: 0.8, ease: "easeOut" }}
            className="relative z-10 flex flex-col items-center scale-90 md:scale-100"
          >
            <div className="relative w-40 h-40 md:w-48 md:h-48 flex items-center justify-center">
              {/* Central Impact Flare */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.8, 0], opacity: [0, 1, 0] }}
                transition={{ delay: 1.2, duration: 0.5 }}
                className="absolute inset-0 bg-indigo-500/30 rounded-full blur-3xl mix-blend-screen"
              />
              {/* Vertical Data Particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 60, opacity: 0, x: (i - 2.5) * 25 }}
                  animate={{ y: -60, opacity: [0, 1, 0] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 1.5 + Math.random(), 
                    delay: i * 0.2,
                    ease: "linear"
                  }}
                  className="absolute w-0.5 h-8 bg-gradient-to-t from-transparent via-indigo-500/50 to-transparent rounded-full"
                />
              ))}

              {/* Ambient Energy cloud */}
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute inset-[-40px] bg-indigo-500/10 blur-[80px] rounded-full"
              />
              
              {/* Prism Diamonds */}
              <div className="relative">
                 {/* Outer Prism Layer */}
                 <motion.div 
                   animate={{ rotate: 45, scale: [1, 1.05, 1] }}
                   transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                   className="w-32 h-32 border border-white/10 rotate-45 backdrop-blur-xl bg-white/5 rounded-xl shadow-2xl"
                 />
                 
                 {/* Middle Prism Layer */}
                 <motion.div 
                   animate={{ rotate: -45, scale: [1, 1.1, 1] }}
                   transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                   className="absolute inset-4 border border-white/20 -rotate-45 backdrop-blur-3xl bg-indigo-500/10 rounded-lg shadow-xl"
                 />

                                   {/* Core Prism */}
                  <motion.div 
                    className="absolute inset-4 flex items-center justify-center"
                  >
                    <div className="w-24 h-24 rounded-2xl bg-slate-900/40 backdrop-blur-xl flex items-center justify-center shadow-[0_0_50px_rgba(99,102,241,0.4)] border border-white/10 overflow-hidden">
                      <img 
                        src="https://res.cloudinary.com/dlovm3y8x/image/upload/v1/llogo-removebg-preview_obh2ek.png" 
                        className="w-16 h-16 object-contain" 
                        alt="Logo" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </motion.div>
              </div>
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
  const [appliedThemeStyle, setAppliedThemeStyle] = useState(themeStyle);
  const [appliedThemeMode, setAppliedThemeMode] = useState(themeMode);

  const triggerTransition = (action: () => void) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      action();
      setTimeout(() => setIsTransitioning(false), 1300);
    }, 1300);
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
    });
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
    });
  };

  const setSelectedBackground = (bg: string, silent: boolean = false) => {
    if (silent) {
      _setSelectedBackground(bg);
      return;
    }
    triggerTransition(() => _setSelectedBackground(bg));
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

  return (
    <ThemeContext.Provider value={{
      themeStyle, setThemeStyle,
      themeMode, setThemeMode,
      selectedBackground, setSelectedBackground,
      backgroundCategories: BACKGROUND_CATEGORIES,
      selectedFont, setSelectedFont,
      isTransitioning,
      triggerTransition,
    }}>
      {children}
      <ThemeTransitionOverlay isVisible={isTransitioning} />
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
