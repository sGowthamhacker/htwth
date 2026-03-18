import React, { createContext, useContext, useState, ReactNode } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { TimeFormat, Timezone } from '../types';

interface TimeContextType {
  timeFormat: TimeFormat;
  setTimeFormat: (format: TimeFormat) => void;
  visibleTimezones: Timezone[];
  setVisibleTimezones: (timezones: Timezone[] | ((val: Timezone[]) => Timezone[])) => void;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

export const TimeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeFormat, setTimeFormat] = useLocalStorage<TimeFormat>('timeFormat', '12hr');
  const [visibleTimezones, setVisibleTimezones] = useLocalStorage<Timezone[]>('visibleTimezones', ['local']);

  return (
    <TimeContext.Provider value={{ timeFormat, setTimeFormat, visibleTimezones, setVisibleTimezones }}>
      {children}
    </TimeContext.Provider>
  );
};

export const useTime = (): TimeContextType => {
  const context = useContext(TimeContext);
  if (context === undefined) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
};
