import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type { User, Conversation, FriendRequest, Message, PresenceStatus } from "../types";
import { seedUsers, seedConversations, seedFriendRequests, botReplies, sampleImages } from "../data/initialData";

const STORAGE_KEY = "pulsechat_state_v2";

interface ChatContextType {
  currentUser: User | null;
  users: User[];
  conversations: Conversation[];
  friendRequests: FriendRequest[];
  darkMode: boolean;
  soundEnabled: boolean;
  activeConversation: Conversation | null;
  typingInChat: string | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (email: string, password: string, displayName: string, username: string) => { success: boolean; error?: string };
  logout: () => void;
  switchUser: (userId: string) => void;
  sendMessage: (conversationId: string, content: string, type?: "text" | "image") => void;
  startConversation: (participantIds: string[]) => string;
  sendFriendRequest: (toUserId: string) => void;
  respondToFriendRequest: (requestId: string, accept: boolean) => void;
  updateProfile: (updates: Partial<User>) => void;
  setStatus: (status: PresenceStatus) => void;
  toggleDarkMode: () => void;
  toggleSound: () => void;
  setActiveConversation: (id: string | null) => void;
  markAsRead: (conversationId: string) => void;
  deleteConversation: (conversationId: string) => void;
  pinConversation: (conversationId: string) => void;
  removeContact: (userId: string) => void;
  playSound: (type: "send" | "receive") => void;
  getConversationPartner: (conv: Conversation) => User | null;
  getFriendIds: () => string[];
}

const ChatContext = createContext<ChatContextType | null>(null);

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}

