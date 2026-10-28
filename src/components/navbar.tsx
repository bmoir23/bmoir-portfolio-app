import { useState } from "react";
import BottomMenu from "@/components/ui/bottom-menu";
import ChatbotPanel from "@/components/ChatbotPanel";

export default function Navbar() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 flex justify-center">
        <div className="pointer-events-auto">
          <BottomMenu onOpenChat={() => setChatOpen(true)} />
        </div>
      </div>

      <div className="pointer-events-auto fixed bottom-24 right-4 z-40">
        <ChatbotPanel open={chatOpen} onClose={() => setChatOpen(false)} />
      </div>
    </>
  );
}
