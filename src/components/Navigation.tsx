import { motion } from "framer-motion";
import { MessageCircle, Users, User, ChevronLeft, Search, MoreVertical, Moon, Sun, MonitorSmartphone, Maximize2 } from "lucide-react";
import { useChat } from "../context/ChatContext";

interface BottomNavProps {
  activeTab: "chats" | "contacts" | "profile";
  onTabChange: (tab: "chats" | "contacts" | "profile") => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const { conversations, currentUser, friendRequests } = useChat();

  const unreadTotal = conversations
    .filter(c => currentUser && c.participantIds.includes(currentUser.id))
    .reduce((sum, c) => sum + c.unreadCount, 0);

  const pendingRequests = currentUser
    ? friendRequests.filter(r => r.toUserId === currentUser.id && r.status === "pending").length
    : 0;

  const tabs = [
    { id: "chats" as const, icon: MessageCircle, label: "Chats", badge: unreadTotal },
    { id: "contacts" as const, icon: Users, label: "Contacts", badge: pendingRequests },
    { id: "profile" as const, icon: User, label: "Profile", badge: 0 },
  ];

  return (
    <nav className="absolute bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="flex items-center justify-around px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-1.5 min-w-[64px]"
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.2 : 1.5}
                  className={isActive ? "text-primary" : "text-muted-foreground"}
                />
                {tab.badge > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1.5 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground"
                  >
                    {tab.badge > 9 ? "9+" : tab.badge}
                  </motion.span>
                )}
              </div>
              <span className={`text-[10px] font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                {tab.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 h-1 w-8 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function Header({ title, showBack, onBack, rightAction }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/50 bg-card/80 px-4 backdrop-blur-xl">
      {showBack && (
        <button onClick={onBack} className="rounded-full p-1.5 hover:bg-secondary transition-colors">
          <ChevronLeft size={20} />
        </button>
      )}
      <h1 className="flex-1 text-[17px] font-semibold tracking-tight">{title}</h1>
      {rightAction}
    </header>
  );
}

export function ChatHeader({ partnerName, partnerAvatar, partnerStatus, onBack, onSearch }: {
  partnerName: string;
  partnerAvatar: string;
  partnerStatus: string;
  onBack: () => void;
  onSearch: () => void;
}) {
  const isOnline = partnerStatus === "online";
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b border-border/50 bg-card/80 px-3 backdrop-blur-xl">
      <button onClick={onBack} className="rounded-full p-1.5 hover:bg-secondary transition-colors">
        <ChevronLeft size={20} />
      </button>
      <div className="relative">
        <img src={partnerAvatar} alt={partnerName} className="h-9 w-9 rounded-full object-cover" />
        {isOnline && (
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-card" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">{partnerName}</p>
        <p className={`text-[11px] ${isOnline ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}>
          {isOnline ? "Online" : partnerStatus === "busy" ? "Busy" : partnerStatus === "away" ? "Away" : "Offline"}
        </p>
      </div>
      <button onClick={onSearch} className="rounded-full p-2 hover:bg-secondary transition-colors">
        <Search size={18} className="text-muted-foreground" />
      </button>
      <button className="rounded-full p-2 hover:bg-secondary transition-colors">
        <MoreVertical size={18} className="text-muted-foreground" />
      </button>
    </header>
  );
}

interface FrameToggleProps {
  isMobileFrame: boolean;
  onToggle: () => void;
}

export function FrameToggle({ isMobileFrame, onToggle }: FrameToggleProps) {
  const { darkMode, toggleDarkMode } = useChat();
  return (
    <div className="hidden lg:flex fixed top-4 right-4 z-[100] gap-2">
      <button
        onClick={toggleDarkMode}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-all"
        title="Toggle theme"
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
      </button>
      <button
        onClick={onToggle}
        className="flex h-9 w-9 items-center justify-center rounded-full bg-card border border-border shadow-sm hover:shadow-md transition-all"
        title="Toggle view"
      >
        {isMobileFrame ? <Maximize2 size={16} /> : <MonitorSmartphone size={16} />}
      </button>
    </div>
  );
}
