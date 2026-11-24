import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import BottomMenu from "@/components/ui/bottom-menu";
import {
  ChatPanelBoundary,
  ChatPanelSkeleton,
} from "@/components/chat-panel-boundary";

const ChatbotPanel = lazy(() => import("@/components/ChatbotPanel"));

export default function Navbar() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      {/*
        Fixed dock: promote to its own layer and avoid filter/blur animations on
        children so iOS Safari doesn't "stick" the bar during scroll.
      */}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center"
        style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
      >
        <div className="pointer-events-auto">
          <BottomMenu onOpenChat={() => setChatOpen(true)} />
        </div>
      </div>

      <div className="pointer-events-none fixed bottom-24 right-4 z-40 flex flex-col items-end">
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
              <ChatPanelBoundary onClose={() => setChatOpen(false)}>
                <Suspense fallback={<ChatPanelSkeleton />}>
                  <ChatbotPanel open onClose={() => setChatOpen(false)} />
                </Suspense>
              </ChatPanelBoundary>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
