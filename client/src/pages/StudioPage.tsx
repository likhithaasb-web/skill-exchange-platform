import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Lock,
  PenTool,
  Code2,
  Radio,
  FileText,
  MessageSquare,
  Sliders,
  PhoneOff,
  Maximize2,
  Sparkles,
  ArrowRightLeft,
  Shield,
  Layers,
  CheckCircle2,
  FolderPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { WhiteboardCanvas } from '../components/studio/WhiteboardCanvas';
import { CodeSpace } from '../components/studio/CodeSpace';
import { VoiceVideoPanel } from '../components/studio/VoiceVideoPanel';
import { ResourcesPanel } from '../components/studio/ResourcesPanel';
import { StudioChat } from '../components/studio/StudioChat';
import { SessionSettingsModal } from '../components/studio/SessionSettingsModal';
import { UserAvatar } from '../components/UserAvatar';
import { api } from '../services/api';
import { SkillStudio } from '../types';

export const StudioPage: React.FC = () => {
  const { studioId } = useParams<{ studioId: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [studio, setStudio] = useState<SkillStudio | null>(null);
  const [activeTab, setActiveTab] = useState<'whiteboard' | 'code'>('whiteboard');
  const [sidePanel, setSidePanel] = useState<'voice' | 'resources' | 'chat'>('voice');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStudio();
  }, [studioId]);

  const loadStudio = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let targetId = studioId;

      // If user navigated to /studio/active, look up their latest active studio
      if (!targetId || targetId === 'active') {
        const exchangesRes = await api.getMyExchanges();
        const activeEx = exchangesRes.exchanges?.find(
          (e: any) => e.studioId && (e.status === 'accepted' || e.status === 'in_progress')
        );
        if (activeEx && activeEx.studioId) {
          targetId = activeEx.studioId._id || activeEx.studioId;
        } else {
          setError('No active Skill Studio found. Please accept or propose an exchange first.');
          setIsLoading(false);
          return;
        }
      }

      const res = await api.getStudioById(targetId!);
      if (res.success && res.studio) {
        setStudio(res.studio);

        // Join Socket room
        if (socket && user) {
          socket.emit('join-studio', {
            studioId: res.studio._id,
            user: {
              id: user._id,
              username: user.username,
              displayName: user.displayName,
              avatar: user.avatar,
            },
          });
        }
      }
    } catch (err: any) {
      setError(err.message || 'Unable to access Skill Studio.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveWhiteboard = async (elements: any[]) => {
    if (!studio) return;
    try {
      await api.saveWhiteboardData(studio._id, elements);
    } catch (err) {
      console.warn('Failed to persist whiteboard snapshot:', err);
    }
  };

  const handleSaveCode = async (code: string, language: string) => {
    if (!studio) return;
    try {
      await api.saveCodeSpaceData(studio._id, { code, language });
    } catch (err) {
      console.warn('Failed to persist code space:', err);
    }
  };

  const handleLeave = () => {
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        <Sparkles className="w-8 h-8 text-gold-500 animate-spin mb-3" />
        Initializing private Skill Studio...
      </div>
    );
  }

  if (error || !studio) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 flex flex-col items-center justify-center p-6 text-center text-slate-900 dark:text-slate-100 ambient-canvas">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 mb-4">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold font-display text-slate-900 dark:text-white mb-2">Private Workspace Notice</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
          {error || 'You must be an accepted participant of an active skill exchange to enter this studio.'}
        </p>
        <div className="flex gap-3">
          <Link
            to="/exchanges"
            className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-bold text-xs shadow-gold-subtle"
          >
            Go to Exchanges
          </Link>
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/5 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-300 dark:border-white/10 hover:bg-slate-300 dark:hover:bg-white/10"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const isHost = studio.participants.some(
    (p) => p.role === 'host' && (p.userId?._id || p.userId) === user?._id
  );

  const canEditWhiteboard = studio.sessionSettings.whiteboardPermission === 'everyone' || isHost;
  const canEditCode = studio.sessionSettings.codePermission === 'everyone' || isHost;
  const canUpload = studio.sessionSettings.uploadPermission === 'everyone' || isHost;

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden font-sans selection:bg-gold-500/30 selection:text-gold-200 transition-colors duration-200">
      {/* Studio Header Bar */}
      <header className="h-14 bg-white dark:bg-obsidian-900 border-b border-slate-200 dark:border-white/10 px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-30 shadow-sm">
        {/* Left: Studio Identity */}
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="w-7 h-7 rounded-lg bg-gradient-to-tr from-gold-600 to-amber-300 flex items-center justify-center shadow-gold-subtle"
            title="Return to SkillX Dashboard"
          >
            <span className="font-display font-black text-obsidian-950 text-sm">X</span>
          </Link>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold font-display text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                <span>Skill Studio</span>
                <span className="text-gold-500 font-normal">|</span>
                <span className="text-slate-600 dark:text-slate-300">{studio.title}</span>
              </h1>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-black/40 text-gold-600 dark:text-gold-400 text-[10px] font-mono border border-gold-500/20">
                <Lock className="w-2.5 h-2.5" /> Private
              </span>
            </div>
          </div>
        </div>

        {/* Center: Main Workspace Tool Tabs */}
        <div className="hidden md:flex items-center bg-slate-100 dark:bg-obsidian-950 p-1 rounded-xl border border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'whiteboard'
                ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            Collaborative Whiteboard
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'code'
                ? 'bg-gold-500 text-obsidian-950 font-bold shadow-gold-subtle'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            Code Space
          </button>
        </div>

        {/* Right: Participants, Settings, Leave */}
        <div className="flex items-center gap-2">
          {/* Host Permissions Button */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors relative"
            title="Studio Permissions & Controls"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Leave Button */}
          <button
            onClick={handleLeave}
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-colors flex items-center gap-1.5"
            title="Leave Studio"
          >
            <PhoneOff className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Leave</span>
          </button>
        </div>
      </header>

      {/* Main Studio Body: 2-Column Split Workspace */}
      <div className="flex-1 flex overflow-hidden p-2 gap-2">
        {/* Left Column: Active Interactive Canvas / Code Area */}
        <div className="flex-1 flex flex-col h-full rounded-xl overflow-hidden relative">
          {/* Mobile Tab Switcher */}
          <div className="md:hidden flex border-b border-slate-200 dark:border-white/10 bg-white dark:bg-obsidian-900 p-1 mb-1">
            <button
              onClick={() => setActiveTab('whiteboard')}
              className={`flex-1 py-1 text-xs font-semibold rounded ${
                activeTab === 'whiteboard' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Whiteboard
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-1 text-xs font-semibold rounded ${
                activeTab === 'code' ? 'bg-gold-500 text-obsidian-950 font-bold' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              Code Space
            </button>
          </div>

          <div className="flex-1 h-full">
            {activeTab === 'whiteboard' ? (
              <WhiteboardCanvas
                studioId={studio._id}
                initialElements={studio.whiteboardElements || []}
                onSave={handleSaveWhiteboard}
                canEdit={canEditWhiteboard}
              />
            ) : (
              <CodeSpace
                studioId={studio._id}
                initialCode={studio.codeSpace?.code}
                initialLanguage={studio.codeSpace?.language}
                onSave={handleSaveCode}
                canEdit={canEditCode}
              />
            )}
          </div>
        </div>

        {/* Right Column: Multi-Tab Tool Drawer (Voice/Camera, Resources, Chat) */}
        <div className="w-80 sm:w-96 flex flex-col h-full bg-white dark:bg-obsidian-900 rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shrink-0 shadow-sm">
          {/* Side Drawer Tabs */}
          <div className="flex border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-obsidian-950 p-1 shrink-0">
            <button
              onClick={() => setSidePanel('voice')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sidePanel === 'voice'
                  ? 'bg-gold-500 text-obsidian-950 shadow-gold-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>

            <button
              onClick={() => setSidePanel('resources')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sidePanel === 'resources'
                  ? 'bg-gold-500 text-obsidian-950 shadow-gold-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Resources</span>
            </button>

            <button
              onClick={() => setSidePanel('chat')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                sidePanel === 'chat'
                  ? 'bg-gold-500 text-obsidian-950 shadow-gold-subtle'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Chat</span>
            </button>
          </div>

          {/* Drawer Content */}
          <div className="flex-1 overflow-hidden p-2">
            {sidePanel === 'voice' && (
              <VoiceVideoPanel
                studioId={studio._id}
                currentUser={user!}
                participants={studio.participants}
                onLeaveStudio={handleLeave}
                cameraAllowed={studio.sessionSettings?.cameraAllowed}
                voiceAllowed={studio.sessionSettings?.voiceAllowed}
              />
            )}

            {sidePanel === 'resources' && (
              <ResourcesPanel
                studioId={studio._id}
                currentUser={user!}
                canUpload={canUpload}
              />
            )}

            {sidePanel === 'chat' && (
              <StudioChat
                studioId={studio._id}
                currentUser={user!}
                initialMessages={studio.chatMessages || []}
              />
            )}
          </div>
        </div>
      </div>

      {/* Host Session Settings Modal */}
      <SessionSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        studioId={studio._id}
        initialSettings={studio.sessionSettings}
        isHost={isHost}
      />
    </div>
  );
};
