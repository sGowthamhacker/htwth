import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ThemeStyle, ThemeMode } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';

export interface BackgroundCategory {
  name: string;
  cover: string;
  images: string[];
}

export const BACKGROUND_CATEGORIES: BackgroundCategory[] = [
  {
    name: 'Vibrant Fluids',
    cover: 'https://images.unsplash.com/photo-1620421680010-0766ff230392?q=80&w=2070&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1604079628040-94301bb21b91?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614850523011-8f49ffc73908?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1557682250-33bd709cbe85?q=80&w=2070&auto=format&fit=crop',
    ],
  },
  {
    name: 'Architectural Lines',
    cover: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1487958449943-2429e8be8625?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1628744448842-13a1b0a8848a?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=2070&auto=format&fit=crop',
    ],
  },
   {
    name: 'Serene Nature',
    cover: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2174&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1501854140801-50d01698950b?q=80&w=2175&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1433086966358-54859d0ed716?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?q=80&w=2072&auto=format&fit=crop',
    ],
  },
  {
    name: 'Cyber Tech',
    cover: 'https://images.unsplash.com/photo-1550745165-9bc0b252726a?q=80&w=2070&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1580927752452-89d86da3fa0a?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1504639725590-34d0984388bd?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1605379399642-870262d3d051?q=80&w=2106&auto=format&fit=crop',
    ],
  },
  {
    name: 'Cosmic Wonders',
    cover: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=2127&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1538351588239-16f5eee58509?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=2070&auto=format&fit=crop',
    ],
  },
  {
    name: 'Abstract Geometry',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?q=80&w=1887&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1533228100845-0814fca7a000?q=80&w=2070&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1608501078713-33809318413a?q=80&w=1974&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1596704017258-c9183c16fb29?q=80&w=1974&auto=format&fit=crop',
    ],
  },
];

export const ALL_BACKGROUND_IMAGES: string[] = BACKGROUND_CATEGORIES.flatMap(cat => cat.images);

interface ThemeContextType {
  themeStyle: ThemeStyle;
  themeMode: ThemeMode;
  setThemeStyle: (style: ThemeStyle) => void;
  setThemeMode: (mode: ThemeMode) => void;
  selectedBackground: string;
  setSelectedBackground: (url: string) => void;
  backgroundCategories: BackgroundCategory[];
  selectedFont: string;
  setSelectedFont: (font: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeStyle, setThemeStyle] = useLocalStorage<ThemeStyle>('themeStyle', 'windows');

  const [themeMode, setThemeMode] = useLocalStorage<ThemeMode>('themeMode', () => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });
  
  const [selectedBackground, setSelectedBackground] = useLocalStorage<string>('selectedBackground', ALL_BACKGROUND_IMAGES[0]);
  const [selectedFont, setSelectedFont] = useLocalStorage<string>('selectedFont', 'Inter');

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove('windows', 'mac');
    root.classList.add(themeStyle);

    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Apply the selected font using a CSS variable
    root.style.setProperty('--font-sans', selectedFont);

  }, [themeStyle, themeMode, selectedBackground, selectedFont]);

  return (
    <ThemeContext.Provider value={{
      themeStyle, setThemeStyle,
      themeMode, setThemeMode,
      selectedBackground, setSelectedBackground,
      backgroundCategories: BACKGROUND_CATEGORIES,
      selectedFont, setSelectedFont,
    }}>
      {children}
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