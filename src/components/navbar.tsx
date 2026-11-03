import { useState } from "react";
import { MessageCircleIcon } from "@animateicons/react/lucide";
import { useIconHover } from "@animateicons/react";
import { motion, AnimatePresence } from "motion/react";
import BottomMenu from "@/components/ui/bottom-menu";
import ChatbotPanel from "@/components/ChatbotPanel";
import { cn } from "@/lib/utils";

function ChatBubbleButton({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const { ref, triggerProps } = useIconHover({ trigger: "hover" });

  return (
    <motion.button
      type="button"
      aria-label={open ? "Close chat assistant" : "Open chat assistant"}
      aria-expanded={open}
      initial={{ opacity: 0, scale: 0.85, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      whileHover={{ scale: 1.06 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={cn(
        "relative grid size-14 place-items-center rounded-full border border-border bg-background/95 text-foreground shadow-[0_12px_40px_-12px_rgba(0,0,0,0.45)] backdrop-blur-xl transition-colors",
        open ? "bg-accent" : "hover:bg-muted",
      )}
      onMouseEnter={triggerProps.onMouseEnter}
      onMouseLeave={triggerProps.onMouseLeave}
      onClick={onToggle}
    >
      <MessageCircleIcon
        ref={ref}
        size={24}
        className={open ? "text-foreground" : "text-muted-foreground"}
      />
      <span className="absolute -right-0.5 -top-0.5 flex size-3.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        <span className="relative inline-flex size-3.5 rounded-full border-2 border-card bg-emerald-500" />
      </span>
    </motion.button>
  );
}

export default function Navbar() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center">
        <div className="pointer-events-auto">
          <BottomMenu onOpenChat={() => setChatOpen(true)} />
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-6 right-4 z-40 flex flex-col items-end gap-3">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              key="chat-panel"
              initial={{ opacity: 0, y: 12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto"
            >
              <ChatbotPanel open onClose={() => setChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>
        <div className="pointer-events-auto">
          <ChatBubbleButton
            open={chatOpen}
            onToggle={() => setChatOpen((value) => !value)}
          />
        </div>
      </div>
    </>
  );
}
