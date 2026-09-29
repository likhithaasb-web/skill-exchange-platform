import React, { useState, useEffect } from 'react';
import { Copy, Download, Code2, Check, RefreshCw } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

interface CodeSpaceProps {
  studioId: string;
  initialCode?: string;
  initialLanguage?: string;
  onSave?: (code: string, language: string) => void;
  canEdit?: boolean;
}

const LANGUAGES = [
  { id: 'python', label: 'Python (.py)' },
  { id: 'javascript', label: 'JavaScript (.js)' },
  { id: 'typescript', label: 'TypeScript (.ts)' },
  { id: 'html', label: 'HTML (.html)' },
  { id: 'css', label: 'CSS (.css)' },
  { id: 'sql', label: 'SQL (.sql)' },
  { id: 'cpp', label: 'C++ (.cpp)' },
  { id: 'java', label: 'Java (.java)' },
];

export const CodeSpace: React.FC<CodeSpaceProps> = ({
  studioId,
  initialCode = '// Welcome to Skill Studio Collaborative Code Space\n',
  initialLanguage = 'python',
  onSave,
  canEdit = true,
}) => {
  const { socket } = useSocket();
  const [code, setCode] = useState<string>(initialCode);
  const [language, setLanguage] = useState<string>(initialLanguage);
  const [copied, setCopied] = useState<boolean>(false);
  const [lastEditedBy, setLastEditedBy] = useState<string>('');

  useEffect(() => {
    if (initialCode) setCode(initialCode);
    if (initialLanguage) setLanguage(initialLanguage);
  }, [initialCode, initialLanguage]);

  // Real-time synchronization
  useEffect(() => {
    if (!socket) return;

    socket.on('code-updated', ({ code: newCode, language: newLang, senderUsername }) => {
      setCode(newCode);
      if (newLang) setLanguage(newLang);
      if (senderUsername) setLastEditedBy(senderUsername);
    });

    return () => {
      socket.off('code-updated');
    };
  }, [socket]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCode(val);

    socket?.emit('code-change', {
      studioId,
      code: val,
      language,
    });

    if (onSave) onSave(val, language);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);

    socket?.emit('code-change', {
      studioId,
      code,
      language: newLang,
    });

    if (onSave) onSave(code, newLang);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const ext = language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'typescript' ? 'ts' : language === 'html' ? 'html' : language === 'css' ? 'css' : language === 'sql' ? 'sql' : 'txt';
    link.download = `SkillStudio_Code_${Date.now()}.${ext}`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Generate line numbers
  const lineCount = code.split('\n').length;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 16) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-full bg-[#0D1117] rounded-xl overflow-hidden border border-white/10 font-mono text-xs">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161B22] border-b border-white/10 text-slate-300">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>

          <div className="flex items-center gap-2 border-l border-white/10 pl-3">
            <Code2 className="w-4 h-4 text-gold-400" />
            <select
              value={language}
              onChange={handleLanguageChange}
              disabled={!canEdit}
              className="bg-obsidian-950 border border-white/10 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none focus:border-gold-500"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {lastEditedBy && (
            <span className="text-[11px] text-slate-400 italic hidden sm:inline">
              Edited by @{lastEditedBy}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            title="Copy Code"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="p-1.5 rounded bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors flex items-center gap-1 text-[11px]"
            title="Download Code File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Editor Body with Line Numbers */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Line Numbers Column */}
        <div className="select-none py-3 px-3 text-right text-slate-600 bg-[#090D13] border-r border-white/5 font-mono text-xs w-12 shrink-0">
          {lineNumbers.map((num) => (
            <div key={num} className="leading-6">
              {num}
            </div>
          ))}
        </div>

        {/* Textarea Code Input */}
        <textarea
          value={code}
          onChange={handleCodeChange}
          disabled={!canEdit}
          placeholder="// Type your code here or paste an algorithm snippet to explain..."
          className="flex-1 w-full h-full p-3 bg-transparent text-slate-100 placeholder-slate-600 font-mono text-xs leading-6 resize-none focus:outline-none focus:ring-0 overflow-y-auto"
          spellCheck={false}
        />
      </div>
    </div>
  );
};
