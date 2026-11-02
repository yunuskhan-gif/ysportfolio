import WhatsAppChat from "@/components/chat/WhatsAppChat";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community Chat | YS Portfolio",
  description: "Real-time community chat box for all portfolio users and traders.",
};

export default function ChatPage() {
  return (
    <div className="p-2 sm:p-4 md:p-6 w-full">
      <WhatsAppChat />
    </div>
  );
}

