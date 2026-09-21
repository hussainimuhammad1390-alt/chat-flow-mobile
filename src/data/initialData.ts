import type { User, Conversation, FriendRequest, Message } from "../types";

const now = Date.now();
const min = 60_000;
const hr = 60 * min;
const day = 24 * hr;

export const seedUsers: User[] = [
  {
    id: "u1", email: "alex@pulsechat.io", password: "demo1234",
    displayName: "Alex Rivera", username: "alexr",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Alex&backgroundColor=c0aede",
    bio: "Product designer @ Spotify. Coffee enthusiast ☕",
    phone: "+1 (555) 234-8901", status: "online", statusText: "Available",
    lastSeen: now, createdAt: now - 90 * day,
  },
  {
    id: "u2", email: "sam@pulsechat.io", password: "demo1234",
    displayName: "Sam Taylor", username: "samt",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Sam&backgroundColor=ffdfbf",
    bio: "Full-stack dev. Open source contributor. 🚀",
    phone: "+1 (555) 345-6789", status: "online", statusText: "At work",
    lastSeen: now - 2 * min, createdAt: now - 80 * day,
  },
  {
    id: "u3", email: "jordan@pulsechat.io", password: "demo1234",
    displayName: "Dev Jordan", username: "devj",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Jordan&backgroundColor=d1ecdd",
    bio: "Mobile engineer. React Native & Flutter. 📱",
    phone: "+1 (555) 456-0123", status: "away", statusText: "In a meeting",
    lastSeen: now - 30 * min, createdAt: now - 70 * day,
  },
  {
    id: "u4", email: "maya@pulsechat.io", password: "demo1234",
    displayName: "Maya Chen", username: "mayac",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Maya&backgroundColor=ffd5dc",
    bio: "UX researcher. Dog mom to Biscuit 🐕",
    phone: "+1 (555) 567-8901", status: "busy", statusText: "Do not disturb",
    lastSeen: now - 1 * hr, createdAt: now - 60 * day,
  },
  {
    id: "u5", email: "liam@pulsechat.io", password: "demo1234",
    displayName: "Liam O'Brien", username: "liamob",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Liam&backgroundColor=cce5f7",
    bio: "Startup founder. Building the future of remote work.",
    phone: "+1 (555) 678-9012", status: "offline", statusText: "",
    lastSeen: now - 4 * hr, createdAt: now - 50 * day,
  },
  {
    id: "u6", email: "zara@pulsechat.io", password: "demo1234",
    displayName: "Zara Williams", username: "zaraw",
    avatar: "https://api.dicebear.com/9.x/notionists/svg?seed=Zara&backgroundColor=e8d5f5",
    bio: "Data scientist. ML enthusiast. Cat person 🐱",
    phone: "+1 (555) 789-0123", status: "online", statusText: "Available",
    lastSeen: now, createdAt: now - 45 * day,
  },
];

const msg = (id: string, convId: string, senderId: string, content: string, type: "text" | "image", ts: number, status: Message["status"] = "read", reaction?: string): Message => ({
  id, conversationId: convId, senderId, content, type, timestamp: ts, status, reaction,
});

