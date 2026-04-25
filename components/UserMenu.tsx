import React from 'react';
import { User, TaskbarPosition, ThemeStyle } from '../types';
import LogoutIcon from './icons/LogoutIcon';
import SettingsIcon from './icons/SettingsIcon';
import PowerIcon from './icons/PowerIcon';
import { getCloudinaryUrl } from '../utils/imageService';

interface UserMenuProps {
  user: User;
  onLogout: () => void;
  onRestart: () => void;
  onOpenSettings: (e: React.MouseEvent<HTMLButtonElement>) => void;
  position: TaskbarPosition;
  isClosing: boolean;
  themeStyle?: ThemeStyle;
  macStyle?: React.CSSProperties;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onLogout, onRestart, onOpenSettings, position, isClosing, themeStyle }) => {
  const desktopPositionClasses: Record<TaskbarPosition, string> = {
    top: 'sm:fixed sm:bottom-6 sm:right-8 sm:left-auto sm:translate-x-0 sm:top-auto sm:mt-0',
    bottom: 'sm:fixed sm:bottom-20 sm:right-8 sm:left-auto sm:translate-x-0 sm:top-auto sm:mb-0',
    left: 'sm:fixed sm:bottom-6 sm:right-8 sm:left-auto sm:translate-x-0 sm:top-auto sm:ml-0',
    right: 'sm:fixed sm:bottom-6 sm:right-8 sm:left-auto sm:translate-x-0 sm:top-auto sm:mr-0'
  };

  const mobilePositionClasses: Record<TaskbarPosition, string> = {
    top: 'fixed bottom-4 left-16',
    bottom: 'fixed bottom-4 left-16',
    left: 'fixed bottom-4 left-16',
    right: 'fixed bottom-4 left-16'
  };

  const originClass = themeStyle === 'mac' ? 'origin-bottom-right' : 'origin-bottom-left sm:origin-bottom-right';
  
  return (
    <div className={`
      ${themeStyle !== 'mac' ? `${mobilePositionClasses[position]} ${desktopPositionClasses[position]}` : 'relative'} 
      w-max max-w-[95vw]
      bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl 
      border border-slate-200/60 dark:border-slate-700/60 
      rounded-full shadow-2xl shadow-slate-300/30 dark:shadow-black/50 
      z-[10001] flex flex-row items-center p-1.5 gap-2
      ${isClosing ? 'animate-slide-down-and-fade' : 'animate-slide-up'}
      ${originClass}
    `}>
      {/* Avatar */}
      <div className="relative flex-shrink-0 pl-1">
        <img 
          src={getCloudinaryUrl(user.avatar, { width: 40, height: 40, radius: 'max' })} 
          alt={user.name} 
          className="w-9 h-9 rounded-full object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700" 
        />
        {user.role === 'admin' && (
          <div className="absolute -bottom-0.5 -right-0.5 bg-white dark:bg-slate-800 rounded-full p-[1px] shadow-sm border border-slate-100 dark:border-slate-700">
            <img 
              src={getCloudinaryUrl("https://gowthamsportfolio.netlify.app/assets/img/tick.gif", { width: 10, height: 10 })} 
              alt="Admin verified" 
              className="w-2.5 h-2.5" 
            />
          </div>
        )}
      </div>
      
      {/* Name & Role */}
      <div className="flex flex-col justify-center min-w-[70px] max-w-[120px]">
        <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate tracking-tight leading-tight">{user.name}</p>
        <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize leading-tight mt-0.5">{user.role}</p>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-0.5"></div>

      {/* Actions */}
      <div className="flex items-center gap-1 pr-1">
        <button onClick={onOpenSettings} className="p-2 rounded-full transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white" title="Settings">
          <SettingsIcon className="w-4 h-4" />
        </button>
        <button onClick={onRestart} className="p-2 rounded-full transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white" title="Restart">
          <PowerIcon className="w-4 h-4" />
        </button>
        <button onClick={onLogout} className="p-2 rounded-full transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 group" title="Logout">
          <LogoutIcon className="w-4 h-4 transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default UserMenu;