function saveState(data: Record<string, unknown>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function playTone(type: "send" | "receive") {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "send") {
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    } else {
      osc.frequency.setValueAtTime(523, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(784, ctx.currentTime + 0.1);
    }
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  } catch { /* ignore */ }
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const saved = useRef(loadState());

  const [users, setUsers] = useState<User[]>(saved.current?.users ?? seedUsers);
  const [conversations, setConversations] = useState<Conversation[]>(saved.current?.conversations ?? seedConversations);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(saved.current?.friendRequests ?? seedFriendRequests);
  const [currentUser, setCurrentUser] = useState<User | null>(saved.current?.currentUser ?? null);
  const [darkMode, setDarkMode] = useState<boolean>(saved.current?.darkMode ?? false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(saved.current?.soundEnabled ?? true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [typingInChat, setTypingInChat] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    saveState({ users, conversations, friendRequests, currentUser, darkMode, soundEnabled });
  }, [users, conversations, friendRequests, currentUser, darkMode, soundEnabled]);

  // Simulate random online/offline status changes
  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => prev.map(u => {
        if (u.id === currentUser?.id) return u;
        if (Math.random() > 0.85) {
          const statuses: PresenceStatus[] = ["online", "busy", "away", "offline"];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return { ...u, status: newStatus, lastSeen: Date.now() };
        }
        return u;
      }));
    }, 15000);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  const playSound = useCallback((type: "send" | "receive") => {
    if (soundEnabled) playTone(type);
  }, [soundEnabled]);

  const login = useCallback((email: string, password: string) => {
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) return { success: false, error: "Invalid email or password" };
    setCurrentUser({ ...user, status: "online", lastSeen: Date.now() });
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: "online", lastSeen: Date.now() } : u));
    return { success: true };
  }, [users]);

  const register = useCallback((email: string, password: string, displayName: string, username: string) => {
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { success: false, error: "Email already registered" };
    }
    const newUser: User = {
      id: `u_${Date.now()}`, email, password, displayName, username,
      avatar: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(displayName)}&backgroundColor=c0aede`,
      bio: "", phone: "", status: "online", statusText: "New on PulseChat",
      lastSeen: Date.now(), createdAt: Date.now(),
    };
    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    return { success: true };
  }, [users]);

  const logout = useCallback(() => {
    if (currentUser) {
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, status: "offline", lastSeen: Date.now() } : u));
    }
    setCurrentUser(null);
    setActiveConversation(null);
  }, [currentUser]);

  const switchUser = useCallback((userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser({ ...user, status: "online", lastSeen: Date.now() });
      setActiveConversation(null);
    }
  }, [users]);

  const getFriendIds = useCallback((): string[] => {
    if (!currentUser) return [];
    const accepted = friendRequests.filter(r => r.status === "accepted" && (r.fromUserId === currentUser.id || r.toUserId === currentUser.id));
    const fromConvs = conversations.filter(c => c.participantIds.includes(currentUser.id)).flatMap(c => c.participantIds).filter(id => id !== currentUser.id);
    const friendSet = new Set([...accepted.map(r => r.fromUserId === currentUser.id ? r.toUserId : r.fromUserId), ...fromConvs]);
    return [...friendSet];
  }, [currentUser, friendRequests, conversations]);

  const sendMessage = useCallback((conversationId: string, content: string, type: "text" | "image" = "text") => {
    if (!currentUser) return;
    const newMsg: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      conversationId, senderId: currentUser.id, content, type,
      timestamp: Date.now(), status: "sent",
    };
    setConversations(prev => prev.map(c => {
      if (c.id !== conversationId) return c;
      return { ...c, messages: [...c.messages, newMsg], lastActivity: Date.now() };
    }));
    playSound("send");

    // Simulate delivery then read
    setTimeout(() => {
      setConversations(prev => prev.map(c => {
        if (c.id !== conversationId) return c;
        return { ...c, messages: c.messages.map(m => m.id === newMsg.id ? { ...m, status: "delivered" as const } : m) };
      }));
    }, 800);

    // Trigger typing indicator then auto-reply
    const partner = conversations.find(c => c.id === conversationId)?.participantIds.find(id => id !== currentUser.id);
    if (partner) {
      setTimeout(() => setTypingInChat(conversationId), 1200);
      setTimeout(() => {
        setTypingInChat(null);
        const reply = type === "image"
          ? ["Wow, great photo! 📸", "Love this!", "Amazing shot! 🔥", "Nice one!"][Math.floor(Math.random() * 4)]
          : botReplies[Math.floor(Math.random() * botReplies.length)];
        const replyMsg: Message = {
          id: `msg_${Date.now()}_reply`,
          conversationId, senderId: partner, content: reply, type: "text",
          timestamp: Date.now(), status: "read",
        };
        setConversations(prev => prev.map(c => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            messages: c.messages.map(m => m.senderId === currentUser.id ? { ...m, status: "read" as const } : m).concat(replyMsg),
            lastActivity: Date.now(),
          };
        }));
        playSound("receive");
      }, 2500 + Math.random() * 1500);
    }
  }, [currentUser, conversations, playSound]);

  const startConversation = useCallback((participantIds: string[]): string => {
    if (!currentUser) return "";
    const allIds = [...new Set([currentUser.id, ...participantIds])];
    const existing = conversations.find(c => {
      const a = [...c.participantIds].sort().join(",");
      const b = [...allIds].sort().join(",");
      return a === b;
    });
    if (existing) return existing.id;
    const newConv: Conversation = {
      id: `conv_${Date.now()}`, participantIds: allIds,
      messages: [], unreadCount: 0, lastActivity: Date.now(), pinned: false,
    };
    setConversations(prev => [...prev, newConv]);
    return newConv.id;
  }, [currentUser, conversations]);

  const sendFriendRequest = useCallback((toUserId: string) => {
    if (!currentUser) return;
    const existing = friendRequests.find(r =>
      (r.fromUserId === currentUser.id && r.toUserId === toUserId) ||
      (r.fromUserId === toUserId && r.toUserId === currentUser.id)
    );
    if (existing) return;
    const newReq: FriendRequest = {
      id: `fr_${Date.now()}`, fromUserId: currentUser.id, toUserId,
      timestamp: Date.now(), status: "pending",
    };
    setFriendRequests(prev => [...prev, newReq]);
  }, [currentUser, friendRequests]);

  const respondToFriendRequest = useCallback((requestId: string, accept: boolean) => {
    setFriendRequests(prev => prev.map(r => {
      if (r.id !== requestId) return r;
      return { ...r, status: accept ? "accepted" as const : "declined" as const };
    }));
    if (accept) {
      const req = friendRequests.find(r => r.id === requestId);
      if (req && currentUser) {
        const partnerId = req.fromUserId === currentUser.id ? req.toUserId : req.fromUserId;
        startConversation([partnerId]);
      }
    }
  }, [friendRequests, currentUser, startConversation]);

  const updateProfile = useCallback((updates: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...updates };
    setCurrentUser(updated);
    setUsers(prev => prev.map(u => u.id === currentUser.id ? updated : u));
  }, [currentUser]);

  const setStatus = useCallback((status: PresenceStatus) => {
    updateProfile({ status, lastSeen: Date.now() });
  }, [updateProfile]);

  const toggleDarkMode = useCallback(() => setDarkMode(prev => !prev), []);
  const toggleSound = useCallback(() => setSoundEnabled(prev => !prev), []);

  const markAsRead = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, unreadCount: 0 } : c));
  }, []);

  const deleteConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.filter(c => c.id !== conversationId));
    if (activeConversation?.id === conversationId) setActiveConversation(null);
  }, [activeConversation]);

  const pinConversation = useCallback((conversationId: string) => {
    setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, pinned: !c.pinned } : c));
  }, []);

  const removeContact = useCallback((userId: string) => {
    if (!currentUser) return;
    setFriendRequests(prev => prev.filter(r => {
      const isPair = (r.fromUserId === currentUser.id && r.toUserId === userId) || (r.fromUserId === userId && r.toUserId === currentUser.id);
      return !isPair;
    }));
    setConversations(prev => prev.filter(c => !(c.participantIds.length === 2 && c.participantIds.includes(userId) && c.participantIds.includes(currentUser.id))));
  }, [currentUser]);

  const getConversationPartner = useCallback((conv: Conversation): User | null => {
    if (!currentUser) return null;
    const partnerId = conv.participantIds.find(id => id !== currentUser.id);
    return users.find(u => u.id === partnerId) ?? null;
  }, [currentUser, users]);

  const setActiveConversationById = useCallback((id: string | null) => {
    if (!id) { setActiveConversation(null); return; }
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      setActiveConversation(conv);
      markAsRead(id);
    }
  }, [conversations, markAsRead]);

  // Keep active conversation in sync
  useEffect(() => {
    if (activeConversation) {
      const updated = conversations.find(c => c.id === activeConversation.id);
      if (updated) setActiveConversation(updated);
    }
  }, [conversations, activeConversation?.id]);

  return (
    <ChatContext.Provider value={{
      currentUser, users, conversations, friendRequests, darkMode, soundEnabled,
      activeConversation, typingInChat,
      login, register, logout, switchUser, sendMessage, startConversation,
      sendFriendRequest, respondToFriendRequest, updateProfile, setStatus,
      toggleDarkMode, toggleSound, setActiveConversation: setActiveConversationById,
      markAsRead, deleteConversation, pinConversation, removeContact,
      playSound, getConversationPartner, getFriendIds,
    }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}
