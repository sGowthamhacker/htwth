

import React from "react";

export type ThemeStyle = 'windows' | 'mac';
export type ThemeMode = 'light' | 'dark';
export type TimeFormat = '12hr' | '24hr';
export type Timezone = 'local' | 'IST' | 'UTC';

export interface User {
  id: string; // Firebase UID
  name: string;
  email: string;
  avatar: string;
  role: 'admin' | 'user';
  writeup_access: 'none' | 'read' | 'write';
  has_requested_writeup_access?: boolean;
  
  // Detailed profile
  bio?: string;
  gender?: 'Male' | 'Female' | 'Other';
  skills?: string[];
  is_profile_private?: boolean;
  
  // Social features
  friends?: string[]; // array of user emails
  friend_requests?: string[]; // array of user emails
  
  // Admin dashboard & verification flow
  status: 'unverified' | 'pending' | 'verified';
  created_at: string;
  verified_at?: string | null;
  admin_verified: boolean;
  doc_access?: boolean;
  welcome_email_sent?: boolean;
  is_2fa_enabled?: boolean;
  totp_secret?: string;
  backup_codes?: string[];
  
  // Preferences
  wallpaper?: string;
  desktop_preferences?: {
    iconPositions?: Record<string, { x: number; y: number }>;
    mobileIconPositions?: Record<string, { x: number; y: number }>;
    widgetState?: WidgetState;
    mobileWidgetState?: WidgetState;
    pinnedAppIds?: string[];
  };
}

export interface Note {
  id: string;
  user_id: string;
  content: string;
  color: string;
  created_at: string;
}

export interface WorkProfile {
  user_id: string;
  display_name?: string;
  bio?: string; // Short intro
  summary?: string; // Professional summary
  what_i_do?: string; // Description of services/focus (Legacy)
  services?: { // New structured services
    id: string;
    title: string;
    description: string;
  }[];
  avatar_url?: string;
  role_title?: string;
  skills?: string[];
  social_links?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
    whatsapp?: string;
    email?: string;
  };
  education?: {
    id: string;
    institution: string;
    degree: string;
    year: string;
    percentage?: string;
  }[];
  experience?: {
    id: string;
    company: string;
    role: string;
    duration: string;
    description?: string;
  }[];
  internships?: {
    id: string;
    company: string;
    role: string;
    duration: string;
    description?: string;
    imageUrl?: string;
  }[];
  projects?: {
    id: string;
    title: string;
    description: string;
    link?: string;
    tech?: string[];
  }[];
  achievements?: {
    id: string;
    title: string;
    description: string;
    year: string;
  }[];
  certifications?: {
    id: string;
    name: string;
    issuer: string;
    year: string;
    imageUrl?: string;
    link?: string;
  }[];
}

export interface Comment {
  id: string;
  author: User;
  text: string;
  created_at: string;
}

export type Severity = 'Low' | 'Medium' | 'High' | 'Critical';
export type RewardType = 'bounty' | 't-shirt' | 'gift';

export interface Post {
  id: string;
  type: 'writeup' | 'blog';
  title: string;
  author: User;
  content: string;
  created_at: string;
  comments: Comment[];
  tags: string[];
  severity?: Severity;
  liked_by: string[]; // array of user IDs
  reward?: RewardType;
}

export type Page = 'home' | 'writeup' | 'blog' | 'settings' | 'about' | 'login' | 'signup' | 'chat' | 'dashboard';

export interface ChatMessage {
  id: string;
  author: User;
  text: string;
  timestamp: string;
  created_at?: string;
  edited_timestamp?: string;
  reply_to?: {
    id: string;
    authorName: string;
    text: string;
  };
  status?: 'sent' | 'sending' | 'failed';
  reactions?: {
    [emoji: string]: string[]; // emoji: [userEmail1, userEmail2, ...]
  };
}

export interface ChatTurn {
  role: 'user' | 'model';
  text: string;
}

export interface AppDefinition {
  id: string;
  name:string;
  icon: React.ReactElement;
  component: React.ComponentType<any>;
  bgColorClass: string;
  accentColor: string;
}

export interface WindowInstance {
  id: string;
  appId: string;
  title: string;
  icon: React.ReactElement;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  preMaximizedState?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isClosing?: boolean;
  props?: Record<string, any>;
  initialBounds?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  refreshKey: number;
}

export interface WidgetState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type TaskbarPosition = 'top' | 'bottom' | 'left' | 'right';

export type DesktopIconSize = 'small' | 'medium' | 'large';

export interface Notification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  sourceType?: 'friend_request' | 'admin_message' | 'like_post' | 'comment_post' | 'writeup_access_request' | 'writeup_access_rejected' | 'contact_admin_request' | 'friend_request_accepted' | 'friend_request_rejected';
  duration?: number;
  isRead: boolean;
  timestamp: string;
  fromUser?: { email: string; name: string; avatar: string; role?: 'admin' | 'user'; }; // For friend requests
  actions?: { // For actionable notifications
    label: string;
    actionType: 'accept_friend_request' | 'reject_friend_request' | 'approve_writeup_access' | 'reject_writeup_access';
    type: 'primary' | 'secondary';
  }[];
  persist?: boolean;
  showToast?: boolean;
  targetId?: string;
  targetType?: 'writeup' | 'blog' | 'user';
}

export interface GlobalSettings {
  id?: string;
  isWelcomeAnimationEnabled: boolean;
  isMaintenanceMode: boolean;
  maintenanceMessage: string;
  maintenanceStartTime?: string | null; // ISO string
  maintenanceEndTime?: string | null; // ISO string
}

export interface GlobalNotification {
  id: string;
  to: string; // email of the recipient
  from: {
    email: string;
    name: string;
    avatar: string;
    role?: 'admin' | 'user';
  };
  type: 'friend_request' | 'admin_message' | 'like_post' | 'comment_post' | 'writeup_access_request' | 'writeup_access_rejected' | 'contact_admin_request' | 'friend_request_accepted' | 'friend_request_rejected';
  title?: string;
  message?: string;
  targetId?: string;
  targetType?: 'writeup' | 'blog' | 'user';
}

export interface ActivityLog {
  id: number;
  user: User;
  action: string;
  timestamp: string;
  target?: string;
}

export interface ContactRequest {
  id: string;
  created_at: string;
  name: string;
  email: string;
  message: string;
  handled: boolean;
}

export interface Payload {
  id: string;
  title: string;
  category: string;
  code: string;
  description?: string;
  is_visible: boolean;
  created_at?: string;
}
