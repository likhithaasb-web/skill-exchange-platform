export type ThemeMode = 'dark' | 'light' | 'system';
export type AccentColor = 'gold' | 'blue' | 'green' | 'purple';
export type InterfaceDensity = 'compact' | 'comfortable' | 'spacious';
export type MotionPreference = 'full' | 'reduced';

export type SkillLevel = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced' | 'Expert';
export type VerificationStatus = 'Self-Declared' | 'Peer-Verified' | 'Project-Demonstrated';

export interface AvatarData {
  category: 'cute' | 'professional' | 'technical' | 'nature' | 'creative' | 'custom';
  id: string;
  customUrl?: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  displayName: string;
  avatar: AvatarData;
  bio?: string;
  tagline?: string;
  location?: string;
  languages?: string[];
  onboardingCompleted: boolean;
  onboardingAnswers?: {
    q1SkillWish?: string;
    q2BiggestChallenge?: string;
    q3BestProject?: string;
    q4LearningHelper?: string;
    q5Aspiration?: string;
  };
  appearanceSettings: {
    theme: ThemeMode;
    accent: AccentColor;
    density: InterfaceDensity;
    motion: MotionPreference;
  };
  privacySettings: {
    profileVisibility: 'public' | 'members' | 'private';
    skillVisibility: 'public' | 'connections' | 'private';
    reviewVisibility: 'public' | 'private';
    showActivity: boolean;
    contactPreference: 'anyone' | 'matching' | 'nobody';
  };
  security?: {
    activeSessions?: Array<{
      sessionId: string;
      device: string;
      browser?: string;
      ip?: string;
      lastActive: string;
    }>;
    loginHistory?: Array<{
      timestamp: string;
      device: string;
      ip: string;
      status: string;
    }>;
    blockedUsers?: string[];
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface Endorsement {
  endorserId: string | User;
  endorserUsername?: string;
  exchangeId?: string;
  note: string;
  date: string;
}

export interface TeachingSkill {
  _id?: string;
  name: string;
  category?: string;
  level: SkillLevel;
  yearsExperience?: number;
  verificationStatus: VerificationStatus;
  verifiedByCount?: number;
  endorsements?: Endorsement[];
}

export interface LearningSkill {
  _id?: string;
  name: string;
  category?: string;
  targetLevel: SkillLevel;
  priority: 'High' | 'Medium' | 'Low';
  preferredFormat: string[];
}

export interface SkillProfile {
  _id?: string;
  userId: string;
  skillsTeaching: TeachingSkill[];
  skillsLearning: LearningSkill[];
  stats: {
    skillsTaught: number;
    skillsLearned: number;
    exchangesCompleted: number;
    projectsCompleted: number;
    teachingHours: number;
    learningHours: number;
  };
}

export interface SkillExchange {
  _id: string;
  requesterId: User;
  recipientId: User;
  requestedSkill: { name: string; category?: string };
  offeredSkill: { name: string; category?: string };
  preferredFormat: 'Voice' | 'Whiteboard' | 'Code' | 'Camera' | 'Mixed';
  message?: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined' | 'cancelled';
  studioId?: any;
  projectId?: any;
  completionDetails?: {
    completedAt?: string;
    durationMinutes?: number;
    requesterConfirmed?: boolean;
    recipientConfirmed?: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface WhiteboardElement {
  id: string;
  type: 'pen' | 'pencil' | 'highlighter' | 'eraser' | 'line' | 'arrow' | 'rect' | 'circle' | 'triangle' | 'text' | 'sticky';
  points?: Array<{ x: number; y: number }>;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
  text?: string;
  fontSize?: number;
}

export interface ChatMessage {
  senderId: string;
  senderName: string;
  senderUsername?: string;
  senderAvatar?: AvatarData;
  text: string;
  createdAt: string;
}

export interface SkillStudio {
  _id: string;
  exchangeId: any;
  title: string;
  topicSkillTeach?: string;
  topicSkillLearn?: string;
  participants: Array<{
    userId: User;
    role: 'host' | 'participant';
    isOnline?: boolean;
    joinedAt?: string;
  }>;
  status: 'active' | 'paused' | 'ended';
  sessionSettings: {
    whiteboardPermission: 'everyone' | 'host_only';
    codePermission: 'everyone' | 'host_only';
    uploadPermission: 'everyone' | 'host_only';
    screenSharePermission: 'everyone' | 'host_only';
    cameraAllowed: boolean;
    voiceAllowed: boolean;
  };
  whiteboardElements: WhiteboardElement[];
  codeSpace: {
    language: string;
    code: string;
    lastEditedBy?: string;
  };
  chatMessages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  _id: string;
  studioId: string;
  exchangeId?: string;
  uploaderId: string;
  uploaderUsername: string;
  uploaderDisplayName: string;
  uploaderAvatar: AvatarData;
  originalName: string;
  storedFilename: string;
  fileType: 'PDF' | 'DOC' | 'DOCX' | 'PPT' | 'PPTX' | 'TXT' | 'IMAGE' | 'CODE' | 'ZIP' | 'OTHER';
  mimeType: string;
  sizeBytes: number;
  description?: string;
  downloadCount: number;
  createdAt: string;
}

export interface Project {
  _id: string;
  title: string;
  description: string;
  exchangeId?: string;
  participants: Array<{
    userId: User;
    role: string;
    skillsContributed?: string[];
  }>;
  skillsUsed: string[];
  status: 'planning' | 'in_progress' | 'completed';
  githubUrl?: string;
  liveUrl?: string;
  notes?: string;
  privacy: 'public' | 'connections' | 'private';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  _id: string;
  exchangeId: string;
  reviewerId: User;
  recipientId: string;
  skillTaught: string;
  appreciationChips: string[];
  personalNote?: string;
  visibility: 'public' | 'private';
  createdAt: string;
}

export interface NotificationItem {
  _id: string;
  recipientId: string;
  senderId?: User;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface MatchPeer {
  user: User;
  profile: SkillProfile;
  matchInfo: {
    isMutualMatch: boolean;
    isOneWayTeach: boolean;
    isOneWayLearn: boolean;
    compatibilityScore: number;
    aTeachesWhatBWants?: Array<{ offered: TeachingSkill; wanted: LearningSkill }>;
    bTeachesWhatAWants?: Array<{ offered: TeachingSkill; wanted: LearningSkill }>;
    whyMatch: string[];
    breakdown: Array<{ item: string; points: number; detail: string }>;
  };
}

export interface DirectMessage {
  _id: string;
  senderId: User | string;
  recipientId: User | string;
  text: string;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    fileType?: string;
  }>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Conversation {
  peer: User;
  lastMessage: DirectMessage;
  unreadCount: number;
}

