import React, { useState, useEffect } from 'react';
import { FileText, Download, Upload, Trash2, FileCode, FileArchive, Image as ImageIcon, File, ShieldAlert } from 'lucide-react';
import { Resource, User } from '../../types';
import { api } from '../../services/api';
import { UserAvatar } from '../UserAvatar';

interface ResourcesPanelProps {
  studioId: string;
  currentUser: User;
  canUpload?: boolean;
}

export const ResourcesPanel: React.FC<ResourcesPanelProps> = ({
  studioId,
  currentUser,
  canUpload = true,
}) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [description, setDescription] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadResources();
  }, [studioId]);

  const loadResources = async () => {
    try {
      const res = await api.getStudioResources(studioId);
      if (res.success) {
        setResources(res.resources || []);
      }
    } catch (err: any) {
      console.warn('Failed to load resources:', err);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to share.');
      return;
    }

    setIsUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('studioId', studioId);
    formData.append('description', description);

    try {
      const res = await api.uploadResource(formData);
      if (res.success) {
        setResources((prev) => [res.resource, ...prev]);
        setSelectedFile(null);
        setDescription('');
      }
    } catch (err: any) {
      setError(err.message || 'File upload failed. Max size is 15MB.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!window.confirm('Delete this shared resource?')) return;
    try {
      await api.deleteResource(resourceId);
      setResources((prev) => prev.filter((r) => r._id !== resourceId));
    } catch (err: any) {
      alert(err.message || 'Failed to delete resource');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'CODE':
        return <FileCode className="w-5 h-5 text-cyan-400" />;
      case 'ZIP':
        return <FileArchive className="w-5 h-5 text-amber-400" />;
      case 'IMAGE':
        return <ImageIcon className="w-5 h-5 text-emerald-400" />;
      default:
        return <File className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 p-4 rounded-xl border border-white/10 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div>
          <h3 className="text-sm font-bold font-display text-white">
            Shared Learning Resources
          </h3>
          <p className="text-[11px] text-slate-400">
            Every shared file is attributed to its owner.
          </p>
        </div>
        <span className="text-xs font-mono text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded border border-gold-500/20">
          {resources.length} {resources.length === 1 ? 'file' : 'files'}
        </span>
      </div>

      {error && (
        <div className="my-2 p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Upload Box */}
      {canUpload ? (
        <form onSubmit={handleUpload} className="mt-3 p-3 rounded-xl bg-obsidian-900 border border-white/10 space-y-2">
          <span className="text-xs font-semibold text-slate-300 block">
            Upload & Share with Partner
          </span>
          <div className="flex items-center gap-2">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="text-xs text-slate-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-white/10 file:text-slate-200 hover:file:bg-white/20 cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Short note or description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex-1 bg-obsidian-950 border border-white/10 rounded px-2.5 py-1 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-gold-500"
            />
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
              className="px-3 py-1 bg-gold-500 hover:bg-gold-400 text-obsidian-950 text-xs font-bold rounded transition-colors disabled:opacity-40 flex items-center gap-1"
            >
              <Upload className="w-3.5 h-3.5" />
              {isUploading ? 'Uploading...' : 'Share'}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 p-2 rounded-lg bg-black/40 text-xs text-slate-500 italic text-center">
          Host has restricted uploads.
        </div>
      )}

      {/* Resources List */}
      <div className="mt-4 flex-1 overflow-y-auto space-y-3 pr-1">
        {resources.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            <FileText className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-50" />
            <p>No resources shared in this studio yet.</p>
            <p className="text-[11px] text-slate-600 mt-1">Upload code files, notes, or PDFs to explain concepts.</p>
          </div>
        ) : (
          resources.map((res) => (
            <div
              key={res._id}
              className="p-3 rounded-xl bg-obsidian-900 border border-white/10 hover:border-gold-500/30 transition-all flex flex-col justify-between gap-2 shadow-sm"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5 shrink-0">
                  {getFileIcon(res.fileType)}
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate" title={res.originalName}>
                    {res.originalName}
                  </h4>
                  {res.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      {res.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="font-mono bg-white/5 px-1 rounded">{res.fileType}</span>
                    <span>•</span>
                    <span>{formatFileSize(res.sizeBytes)}</span>
                    <span>•</span>
                    <span>{new Date(res.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Attribution and Download Button */}
              <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <UserAvatar avatar={res.uploaderAvatar} size="xs" />
                  <span className="text-slate-400">Shared by:</span>
                  <span className="font-semibold text-gold-400">@{res.uploaderUsername}</span>
                </div>

                <div className="flex items-center gap-2">
                  {res.uploaderId === currentUser._id && (
                    <button
                      onClick={() => handleDelete(res._id)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <a
                    href={`/api/resources/${res._id}/download`}
                    download
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 text-xs font-semibold border border-gold-500/30 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </a>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
