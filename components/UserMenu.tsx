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
    top: 'md:fixed md:bottom-6 md:right-8 md:left-auto md:translate-x-0 md:top-auto md:mt-0',
    bottom: 'md:fixed md:bottom-20 md:right-8 md:left-auto md:translate-x-0 md:top-auto md:mb-0',
    left: 'md:fixed md:bottom-6 md:right-8 md:left-auto md:translate-x-0 md:top-auto md:ml-0',
    right: 'md:fixed md:bottom-6 md:right-8 md:left-auto md:translate-x-0 md:top-auto md:mr-0'
  };

  const mobilePositionClasses: Record<TaskbarPosition, string> = {
    top: 'fixed top-20 left-4',
    bottom: 'fixed bottom-20 left-4',
    left: 'fixed bottom-4 left-[76px]',
    right: 'fixed bottom-4 right-[76px] left-auto'
  };

  const macPositionClass = position === 'left' ? 'left-0' : 'right-0';
  const originClass = themeStyle === 'mac' 
    ? (position === 'left' ? 'origin-bottom-left' : 'origin-bottom-right') 
    : 'origin-bottom-left md:origin-bottom-right';
  
  const isMac = themeStyle === 'mac';

  return (
    <div className={`
      ${!isMac ? `${mobilePositionClasses[position]} ${desktopPositionClasses[position]} rounded-full flex-row max-w-[calc(100vw-92px)]` : `absolute bottom-full ${macPositionClass} mb-3 w-64 max-w-[calc(100vw-92px)] rounded-2xl bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/40 dark:border-white/10 shadow-2xl flex-col p-1.5`} 
      flex
      w-max max-w-[95vw]
      bg-white/90 dark:bg-slate-900/90 backdrop-blur-3xl 
      border border-slate-200/60 dark:border-slate-700/60 
      shadow-2xl shadow-slate-300/30 dark:shadow-black/50 
      z-[10001] items-center p-1.5 gap-2
      ${isClosing ? 'animate-slide-down-and-fade' : 'animate-slide-up'}
      ${originClass}
    `}>
      {/* Avatar & Info */}
      <div className={`flex ${isMac ? 'w-full gap-3 p-2.5 bg-white/40 dark:bg-black/20 rounded-xl mb-1' : 'items-center gap-2 pl-1'}`}>
        <div className="relative flex-shrink-0">
          <img 
            src={getCloudinaryUrl(user.avatar, { width: 40, height: 40, radius: 'max' })} 
            alt={user.name} 
            className={`${isMac ? 'w-10 h-10' : 'w-9 h-9'} rounded-full object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700`} 
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
        
        <div className="flex flex-col justify-center min-w-[70px]">
          <p className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate tracking-tight leading-tight">{user.name}</p>
          <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 capitalize leading-tight mt-0.5">{user.role}</p>
        </div>
      </div>

      {/* Divider */}
      {isMac && <div className="w-full h-0.5 bg-slate-200/50 dark:bg-slate-700/30 my-0.5"></div>}
      {!isMac && <div className="w-px h-6 bg-slate-200 dark:bg-slate-700/50 mx-0.5"></div>}

      {/* Actions */}
      <div className={`flex ${isMac ? 'w-full flex-col gap-0.5' : 'items-center gap-1 pr-1'}`}>
        <button onClick={onOpenSettings} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white ${isMac ? 'w-full' : ''}`} title="Settings">
          <SettingsIcon className="w-4 h-4" />
          {isMac && <span className="text-sm font-medium">Settings</span>}
        </button>
        <button onClick={onRestart} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-slate-200/50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white ${isMac ? 'w-full' : ''}`} title="Restart">
          <PowerIcon className="w-4 h-4" />
          {isMac && <span className="text-sm font-medium">Restart</span>}
        </button>
        <button onClick={onLogout} className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 group ${isMac ? 'w-full' : ''}`} title="Logout">
          <LogoutIcon className="w-4 h-4 transition-colors" />
          {isMac && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default UserMenu;