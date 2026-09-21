import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChatProvider, useChat } from "./context/ChatContext";
import { BottomNav, FrameToggle } from "./components/Navigation";
import { AuthScreen, ChatsScreen, ContactsScreen, ProfileScreen } from "./components/Screens";
import { ChatView } from "./components/ChatView";
import { Toaster } from "sonner";

function AppInner() {
  const { currentUser, activeConversation, setActiveConversation } = useChat();
  const [activeTab, setActiveTab] = useState<"chats" | "contacts" | "profile">("chats");
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  const openChat = (id: string) => setActiveConversation(id);
  const closeChat = () => setActiveConversation(null);

  if (!currentUser) {
    return (
      <div className="h-full">
        <AuthScreen />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <AnimatePresence mode="wait">
        {activeConversation ? (
          <motion.div key="chatview" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 350, damping: 35 }}
            className="absolute inset-0 z-50 bg-background">
            <ChatView onBack={closeChat} />
          </motion.div>
        ) : (
          <motion.div key={activeTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
            className="flex-1 overflow-hidden">
            {activeTab === "chats" && <ChatsScreen onOpenChat={openChat} />}
            {activeTab === "contacts" && <ContactsScreen onOpenChat={openChat} />}
            {activeTab === "profile" && <ProfileScreen />}
          </motion.div>
        )}
      </AnimatePresence>
      {!activeConversation && <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />}
    </div>
  );
}

function App() {
  const [isMobileFrame, setIsMobileFrame] = useState(true);

  return (
    <ChatProvider>
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <FrameToggle isMobileFrame={isMobileFrame} onToggle={() => setIsMobileFrame(p => !p)} />
        <div className={
          isMobileFrame
            ? "relative h-[812px] w-[390px] overflow-hidden rounded-[40px] border-[8px] border-zinc-900 bg-background shadow-2xl shadow-black/20 max-lg:h-screen max-lg:w-full max-lg:rounded-none max-lg:border-0 max-lg:shadow-none"
            : "relative h-screen w-full overflow-hidden bg-background"
        }>
          <AppInner />
        </div>
      </div>
      <Toaster position="top-center" richColors closeButton />
    </ChatProvider>
  );
}

export default App;
