import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { ChatMessage, User } from '../../types';
import { useSocket } from '../../context/SocketContext';
import { UserAvatar } from '../UserAvatar';

interface StudioChatProps {
  studioId: string;
  currentUser: User;
  initialMessages?: ChatMessage[];
}

export const StudioChat: React.FC<StudioChatProps> = ({
  studioId,
  currentUser,
  initialMessages = [],
}) => {
  const { socket } = useSocket();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialMessages) setMessages(initialMessages);
  }, [initialMessages]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-chat-message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off('new-chat-message');
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    socket?.emit('send-chat', {
      studioId,
      text: text.trim(),
    });

    setText('');
  };

  return (
    <div className="flex flex-col h-full bg-obsidian-950 p-4 rounded-xl border border-white/10 text-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gold-400" />
          <h3 className="text-sm font-bold font-display text-white">
            Studio Chat
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-mono">Real-time sync</span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
        {messages.length === 0 ? (
          <p className="text-center py-10 text-xs text-slate-500">
            Send a message to greet your skill partner.
          </p>
        ) : (
          messages.map((m, idx) => {
            const isMe = m.senderId === currentUser._id;
            return (
              <div
                key={idx}
                className={`flex gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <UserAvatar avatar={m.senderAvatar} size="xs" />
                <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-0.5 text-[10px] text-slate-400">
                    <span className="font-semibold text-slate-300">
                      {isMe ? 'You' : m.senderName || `@${m.senderUsername}`}
                    </span>
                    <span>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl text-xs break-words shadow-sm ${
                      isMe
                        ? 'bg-gold-500 text-obsidian-950 font-medium rounded-tr-none'
                        : 'bg-obsidian-900 border border-white/10 text-slate-100 rounded-tl-none'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSend} className="pt-2 border-t border-white/10 flex gap-2">
        <input
          type="text"
          placeholder="Ask a question or explain a step..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 bg-obsidian-900 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-gold-500"
        />
        <button
          type="submit"
          className="p-2 bg-gold-500 hover:bg-gold-400 text-obsidian-950 rounded-lg transition-colors shadow-gold-subtle"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
