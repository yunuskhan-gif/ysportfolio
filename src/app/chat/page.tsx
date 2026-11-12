import WhatsAppChat from "@/components/chat/WhatsAppChat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Chat | YS Portfolio",
  description: "Real-time community chat box for all portfolio users and traders.",
};

export default function ChatPage() {
  return (
    <div className="w-full max-w-full p-0 sm:p-2">
      <WhatsAppChat />
    </div>
  );
}