export const seedConversations: Conversation[] = [
  {
    id: "c1", participantIds: ["u1", "u2"], unreadCount: 2, lastActivity: now - 3 * min, pinned: true,
    messages: [
      msg("m1", "c1", "u1", "Hey Sam! Did you see the new design system update?", "text", now - 2 * hr),
      msg("m2", "c1", "u2", "Yes! The new token structure is so much cleaner 🔥", "text", now - 118 * min),
      msg("m3", "c1", "u1", "Right? I already started migrating our components", "text", now - 115 * min),
      msg("m4", "c1", "u2", "Nice. Can you share the Figma file when you're done?", "text", now - 60 * min),
      msg("m5", "c1", "u1", "Here's a preview of the new button variants", "image", now - 30 * min),
      msg("m6", "c1", "u2", "These look amazing! Love the subtle shadows", "text", now - 5 * min, "delivered"),
      msg("m7", "c1", "u2", "Can we sync tomorrow about the component library?", "text", now - 3 * min, "delivered"),
    ],
  },
  {
    id: "c2", participantIds: ["u1", "u3"], unreadCount: 0, lastActivity: now - 2 * hr, pinned: false,
    messages: [
      msg("m8", "c2", "u3", "Alex, the React Native build is passing now!", "text", now - 5 * hr),
      msg("m9", "c2", "u1", "Awesome! What was the issue?", "text", now - 4.5 * hr),
      msg("m10", "c2", "u3", "Turns out it was a Metro bundler cache issue. Had to clear and rebuild", "text", now - 4 * hr),
      msg("m11", "c2", "u1", "Classic 😄 Thanks for sorting it out", "text", now - 3.5 * hr),
      msg("m12", "c2", "u3", "No problem! Let me know if you want me to add the animation library too", "text", now - 2 * hr),
    ],
  },
  {
    id: "c3", participantIds: ["u1", "u4"], unreadCount: 1, lastActivity: now - 1 * hr, pinned: false,
    messages: [
      msg("m13", "c3", "u4", "I finished the user research report. Want me to send the summary?", "text", now - 4 * hr),
      msg("m14", "c3", "u1", "Yes please! The team meeting is at 3pm", "text", now - 3.5 * hr),
      msg("m15", "c3", "u4", "Great, here are the key findings from the usability tests", "image", now - 2 * hr),
      msg("m16", "c3", "u4", "The task completion rate improved by 34% with the new flow", "text", now - 1 * hr, "delivered"),
    ],
  },
  {
    id: "c4", participantIds: ["u1", "u6"], unreadCount: 0, lastActivity: now - 1 * day, pinned: false,
    messages: [
      msg("m17", "c4", "u6", "Hey Alex! Loved your talk at the design meetup 🎤", "text", now - 1.5 * day),
      msg("m18", "c4", "u1", "Thanks Zara! How was the ML workshop?", "text", now - 1.4 * day),
      msg("m19", "c4", "u6", "Mind-blowing. I'm now trying to build a recommendation engine for our chat app", "text", now - 1.3 * day),
      msg("m20", "c4", "u1", "That's so cool. Let me know if you need any UX input", "text", now - 1 * day),
    ],
  },
  {
    id: "c5", participantIds: ["u2", "u3", "u4", "u5", "u6"], unreadCount: 3, lastActivity: now - 15 * min, pinned: false,
    messages: [
      msg("m21", "c5", "u5", "Team standup moved to 10am tomorrow!", "text", now - 3 * hr),
      msg("m22", "c5", "u2", "Works for me 👍", "text", now - 2.5 * hr),
      msg("m23", "c5", "u3", "Can we push it to 10:30? I have a dentist appointment", "text", now - 2 * hr),
      msg("m24", "c5", "u5", "Done, 10:30 it is", "text", now - 1.5 * hr),
      msg("m25", "c5", "u6", "Also, I pushed the new analytics dashboard to staging", "text", now - 1 * hr),
      msg("m26", "c5", "u4", "Looking great! One small suggestion on the chart colors", "text", now - 30 * min, "delivered"),
      msg("m27", "c5", "u2", "Agreed, maybe use the indigo palette?", "text", now - 20 * min, "delivered"),
      msg("m28", "c5", "u3", "I can update the theme tokens tonight", "text", now - 15 * min, "delivered"),
    ],
  },
];

export const seedFriendRequests: FriendRequest[] = [
  { id: "fr1", fromUserId: "u5", toUserId: "u1", timestamp: now - 2 * hr, status: "pending" },
  { id: "fr2", fromUserId: "u1", toUserId: "u6", timestamp: now - 1 * day, status: "pending" },
];

export const botReplies: string[] = [
  "That sounds great! Let me think about it 🤔",
  "Absolutely, I'll get back to you on that",
  "Haha, nice one! 😄",
  "Interesting point. I hadn't considered that angle",
  "Let's sync up later today to discuss more",
  "I'm on it! Should have something by end of day",
  "That's exactly what I was thinking too!",
  "Can you send me more details on that?",
  "Perfect, thanks for the heads up 🙌",
  "I'll review and give you feedback soon",
  "Great idea! Let's prototype it this sprint",
  "Hmm, let me check with the team first",
  "Sounds like a plan! Count me in",
  "Nice work! The progress is really showing",
  "I love that approach. Very clean solution",
];

export const sampleImages: string[] = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80",
  "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=600&q=80",
  "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&q=80",
  "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80",
  "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=600&q=80",
  "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&q=80",
];

export const statusPresets = ["Available", "At work", "In a meeting", "Commuting", "Gym", "Do not disturb", "Out of office"];

export const quickEmojis = ["👍", "❤️", "😂", "🔥", "🎉", "😮", "😢", "🙌"];
