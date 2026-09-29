import React, { useState } from 'react';
import { X, Sliders, Check, Shield } from 'lucide-react';
import { api } from '../../services/api';
import { useSocket } from '../../context/SocketContext';

interface SessionSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  studioId: string;
  initialSettings: any;
  isHost: boolean;
}

export const SessionSettingsModal: React.FC<SessionSettingsModalProps> = ({
  isOpen,
  onClose,
  studioId,
  initialSettings,
  isHost,
}) => {
  const { socket } = useSocket();
  const [settings, setSettings] = useState(initialSettings || {
    whiteboardPermission: 'everyone',
    codePermission: 'everyone',
    uploadPermission: 'everyone',
    screenSharePermission: 'everyone',
    cameraAllowed: true,
    voiceAllowed: true,
  });

  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!isHost) {
      onClose();
      return;
    }

    setSaving(true);
    try {
      await api.updateStudioSettings(studioId, settings);
      socket?.emit('update-session-settings', { studioId, settings });
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update studio settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-obsidian-900 border border-gold-500/30 rounded-2xl w-full max-w-md p-6 shadow-2xl relative text-slate-100">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2 text-gold-400">
            <Sliders className="w-5 h-5" />
            <h3 className="text-lg font-bold font-display text-white">
              Studio Permissions & Controls
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isHost && (
          <div className="mt-3 p-2.5 rounded-lg bg-white/5 text-xs text-slate-400 italic">
            You are a participant in this studio. Only the session host can modify workspace permissions.
          </div>
        )}

        <div className="space-y-4 mt-4">
          {/* Whiteboard Permission */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-950 border border-white/5">
            <div>
              <span className="block text-xs font-semibold text-white">Whiteboard Drawing</span>
              <span className="text-[11px] text-slate-400">Who can draw or edit canvas</span>
            </div>
            <select
              value={settings.whiteboardPermission}
              disabled={!isHost}
              onChange={(e) => setSettings({ ...settings, whiteboardPermission: e.target.value })}
              className="bg-obsidian-900 border border-white/10 rounded-lg text-xs px-2.5 py-1 text-slate-200"
            >
              <option value="everyone">Everyone</option>
              <option value="host_only">Host Only</option>
            </select>
          </div>

          {/* Code Space Permission */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-950 border border-white/5">
            <div>
              <span className="block text-xs font-semibold text-white">Code Space Editing</span>
              <span className="text-[11px] text-slate-400">Who can type in code space</span>
            </div>
            <select
              value={settings.codePermission}
              disabled={!isHost}
              onChange={(e) => setSettings({ ...settings, codePermission: e.target.value })}
              className="bg-obsidian-900 border border-white/10 rounded-lg text-xs px-2.5 py-1 text-slate-200"
            >
              <option value="everyone">Everyone</option>
              <option value="host_only">Host Only</option>
            </select>
          </div>

          {/* Resource Upload Permission */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-950 border border-white/5">
            <div>
              <span className="block text-xs font-semibold text-white">Resource Uploads</span>
              <span className="text-[11px] text-slate-400">Who can share new files</span>
            </div>
            <select
              value={settings.uploadPermission}
              disabled={!isHost}
              onChange={(e) => setSettings({ ...settings, uploadPermission: e.target.value })}
              className="bg-obsidian-900 border border-white/10 rounded-lg text-xs px-2.5 py-1 text-slate-200"
            >
              <option value="everyone">Everyone</option>
              <option value="host_only">Host Only</option>
            </select>
          </div>

          {/* Screen Share */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-obsidian-950 border border-white/5">
            <div>
              <span className="block text-xs font-semibold text-white">Screen Sharing</span>
              <span className="text-[11px] text-slate-400">Who can broadcast screen</span>
            </div>
            <select
              value={settings.screenSharePermission}
              disabled={!isHost}
              onChange={(e) => setSettings({ ...settings, screenSharePermission: e.target.value })}
              className="bg-obsidian-900 border border-white/10 rounded-lg text-xs px-2.5 py-1 text-slate-200"
            >
              <option value="everyone">Everyone</option>
              <option value="host_only">Host Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10 mt-5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
          >
            Close
          </button>
          {isHost && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-lg text-xs font-bold bg-gold-500 hover:bg-gold-400 text-obsidian-950 shadow-gold-subtle transition-all"
            >
              {saving ? 'Saving...' : 'Apply Permissions'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
