export type PresenceStatus = "online" | "busy" | "away" | "offline";

export interface User {
  id: string;
  email: string;
  password: string;
  displayName: string;
  username: string;
  avatar: string;
  bio: string;
  phone: string;
  status: PresenceStatus;
  statusText: string;
  lastSeen: number;
  createdAt: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: "text" | "image";
  timestamp: number;
  status: "sent" | "delivered" | "read";
  reaction?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  messages: Message[];
  unreadCount: number;
  lastActivity: number;
  pinned: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  toUserId: string;
  timestamp: number;
  status: "pending" | "accepted" | "declined";
}

export type Screen = "auth" | "chats" | "contacts" | "profile" | "chat";

export interface AppState {
  currentUser: User | null;
  users: User[];
  conversations: Conversation[];
  friendRequests: FriendRequest[];
  darkMode: boolean;
  soundEnabled: boolean;
}
