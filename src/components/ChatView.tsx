import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Image, Smile, X, Check, CheckCheck } from "lucide-react";
import { useChat } from "../context/ChatContext";
import { ChatHeader } from "./Navigation";
import { sampleImages, quickEmojis } from "../data/initialData";
import type { Message } from "../types";

export function ChatView({ onBack }: { onBack: () => void }) {
  const { activeConversation, currentUser, typingInChat, sendMessage, getConversationPartner } = useChat();
  const [input, setInput] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [showImagePicker, setShowImagePicker] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [reactionFor, setReactionFor] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const partner = activeConversation ? getConversationPartner(activeConversation) : null;
  const messages = activeConversation?.messages ?? [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, typingInChat]);

  const handleSend = () => {
    if (!input.trim() || !activeConversation) return;
    sendMessage(activeConversation.id, input.trim(), "text");
    setInput("");
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const handleImageSend = (url: string) => {
    if (!activeConversation) return;
    sendMessage(activeConversation.id, url, "image");
    setShowImagePicker(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation || !partner) return null;

  return (
    <div className="flex flex-col h-full bg-background">
      <ChatHeader
        partnerName={partner.displayName}
        partnerAvatar={partner.avatar}
        partnerStatus={partner.status}
        onBack={onBack}
        onSearch={() => {}}
      />

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.map((msg, i) => {
          const isMine = msg.senderId === currentUser?.id;
          const showAvatar = !isMine && (i === 0 || messages[i - 1]?.senderId !== msg.senderId);
          const showTime = i === 0 || msg.timestamp - messages[i - 1].timestamp > 300_000;
          return (
            <div key={msg.id}>
              {showTime && (
                <div className="flex items-center justify-center my-3">
                  <span className="rounded-full bg-secondary px-3 py-1 text-[10px] text-muted-foreground">
                    {formatMsgTime(msg.timestamp)}
                  </span>
                </div>
              )}
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.2 }}
                className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}
              >
                {!isMine && showAvatar && (
                  <img src={partner.avatar} alt="" className="h-7 w-7 rounded-full shrink-0 mb-1" />
                )}
                {!isMine && !showAvatar && <div className="w-7 shrink-0" />}
                <div className="relative group">
                  <div
                    onDoubleClick={() => setReactionFor(reactionFor === msg.id ? null : msg.id)}
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-secondary text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.type === "image" ? (
                      <button onClick={() => setLightbox(msg.content)} className="block">
                        <img src={msg.content} alt="Shared" className="rounded-xl max-h-48 w-full object-cover" />
                      </button>
                    ) : (
                      <p>{msg.content}</p>
                    )}
                    <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                      <span className={`text-[9px] ${isMine ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      {isMine && <MsgStatus status={msg.status} />}
                    </div>
                  </div>
                  {msg.reaction && (
                    <span className="absolute -bottom-2 right-2 rounded-full bg-card border border-border px-1.5 py-0.5 text-xs shadow-sm">
                      {msg.reaction}
                    </span>
                  )}
                  {/* Reaction picker */}
                  <AnimatePresence>
                    {reactionFor === msg.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1 rounded-full bg-card border border-border px-2 py-1 shadow-lg"
                      >
                        {quickEmojis.slice(0, 5).map(emoji => (
                          <button key={emoji} onClick={() => setReactionFor(null)}
                            className="text-base hover:scale-125 transition-transform">
                            {emoji}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* Typing indicator */}
        <AnimatePresence>
          {typingInChat === activeConversation.id && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-end gap-2">
              <img src={partner.avatar} alt="" className="h-7 w-7 rounded-full" />
              <div className="rounded-2xl rounded-bl-md bg-secondary px-4 py-3">
                <div className="flex gap-1">
                  <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/50" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/50" />
                  <span className="typing-dot h-2 w-2 rounded-full bg-muted-foreground/50" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Image picker drawer */}
      <AnimatePresence>
        {showImagePicker && (
          <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }}
            className="border-t border-border bg-card p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium">Share a photo</p>
              <button onClick={() => setShowImagePicker(false)}><X size={16} className="text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {sampleImages.map((url, i) => (
                <button key={i} onClick={() => handleImageSend(url)} className="rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all">
                  <img src={url} alt="" className="h-20 w-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji picker */}
      <AnimatePresence>
        {showEmoji && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="border-t border-border bg-card px-4 py-3">
            <div className="grid grid-cols-8 gap-2">
              {["😀","😂","🥰","😎","🤔","👍","🔥","❤️","🎉","✨","💯","🙌","😢","😡","🤯","👀","🫡","🤝","💪","🌈","⭐","🍕","☕","🎵"].map(e => (
                <button key={e} onClick={() => { setInput(prev => prev + e); inputRef.current?.focus(); }}
                  className="text-xl hover:scale-125 transition-transform text-center">
                  {e}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <div className="sticky bottom-0 border-t border-border/50 bg-card/80 backdrop-blur-xl px-3 py-2">
        <div className="flex items-end gap-2">
          <button onClick={() => { setShowEmoji(!showEmoji); setShowImagePicker(false); }}
            className="rounded-full p-2 hover:bg-secondary transition-colors shrink-0">
            <Smile size={20} className={showEmoji ? "text-primary" : "text-muted-foreground"} />
          </button>
          <button onClick={() => { setShowImagePicker(!showImagePicker); setShowEmoji(false); }}
            className="rounded-full p-2 hover:bg-secondary transition-colors shrink-0">
            <Image size={20} className={showImagePicker ? "text-primary" : "text-muted-foreground"} />
          </button>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-2xl bg-secondary px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 max-h-32"
            style={{ minHeight: "40px" }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={!input.trim()}
            className="rounded-full bg-primary p-2.5 text-primary-foreground shadow-md shadow-primary/20 disabled:opacity-40 disabled:shadow-none transition-opacity shrink-0"
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(null)}>
            <motion.img
              initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              src={lightbox} alt="Full view"
              className="max-h-[80vh] max-w-full rounded-2xl object-contain"
              onClick={e => e.stopPropagation()}
            />
            <button onClick={() => setLightbox(null)}
              className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20">
              <X size={20} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MsgStatus({ status }: { status: Message["status"] }) {
  if (status === "sent") return <Check size={12} className="text-primary-foreground/50" />;
  if (status === "delivered") return <CheckCheck size={12} className="text-primary-foreground/50" />;
  return <CheckCheck size={12} className="text-sky-300" />;
}

function formatMsgTime(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - ts;
  if (diff < 86_400_000 && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
  if (diff < 172_800_000) return "Yesterday";
  return d.toLocaleDateString([], { weekday: "short", hour: "2-digit", minute: "2-digit" });
}
