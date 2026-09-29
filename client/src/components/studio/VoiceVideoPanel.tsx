import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  ScreenShare,
  Volume2,
  PhoneOff,
  Radio,
  Sliders,
  Sparkles
} from 'lucide-react';
import { User } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { UserAvatar } from '../UserAvatar';

interface VoiceVideoPanelProps {
  studioId: string;
  currentUser: User;
  participants: any[];
  onLeaveStudio: () => void;
  cameraAllowed?: boolean;
  voiceAllowed?: boolean;
}

export const VoiceVideoPanel: React.FC<VoiceVideoPanelProps> = ({
  studioId,
  currentUser,
  participants,
  onLeaveStudio,
  cameraAllowed = true,
  voiceAllowed = true,
}) => {
  const { socket } = useSocket();

  const [isMicOn, setIsMicOn] = useState<boolean>(false);
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isScreenSharing, setIsScreenSharing] = useState<boolean>(false);
  const [isPushToTalk, setIsPushToTalk] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(80);
  const [peerSpeakingState, setPeerSpeakingState] = useState<Record<string, boolean>>({});

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Socket listener for voice activity
  useEffect(() => {
    if (!socket) return;

    socket.on('peer-voice-activity', ({ userId, isSpeaking: speaking }) => {
      setPeerSpeakingState((prev) => ({ ...prev, [userId]: speaking }));
    });

    return () => {
      socket.off('peer-voice-activity');
    };
  }, [socket]);

  // Clean up media on unmount
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const toggleMic = async () => {
    if (!voiceAllowed) {
      alert('Host has disabled voice participation for this session.');
      return;
    }

    if (isMicOn) {
      setIsMicOn(false);
      setIsSpeaking(false);
      socket?.emit('voice-activity', { studioId, isSpeaking: false });
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setIsMicOn(true);
        setIsSpeaking(true);
        socket?.emit('voice-activity', { studioId, isSpeaking: true });
      } catch (err) {
        // Fallback for devices without microphone permissions
        setIsMicOn(true);
        setIsSpeaking(true);
        socket?.emit('voice-activity', { studioId, isSpeaking: true });
      }
    }
  };

  const toggleCamera = async () => {
    if (!cameraAllowed) {
      alert('Host has disabled camera participation in this session.');
      return;
    }

    if (isCameraOn) {
      if (localStreamRef.current) {
        localStreamRef.current.getVideoTracks().forEach((t) => t.stop());
      }
      setIsCameraOn(false);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = null;
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setIsCameraOn(true);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (err) {
        alert('Camera is optional. Unable to access web camera or permission was not granted.');
      }
    }
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false);
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        setIsScreenSharing(true);
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } catch (err) {
        // User cancelled screen picker
      }
    }
  };

  // Push to talk listeners
  useEffect(() => {
    if (!isPushToTalk) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat && !isSpeaking) {
        setIsSpeaking(true);
        socket?.emit('voice-activity', { studioId, isSpeaking: true });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpeaking(false);
        socket?.emit('voice-activity', { studioId, isSpeaking: false });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPushToTalk, isSpeaking, studioId, socket]);

  return (
    <div className="flex flex-col h-full bg-obsidian-950 p-4 rounded-xl border border-white/10 text-slate-100 justify-between">
      {/* Participants Video / Audio Tiles */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <span className="text-xs uppercase tracking-wider font-semibold text-gold-400 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 animate-pulse text-gold-400" />
            Studio Participants ({participants.length})
          </span>
          <span className="text-[10px] text-slate-400">
            {isPushToTalk ? 'Push-To-Talk: Hold Space' : 'Open Mic'}
          </span>
        </div>

        {/* Tiles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Current User Tile */}
          <div className="relative rounded-xl overflow-hidden bg-obsidian-900 border border-white/10 p-3 flex flex-col items-center justify-center min-h-[120px]">
            {isCameraOn ? (
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover rounded-lg absolute inset-0"
              />
            ) : (
              <div className="flex flex-col items-center">
                <div className={`relative ${isSpeaking ? 'ring-4 ring-gold-500 rounded-full animate-pulse' : ''}`}>
                  <UserAvatar avatar={currentUser.avatar} size="lg" showGoldBorder />
                </div>
                <span className="text-xs font-semibold mt-2 text-white">
                  You (@{currentUser.username})
                </span>
                <span className="text-[10px] text-slate-400">
                  {isMicOn ? (isSpeaking ? 'Speaking...' : 'Mic On') : 'Muted'}
                </span>
              </div>
            )}

            <div className="absolute bottom-2 left-2 flex items-center gap-1 z-10">
              <span className={`p-1 rounded-md text-[10px] ${isMicOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              </span>
              <span className={`p-1 rounded-md text-[10px] ${isCameraOn ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {isCameraOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
              </span>
            </div>
          </div>

          {/* Peer Participants */}
          {participants
            .filter((p) => (p.userId?._id || p.userId) !== currentUser._id)
            .map((p, idx) => {
              const u = p.userId;
              const peerSpeaking = peerSpeakingState[u?._id || p.socketId];
              return (
                <div
                  key={idx}
                  className="relative rounded-xl overflow-hidden bg-obsidian-900 border border-white/10 p-3 flex flex-col items-center justify-center min-h-[120px]"
                >
                  <div className={`relative ${peerSpeaking ? 'ring-4 ring-gold-500 rounded-full animate-pulse' : ''}`}>
                    <UserAvatar avatar={u?.avatar} size="lg" showGoldBorder isOnline />
                  </div>
                  <span className="text-xs font-semibold mt-2 text-white">
                    {u?.displayName || p.displayName || 'Peer'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    @{u?.username || p.username} • {peerSpeaking ? 'Speaking...' : 'Listening'}
                  </span>
                </div>
              );
            })}
        </div>
      </div>

      {/* Control Bar at Bottom */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        {/* Push-to-Talk and Volume sliders */}
        <div className="flex items-center justify-between text-xs text-slate-400 gap-4">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPushToTalk}
              onChange={(e) => setIsPushToTalk(e.target.checked)}
              className="rounded border-white/20 text-gold-500 focus:ring-0"
            />
            <span>Push-To-Talk</span>
          </label>

          <div className="flex items-center gap-2 flex-1 max-w-[140px]">
            <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="range"
              min={0}
              max={100}
              value={volume}
              onChange={(e) => setVolume(Number(e.target.value))}
              className="w-full accent-gold-500 h-1 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Buttons Bar */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-full transition-all shadow-md ${
              isMicOn
                ? 'bg-slate-800 text-white hover:bg-slate-700'
                : 'bg-rose-600 text-white hover:bg-rose-500'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3 rounded-full transition-all shadow-md ${
              isCameraOn
                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title={isCameraOn ? 'Turn Camera Off' : 'Turn Camera On (Optional)'}
          >
            {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-3 rounded-full transition-all shadow-md ${
              isScreenSharing
                ? 'bg-gold-500 text-obsidian-950 font-bold'
                : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
            title="Share Screen"
          >
            <ScreenShare className="w-4 h-4" />
          </button>

          <button
            onClick={onLeaveStudio}
            className="p-3 rounded-full bg-rose-700 text-white hover:bg-rose-600 transition-all shadow-md"
            title="Leave Skill Studio"
          >
            <PhoneOff className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
