import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Send, 
  Search, 
  MessageSquare, 
  User as UserIcon, 
  Clock, 
  CheckCheck, 
  Check, 
  Shield, 
  Circle, 
  ArrowLeft,
  Sparkles,
  Paperclip,
  Smile
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';
import { Conversation, DirectMessage, User } from '../types';
import { UserAvatar } from '../components/UserAvatar';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const { socket, onlineUserIds } = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPeer, setSelectedPeer] = useState<User | null>(null);
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const targetPeerId = searchParams.get('userId') || searchParams.get('peerId') || searchParams.get('peer');
  const targetUsername = searchParams.get('user') || searchParams.get('username');

  // Load conversations on mount or query change
  useEffect(() => {
    loadConversations();
  }, [user?._id, targetPeerId, targetUsername]);

  const loadConversations = async () => {
    setIsLoadingList(true);
    try {
      const res = await api.getConversations();
      if (res.success && res.conversations) {
        setConversations(res.conversations);

        // If targetPeerId or targetUsername specified in query, pick it
        if (targetPeerId) {
          const found = res.conversations.find((c: Conversation) => c.peer._id === targetPeerId);
          if (found) {
            setSelectedPeer(found.peer);
          } else {
            fetchPeerById(targetPeerId);
          }
        } else if (targetUsername) {
          const cleanUser = targetUsername.replace(/^@/, '');
          const found = res.conversations.find((c: Conversation) => c.peer.username.toLowerCase() === cleanUser.toLowerCase());
          if (found) {
            setSelectedPeer(found.peer);
          } else {
            api.getProfile(cleanUser).then(pRes => {
              if (pRes.success && pRes.user) {
                setSelectedPeer(pRes.user);
              }
            }).catch(() => {});
          }
        } else if (res.conversations.length > 0 && !selectedPeer) {
          // Default select first conversation on desktop
          setSelectedPeer(res.conversations[0].peer);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    } finally {
      setIsLoadingList(false);
    }
  };

  const fetchPeerById = async (peerId: string) => {
    try {
      const res = await api.getMessagesWithPeer(peerId);
      if (res.success && res.peer) {
        setSelectedPeer(res.peer);
      }
    } catch (err) {
      console.error('Error fetching peer:', err);
    }
  };

  // Load messages whenever selectedPeer changes
  useEffect(() => {
    if (selectedPeer) {
      loadMessagesForPeer(selectedPeer._id);
    } else {
      setMessages([]);
    }
  }, [selectedPeer?._id]);

  // Robust fallback polling every 4s to ensure messages always sync even if WebSockets are slow
  useEffect(() => {
    if (!selectedPeer) return;
    const interval = setInterval(() => {
      api.getMessagesWithPeer(selectedPeer._id).then(res => {
        if (res.success && res.messages) {
          setMessages(prev => {
            if (res.messages.length !== prev.length || res.messages[res.messages.length - 1]?._id !== prev[prev.length - 1]?._id) {
              return res.messages;
            }
            return prev;
          });
        }
      }).catch(() => {});
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedPeer?._id]);

  const loadMessagesForPeer = async (peerId: string) => {
    setIsLoadingMessages(true);
    try {
      const res = await api.getMessagesWithPeer(peerId);
      if (res.success) {
        setMessages(res.messages || []);
        if (res.peer) setSelectedPeer(res.peer);
        // Mark as read in local conversation list
        setConversations(prev =>
          prev.map(c => c.peer._id === peerId ? { ...c, unreadCount: 0 } : c)
        );
      }
    } catch (err) {
      console.error('Failed to load peer messages:', err);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  // Socket listener for real-time messages & typing status
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg: DirectMessage) => {
      const senderId = typeof msg.senderId === 'string' ? msg.senderId : msg.senderId?._id;
      const recipientId = typeof msg.recipientId === 'string' ? msg.recipientId : msg.recipientId?._id;

      // If open with this peer
      if (selectedPeer && (senderId === selectedPeer._id || recipientId === selectedPeer._id)) {
        setMessages(prev => {
          if (prev.some(m => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
        // Auto mark as read
        if (senderId === selectedPeer._id) {
          api.markConversationRead(selectedPeer._id).catch(() => {});
        }
      }

      // Update conversations list preview
      setConversations(prev => {
        const otherUserId = senderId === user?._id ? recipientId : senderId;
        const exists = prev.find(c => c.peer._id === otherUserId);

        if (exists) {
          return prev.map(c => {
            if (c.peer._id === otherUserId) {
              const isCurrentOpen = selectedPeer && selectedPeer._id === otherUserId;
              return {
                ...c,
                lastMessage: msg,
                unreadCount: isCurrentOpen ? 0 : c.unreadCount + (senderId !== user?._id ? 1 : 0)
              };
            }
            return c;
          });
        } else {
          // Refresh list to pull user details
          loadConversations();
          return prev;
        }
      });
    };

    const handleTypingStatus = (data: { senderId: string; isTyping: boolean }) => {
      if (selectedPeer && data.senderId === selectedPeer._id) {
        setPeerTyping(data.isTyping);
      }
    };

    socket.on('direct-message-received', handleNewMessage);
    socket.on('direct-typing-status', handleTypingStatus);

    return () => {
      socket.off('direct-message-received', handleNewMessage);
      socket.off('direct-typing-status', handleTypingStatus);
    };
  }, [socket, selectedPeer, user?._id]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, peerTyping]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !selectedPeer || isSending) return;

    const text = inputText.trim();
    setInputText('');
    setIsSending(true);

    // Stop typing indicator
    if (socket) {
      socket.emit('direct-typing', { recipientId: selectedPeer._id, isTyping: false });
    }

    try {
      const res = await api.sendDirectMessage({
        recipientId: selectedPeer._id,
        text,
      });

      if (res.success && res.message) {
        const newMsg: DirectMessage = res.message;
        setMessages(prev => {
          if (prev.some(m => m._id === newMsg._id)) return prev;
          return [...prev, newMsg];
        });

        // Emit through socket for real-time delivery
        if (socket) {
          socket.emit('direct-message-send', {
            recipientId: selectedPeer._id,
            message: newMsg,
          });
        }

        // Update conversation in list
        setConversations(prev => {
          const index = prev.findIndex(c => c.peer._id === selectedPeer._id);
          if (index !== -1) {
            const updated = [...prev];
            updated[index] = {
              ...updated[index],
              lastMessage: newMsg,
            };
            // Move to top
            const [item] = updated.splice(index, 1);
            return [item, ...updated];
          } else {
            return [{
              peer: selectedPeer,
              lastMessage: newMsg,
              unreadCount: 0,
            }, ...prev];
          }
        });
      } else {
        alert(res.message || 'Failed to deliver message.');
        setInputText(text); // restore
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      alert(err.message || 'Could not send message. Please verify network or server status.');
      setInputText(text); // restore
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputText(e.target.value);

    if (socket && selectedPeer) {
      socket.emit('direct-typing', { recipientId: selectedPeer._id, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        if (socket && selectedPeer) {
          socket.emit('direct-typing', { recipientId: selectedPeer._id, isTyping: false });
        }
      }, 2000);
    }
  };

  const filteredConversations = conversations.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.peer.displayName?.toLowerCase().includes(q) ||
      c.peer.username?.toLowerCase().includes(q) ||
      c.lastMessage?.text?.toLowerCase().includes(q)
    );
  });

  const isPeerOnline = (peerId: string) => onlineUserIds.includes(peerId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-obsidian-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans ambient-canvas transition-colors duration-200">
      <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="flex-1 flex min-w-0">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <div className="flex-1 lg:pl-64 flex flex-col min-w-0 w-full">
          <main className="flex-1 p-3 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full flex flex-col space-y-4">
            
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase bg-gold-500/10 text-gold-600 dark:text-gold-400 border border-gold-500/20">
                    Zero AI • Human Peer Network
                  </span>
                  <span className="flex items-center gap-1 text-[11px] text-emerald-500 font-medium">
                    <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
                    Live Presence Active
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 dark:text-slate-100">
                  Direct Messages
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                  Real-time, private peer communication for exchange planning and questions.
                </p>
              </div>
            </div>

            {/* Main Messaging Container */}
            <div className="bg-white/80 dark:bg-obsidian-900/80 border border-slate-200 dark:border-obsidian-800 rounded-2xl shadow-xl backdrop-blur-md overflow-hidden grid grid-cols-1 md:grid-cols-12 flex-1 min-h-[550px] h-[calc(100vh-14rem)] sm:h-[calc(100vh-12rem)]">
        
        {/* LEFT COLUMN: CONVERSATION LIST (4 cols) */}
        <div className={`md:col-span-4 border-r border-slate-200 dark:border-obsidian-800 flex flex-col ${
          selectedPeer ? 'hidden md:flex' : 'flex'
        }`}>
          {/* Search Bar */}
          <div className="p-3.5 border-b border-slate-200 dark:border-obsidian-800 bg-slate-50/50 dark:bg-obsidian-950/40">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-obsidian-900 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 transition"
              />
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-obsidian-800/60">
            {isLoadingList ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading conversations...
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-obsidian-800 mx-auto flex items-center justify-center text-slate-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {searchQuery ? 'No conversations found' : 'No messages yet'}
                </p>
                <Link
                  to="/discover"
                  className="inline-block text-xs font-medium text-gold-500 hover:text-gold-400 hover:underline"
                >
                  Discover peers to exchange skills
                </Link>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = selectedPeer?._id === conv.peer._id;
                const online = isPeerOnline(conv.peer._id);
                const lastMsg = conv.lastMessage;
                const isMyLastMsg = lastMsg && (
                  typeof lastMsg.senderId === 'string' 
                    ? lastMsg.senderId === user?._id 
                    : lastMsg.senderId?._id === user?._id
                );

                return (
                  <button
                    key={conv.peer._id}
                    onClick={() => {
                      setSelectedPeer(conv.peer);
                      setSearchParams({ userId: conv.peer._id });
                    }}
                    className={`w-full p-3.5 text-left transition flex items-start gap-3 relative ${
                      isSelected
                        ? 'bg-gold-500/10 dark:bg-gold-500/15 border-l-4 border-l-gold-500'
                        : 'hover:bg-slate-50 dark:hover:bg-obsidian-800/40 border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="relative">
                      <UserAvatar 
                        avatar={conv.peer.avatar} 
                        size="md" 
                        isOnline={online}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="font-heading font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                          {conv.peer.displayName}
                        </span>
                        {lastMsg && (
                          <span className="text-[10px] text-slate-400 shrink-0">
                            {new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-xs truncate ${
                          conv.unreadCount > 0 
                            ? 'font-bold text-slate-900 dark:text-slate-100' 
                            : 'text-slate-500 dark:text-slate-400'
                        }`}>
                          {isMyLastMsg && <span className="text-slate-400 font-normal">You: </span>}
                          {lastMsg ? lastMsg.text : 'Start conversation...'}
                        </p>

                        {conv.unreadCount > 0 && (
                          <span className="w-4 h-4 rounded-full bg-gold-500 text-obsidian-950 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: CHAT WINDOW (8 cols) */}
        <div className={`md:col-span-8 flex flex-col bg-slate-50/30 dark:bg-obsidian-950/20 ${
          !selectedPeer ? 'hidden md:flex' : 'flex'
        }`}>
          {selectedPeer ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-obsidian-800 bg-white/70 dark:bg-obsidian-900/70 backdrop-blur flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Mobile Back Button */}
                  <button
                    onClick={() => setSelectedPeer(null)}
                    className="md:hidden p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-obsidian-800"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div className="relative">
                    <UserAvatar 
                      avatar={selectedPeer.avatar} 
                      size="md" 
                      isOnline={isPeerOnline(selectedPeer._id)}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h2 className="font-heading font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {selectedPeer.displayName}
                      </h2>
                      <span className="text-[11px] text-slate-400">@{selectedPeer.username}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px]">
                      {peerTyping ? (
                        <span className="text-gold-500 animate-pulse font-medium">typing...</span>
                      ) : isPeerOnline(selectedPeer._id) ? (
                        <span className="text-emerald-500 font-medium">Online now</span>
                      ) : (
                        <span className="text-slate-400">Offline</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Link
                    to={`/profile/${selectedPeer.username}`}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-obsidian-700 bg-white dark:bg-obsidian-800 text-xs font-medium text-slate-700 dark:text-slate-300 hover:border-gold-500/50 hover:text-gold-500 transition flex items-center gap-1.5"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Profile</span>
                  </Link>
                </div>
              </div>

              {/* Messages Flow */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
                {isLoadingMessages ? (
                  <div className="text-center py-12 text-xs text-slate-400">
                    Loading conversation history...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-gold-500/10 border border-gold-500/20 text-gold-500 mx-auto flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                      Start your conversation with {selectedPeer.displayName}
                    </p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Say hello, ask about their skills, or plan your next hands-on exchange session.
                    </p>
                  </div>
                ) : (
                  messages.map((m) => {
                    const senderId = typeof m.senderId === 'string' ? m.senderId : m.senderId?._id;
                    const isMine = senderId === user?._id;

                    return (
                      <div
                        key={m._id}
                        className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[80%] sm:max-w-[70%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm transition-all ${
                            isMine
                              ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-obsidian-950 font-medium rounded-br-sm'
                              : 'bg-white dark:bg-obsidian-800 border border-slate-200 dark:border-obsidian-700 text-slate-800 dark:text-slate-200 rounded-bl-sm'
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">{m.text}</p>
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 px-1">
                          <span className="text-[10px] text-slate-400">
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <span>
                              {m.isRead ? (
                                <CheckCheck className="w-3.5 h-3.5 text-gold-500" />
                              ) : (
                                <Check className="w-3 h-3 text-slate-400" />
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-obsidian-800 bg-white dark:bg-obsidian-900/90 backdrop-blur">
                <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder={`Message @${selectedPeer.username}...`}
                      value={inputText}
                      onChange={handleInputChange}
                      disabled={isSending}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-obsidian-950/60 border border-slate-200 dark:border-obsidian-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-gold-500 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!inputText.trim() || isSending}
                    className="p-2.5 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 transition disabled:opacity-40 disabled:cursor-not-allowed shadow-md shrink-0"
                    title="Send message"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    Direct end-to-peer delivery • Never used for model training
                  </span>
                  <span>Press Enter to send</span>
                </div>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-gold-500 flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100 mb-1">
                Your Direct Messages
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                Connect directly with mentors, peers, and collaborators. Coordinate time zones, clarify learning goals, and share resources.
              </p>
              <Link
                to="/discover"
                className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-400 text-obsidian-950 font-semibold text-xs transition shadow-md"
              >
                Browse Skill Catalog & Peers
              </Link>
            </div>
          )}
        </div>

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
