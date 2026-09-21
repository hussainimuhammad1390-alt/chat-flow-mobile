import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Plus, LogOut, Camera, Moon, Sun, Volume2, VolumeX, UserPlus, Check, X, MessageCircle, Trash2, Pin, PinOff, Edit3, ChevronDown } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { Header } from "./Navigation";
import { statusPresets } from "../data/initialData";
import type { PresenceStatus } from "../types";

const fadeSlide = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -12 }, transition: { duration: 0.2 } };

/* ─── AUTH SCREEN ─────────────────────────────────────────── */
export function AuthScreen() {
  const { login, register, switchUser, users } = useChat();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (mode === "login") {
      const res = login(email, password);
      if (!res.success) setError(res.error ?? "Login failed");
    } else {
      if (!displayName.trim() || !username.trim() || !email.trim() || password.length < 6) {
        setError("Fill all fields. Password min 6 chars.");
        return;
      }
      const res = register(email, password, displayName, username);
      if (!res.success) setError(res.error ?? "Registration failed");
    }
  };

  const demoUsers = users.slice(0, 4);

  return (
    <div className="flex flex-col h-full overflow-y-auto px-6 pt-16 pb-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/25">
            <MessageCircle size={28} className="text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">PulseChat</h1>
          <p className="mt-1 text-sm text-muted-foreground">Connect. Chat. Stay in sync.</p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl bg-secondary p-1 mb-6">
          {(["login", "register"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }}
              className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${mode === m ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <input type="text" placeholder="Display name" value={displayName} onChange={e => setDisplayName(e.target.value)}
                className="rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
              <input type="text" placeholder="Username" value={username} onChange={e => setUsername(e.target.value)}
                className="rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            </div>
          )}
          <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)}
            className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
            className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit" className="w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.98] transition-transform">
            {mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <div className="mt-8">
          <p className="text-center text-xs text-muted-foreground mb-3">Quick demo access</p>
          <div className="grid grid-cols-2 gap-2">
            {demoUsers.map(u => (
              <button key={u.id} onClick={() => switchUser(u.id)}
                className="flex items-center gap-2 rounded-xl border border-border bg-card p-2.5 hover:border-primary/40 hover:bg-primary/5 transition-all active:scale-[0.97]">
                <img src={u.avatar} alt={u.displayName} className="h-8 w-8 rounded-full" />
                <span className="text-xs font-medium truncate">{u.displayName.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ─── CHATS SCREEN ────────────────────────────────────────── */
export function ChatsScreen({ onOpenChat }: { onOpenChat: (id: string) => void }) {
  const { currentUser, conversations, users, getConversationPartner, deleteConversation, pinConversation } = useChat();
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState<string | null>(null);

  const myConvs = conversations
    .filter(c => currentUser && c.participantIds.includes(currentUser.id))
    .filter(c => {
      if (!search) return true;
      const partner = getConversationPartner(c);
      const lastMsg = c.messages[c.messages.length - 1];
      return (partner?.displayName.toLowerCase().includes(search.toLowerCase()) || lastMsg?.content.toLowerCase().includes(search.toLowerCase()));
    })
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || b.lastActivity - a.lastActivity);

  const onlineFriends = users.filter(u => u.id !== currentUser?.id && u.status === "online");

  return (
    <div className="flex flex-col h-full">
      <Header title="Chats" rightAction={
        <button className="rounded-full p-2 hover:bg-secondary transition-colors">
          <Plus size={20} className="text-primary" />
        </button>
      } />
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search conversations..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl bg-secondary py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>

      {/* Online avatars row */}
      <div className="flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-none">
        {onlineFriends.map(u => (
          <button key={u.id} onClick={() => {
            const conv = conversations.find(c => c.participantIds.includes(u.id) && c.participantIds.includes(currentUser?.id ?? ""));
            if (conv) onOpenChat(conv.id);
          }} className="flex flex-col items-center gap-1 min-w-[56px]">
            <div className="relative">
              <img src={u.avatar} alt={u.displayName} className="h-12 w-12 rounded-full ring-2 ring-primary/30" />
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
            </div>
            <span className="text-[10px] text-muted-foreground truncate w-14 text-center">{u.displayName.split(" ")[0]}</span>
          </button>
        ))}
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence>
          {myConvs.map(conv => {
            const partner = getConversationPartner(conv);
            const lastMsg = conv.messages[conv.messages.length - 1];
            if (!partner) return null;
            return (
              <motion.div key={conv.id} {...fadeSlide} className="relative">
                <button onClick={() => onOpenChat(conv.id)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-secondary/50 active:bg-secondary transition-colors">
                  <div className="relative shrink-0">
                    <img src={partner.avatar} alt={partner.displayName} className="h-12 w-12 rounded-full" />
                    {partner.status === "online" && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold truncate">{partner.displayName}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 ml-2">
                        {formatTime(conv.lastActivity)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-0.5">
                      <span className={`text-xs truncate ${conv.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {lastMsg?.type === "image" ? "📷 Photo" : lastMsg?.content ?? "No messages yet"}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span className="ml-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <button onClick={() => setMenuOpen(menuOpen === conv.id ? null : conv.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 opacity-0 hover:opacity-100 group-hover:opacity-100 transition-opacity">
                  <Edit3 size={14} className="text-muted-foreground" />
                </button>
                {menuOpen === conv.id && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-4 top-full z-10 mt-1 rounded-xl border border-border bg-card p-1 shadow-lg">
                    <button onClick={() => { pinConversation(conv.id); setMenuOpen(null); }}
                      className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs hover:bg-secondary">
                      {conv.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                      {conv.pinned ? "Unpin" : "Pin"}
                    </button>
                    <button onClick={() => { deleteConversation(conv.id); setMenuOpen(null); }}
                      className="flex items-center gap-2 w-full rounded-lg px-3 py-2 text-xs text-destructive hover:bg-destructive/10">
                      <Trash2 size={14} /> Delete
                    </button>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        {myConvs.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageCircle size={48} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No conversations yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">Find contacts to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── CONTACTS SCREEN ─────────────────────────────────────── */
export function ContactsScreen({ onOpenChat }: { onOpenChat: (id: string) => void }) {
  const { currentUser, users, friendRequests, conversations, sendFriendRequest, respondToFriendRequest, removeContact, startConversation, getFriendIds } = useChat();
  const [tab, setTab] = useState<"friends" | "requests" | "discover">("friends");
  const [search, setSearch] = useState("");

  const friendIds = getFriendIds();
  const friends = users.filter(u => u.id !== currentUser?.id && friendIds.includes(u.id));
  const incomingReqs = friendRequests.filter(r => r.toUserId === currentUser?.id && r.status === "pending");
  const sentReqs = friendRequests.filter(r => r.fromUserId === currentUser?.id && r.status === "pending");
  const discoverable = users.filter(u => u.id !== currentUser?.id && !friendIds.includes(u.id) && !friendRequests.some(r => (r.fromUserId === currentUser?.id && r.toUserId === u.id) || (r.fromUserId === u.id && r.toUserId === currentUser?.id)));

  const filteredFriends = friends.filter(u => !search || u.displayName.toLowerCase().includes(search.toLowerCase()));
  const filteredDiscover = discoverable.filter(u => !search || u.displayName.toLowerCase().includes(search.toLowerCase()) || u.username.toLowerCase().includes(search.toLowerCase()));

  const startChat = (userId: string) => {
    const id = startConversation([userId]);
    if (id) onOpenChat(id);
  };

  return (
    <div className="flex flex-col h-full">
      <Header title="Contacts" />
      <div className="px-4 py-3">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input type="text" placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full rounded-xl bg-secondary py-2.5 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
      </div>
      <div className="flex px-4 gap-1 mb-2">
        {(["friends", "requests", "discover"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-medium capitalize transition-all ${tab === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {t === "requests" ? `Requests${incomingReqs.length > 0 ? ` (${incomingReqs.length})` : ""}` : t}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <AnimatePresence mode="wait">
          {tab === "friends" && (
            <motion.div key="friends" {...fadeSlide}>
              {filteredFriends.map(u => (
                <div key={u.id} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                  <div className="relative shrink-0">
                    <img src={u.avatar} alt={u.displayName} className="h-11 w-11 rounded-full" />
                    {u.status === "online" && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.statusText || `@${u.username}`}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startChat(u.id)} className="rounded-full p-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <MessageCircle size={16} />
                    </button>
                    <button onClick={() => removeContact(u.id)} className="rounded-full p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredFriends.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No friends yet</p>}
            </motion.div>
          )}

          {tab === "requests" && (
            <motion.div key="requests" {...fadeSlide} className="space-y-4">
              {incomingReqs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Incoming</p>
                  {incomingReqs.map(r => {
                    const from = users.find(u => u.id === r.fromUserId);
                    if (!from) return null;
                    return (
                      <div key={r.id} className="flex items-center gap-3 py-2.5">
                        <img src={from.avatar} alt={from.displayName} className="h-10 w-10 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{from.displayName}</p>
                          <p className="text-xs text-muted-foreground">@{from.username}</p>
                        </div>
                        <button onClick={() => respondToFriendRequest(r.id, true)} className="rounded-full p-2 bg-primary text-primary-foreground">
                          <Check size={14} />
                        </button>
                        <button onClick={() => respondToFriendRequest(r.id, false)} className="rounded-full p-2 bg-secondary text-muted-foreground">
                          <X size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
              {sentReqs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sent</p>
                  {sentReqs.map(r => {
                    const to = users.find(u => u.id === r.toUserId);
                    if (!to) return null;
                    return (
                      <div key={r.id} className="flex items-center gap-3 py-2.5">
                        <img src={to.avatar} alt={to.displayName} className="h-10 w-10 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{to.displayName}</p>
                          <p className="text-xs text-muted-foreground">Request pending</p>
                        </div>
                        <span className="text-xs text-muted-foreground">Sent</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {incomingReqs.length === 0 && sentReqs.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">No pending requests</p>
              )}
            </motion.div>
          )}

          {tab === "discover" && (
            <motion.div key="discover" {...fadeSlide}>
              {filteredDiscover.map(u => (
                <div key={u.id} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
                  <div className="relative shrink-0">
                    <img src={u.avatar} alt={u.displayName} className="h-11 w-11 rounded-full" />
                    {u.status === "online" && <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-background" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{u.bio}</p>
                  </div>
                  <button onClick={() => sendFriendRequest(u.id)}
                    className="rounded-full p-2 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                    <UserPlus size={16} />
                  </button>
                </div>
              ))}
              {filteredDiscover.length === 0 && <p className="text-center text-sm text-muted-foreground py-8">No users found</p>}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ─── PROFILE SCREEN ──────────────────────────────────────── */
export function ProfileScreen() {
  const { currentUser, users, darkMode, toggleDarkMode, soundEnabled, toggleSound, updateProfile, setStatus, logout, switchUser } = useChat();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(currentUser?.displayName ?? "");
  const [bio, setBio] = useState(currentUser?.bio ?? "");
  const [phone, setPhone] = useState(currentUser?.phone ?? "");
  const [statusText, setStatusText] = useState(currentUser?.statusText ?? "");
  const [showStatusPicker, setShowStatusPicker] = useState(false);

  if (!currentUser) return null;

  const saveProfile = () => {
    updateProfile({ displayName: name, bio, phone, statusText });
    setEditing(false);
  };

  const statusColors: Record<PresenceStatus, string> = {
    online: "bg-emerald-500", busy: "bg-red-500", away: "bg-amber-500", offline: "bg-gray-400",
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <Header title="Profile" rightAction={
        <button onClick={logout} className="rounded-full p-2 hover:bg-secondary transition-colors">
          <LogOut size={18} className="text-muted-foreground" />
        </button>
      } />

      <div className="flex flex-col items-center pt-6 pb-4 px-6">
        <div className="relative">
          <img src={currentUser.avatar} alt={currentUser.displayName} className="h-24 w-24 rounded-full ring-4 ring-primary/20" />
          <span className={`absolute bottom-1 right-1 h-5 w-5 rounded-full ring-[3px] ring-background ${statusColors[currentUser.status]}`} />
          <button className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1.5 shadow-md">
            <Camera size={14} className="text-primary-foreground" />
          </button>
        </div>
        <h2 className="mt-3 text-lg font-bold">{currentUser.displayName}</h2>
        <p className="text-sm text-muted-foreground">@{currentUser.username}</p>
        {currentUser.bio && <p className="mt-1 text-sm text-center text-muted-foreground">{currentUser.bio}</p>}
      </div>

      {/* Status picker */}
      <div className="px-6 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Status</p>
        <div className="flex gap-2">
          {(["online", "busy", "away", "offline"] as PresenceStatus[]).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-all ${currentUser.status === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              <span className={`h-2 w-2 rounded-full ${statusColors[s]}`} />
              {s}
            </button>
          ))}
        </div>
        <button onClick={() => setShowStatusPicker(!showStatusPicker)} className="mt-2 flex items-center gap-1 text-xs text-primary">
          {currentUser.statusText || "Set status text"} <ChevronDown size={12} />
        </button>
        {showStatusPicker && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 flex flex-wrap gap-2">
            {statusPresets.map(s => (
              <button key={s} onClick={() => { updateProfile({ statusText: s }); setShowStatusPicker(false); }}
                className={`rounded-full px-3 py-1 text-xs ${statusText === s ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {s}
              </button>
            ))}
          </motion.div>
        )}
      </div>

      {/* Settings */}
      <div className="px-6 mb-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Settings</p>
        <div className="space-y-1">
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon size={16} className="text-primary" /> : <Sun size={16} className="text-amber-500" />}
              <span className="text-sm">Dark Mode</span>
            </div>
            <button onClick={toggleDarkMode} className={`h-6 w-11 rounded-full transition-colors ${darkMode ? "bg-primary" : "bg-muted"}`}>
              <motion.div className="h-5 w-5 rounded-full bg-white shadow-sm" animate={{ x: darkMode ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-secondary/50 px-4 py-3">
            <div className="flex items-center gap-3">
              {soundEnabled ? <Volume2 size={16} className="text-primary" /> : <VolumeX size={16} className="text-muted-foreground" />}
              <span className="text-sm">Sound Effects</span>
            </div>
            <button onClick={toggleSound} className={`h-6 w-11 rounded-full transition-colors ${soundEnabled ? "bg-primary" : "bg-muted"}`}>
              <motion.div className="h-5 w-5 rounded-full bg-white shadow-sm" animate={{ x: soundEnabled ? 22 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }} />
            </button>
          </div>
        </div>
      </div>

      {/* Edit profile */}
      <div className="px-6 mb-4">
        {!editing ? (
          <button onClick={() => setEditing(true)} className="flex items-center gap-2 w-full rounded-xl border border-border px-4 py-3 text-sm hover:bg-secondary transition-colors">
            <Edit3 size={16} className="text-primary" /> Edit Profile
          </button>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Display name"
              className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <input value={bio} onChange={e => setBio(e.target.value)} placeholder="Bio"
              className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone"
              className="w-full rounded-xl border border-input bg-secondary/50 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/40" />
            <div className="flex gap-2">
              <button onClick={saveProfile} className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground">Save</button>
              <button onClick={() => setEditing(false)} className="flex-1 rounded-xl bg-secondary py-2.5 text-sm font-medium text-muted-foreground">Cancel</button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Switch account */}
      <div className="px-6 pb-8">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Switch Account</p>
        <div className="space-y-2">
          {users.filter(u => u.id !== currentUser.id).slice(0, 4).map(u => (
            <button key={u.id} onClick={() => switchUser(u.id)}
              className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 hover:bg-secondary transition-colors">
              <img src={u.avatar} alt={u.displayName} className="h-9 w-9 rounded-full" />
              <div className="text-left flex-1">
                <p className="text-sm font-medium">{u.displayName}</p>
                <p className="text-xs text-muted-foreground">@{u.username}</p>
              </div>
              <span className={`h-2 w-2 rounded-full ${statusColors[u.status]}`} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── HELPERS ─────────────────────────────────────────────── */
function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  if (diff < 60_000) return "now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h`;
  if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d`;
  return new Date(ts).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}
