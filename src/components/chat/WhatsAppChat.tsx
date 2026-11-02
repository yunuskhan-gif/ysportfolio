"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  User,
  Users,
  Check,
  CheckCheck,
  Smile,
  MessageSquare,
  Sparkles,
  RefreshCw,
  Search,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  avatarColor?: string;
  createdAt: string;
}

const USER_COLORS: Record<string, string> = {
  main: "bg-emerald-600 text-white",
  admin: "bg-indigo-600 text-white",
  demo: "bg-amber-600 text-white",
};

const getRandomColor = (name: string) => {
  if (USER_COLORS[name.toLowerCase()]) return USER_COLORS[name.toLowerCase()];
  const colors = [
    "bg-sky-600 text-white",
    "bg-pink-600 text-white",
    "bg-purple-600 text-white",
    "bg-orange-600 text-white",
    "bg-teal-600 text-white",
    "bg-blue-600 text-white",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export default function WhatsAppChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentUser, setCurrentUser] = useState<string>("you");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (data.currentUser) {
          setCurrentUser(data.currentUser);
        }
      }
    } catch (err) {
      console.error("Failed to load chat messages", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Live poll every 3s
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const text = inputValue.trim();
    if (!text || sending) return;

    setSending(true);
    // Optimistic message
    const tempId = "temp-" + Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: currentUser,
      message: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputValue("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) => (m.id === tempId ? data.message : m))
        );
      } else {
        // Rollback if error
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter((m) =>
    searchQuery
      ? m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)] max-w-6xl mx-auto rounded-2xl overflow-hidden border border-border/80 shadow-2xl bg-card">
      {/* Sidebar: Chat Group / Community Info */}
      <div className="hidden md:flex w-80 border-r border-border/60 bg-muted/20 flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border/60 flex items-center justify-between bg-muted/40">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm leading-tight">YS Traders Lounge</h2>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Public Group Chat
              </p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border/40">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs rounded-lg bg-background/60"
            />
          </div>
        </div>

        {/* Group Info Box */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-card border border-border/60 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Community Chatroom
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect and share trade ideas, market discussions, portfolio allocations & queries in real-time with all active users.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/40 bg-background/50 space-y-1.5">
              <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                Logged in as
              </span>
              <div className="flex items-center gap-2">
                <Avatar className="h-7 w-7 text-xs">
                  <AvatarFallback className={getRandomColor(currentUser)}>
                    {currentUser.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xs font-bold leading-none">{currentUser}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Online</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-center text-muted-foreground/80 py-2 border-t border-border/40">
            🔒 End-to-end encrypted portfolio chat
          </div>
        </div>
      </div>

      {/* Main WhatsApp-style Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-[#efeae2] dark:bg-[#0b141a] relative">
        {/* Subtle WhatsApp wallpaper doodle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, currentColor 2%, transparent 0%), radial-gradient(circle at 75px 75px, currentColor 2%, transparent 0%)`,
            backgroundSize: "100px 100px",
          }}
        />

        {/* Chat Header */}
        <div className="h-16 px-4 border-b border-border/40 bg-card/90 backdrop-blur-md z-10 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-emerald-500/40 shadow-sm">
              <AvatarFallback className="bg-emerald-600 text-white font-bold">
                <Users className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm">YS Traders Community</h3>
                <Badge variant="outline" className="text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400">
                  Live
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                All registered users can participate
              </p>
            </div>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={fetchMessages}
            title="Refresh messages"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </Button>
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto p-4 z-10 space-y-3">
          {loading && messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
                <RefreshCw className="h-5 w-5 animate-spin text-emerald-500" />
                <span>Loading conversation...</span>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-sm font-semibold text-foreground">No messages yet</p>
              <p className="text-xs max-w-xs mt-1">
                Say hello and start the conversation with other investors & traders!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              const isMe = msg.sender.toLowerCase() === currentUser.toLowerCase();

              return (
                <div
                  key={msg.id || index}
                  className={cn("flex flex-col", isMe ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "relative max-w-[82%] sm:max-w-[70%] px-3.5 py-2 rounded-2xl shadow-sm text-sm break-words",
                      isMe
                        ? "bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef] rounded-tr-none"
                        : "bg-white text-[#111b21] dark:bg-[#202c33] dark:text-[#e9edef] rounded-tl-none border border-black/5 dark:border-white/5"
                    )}
                  >
                    {/* Sender username for other users */}
                    {!isMe && (
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-[11px] text-emerald-600 dark:text-emerald-400 capitalize">
                          {msg.sender}
                        </span>
                        {msg.sender === "main" && (
                          <span className="text-[9px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1 rounded font-medium">
                            Admin
                          </span>
                        )}
                      </div>
                    )}

                    {/* Message Text */}
                    <p className="whitespace-pre-wrap leading-relaxed text-[13.5px]">
                      {msg.message}
                    </p>

                    {/* Timestamp & Read ticks */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-muted-foreground/80 dark:text-white/60 select-none">
                      <span>{formatTime(msg.createdAt)}</span>
                      {isMe && (
                        <CheckCheck className="h-3.5 w-3.5 text-sky-500 stroke-[2.5]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-card/95 border-t border-border/40 z-10">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-2 max-w-4xl mx-auto"
          >
            <div className="relative flex-1">
              <Input
                placeholder="Type a message..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                className="h-11 rounded-full pl-4 pr-10 text-sm bg-muted/40 focus-visible:ring-emerald-500/50"
              />
              <span className="absolute right-3.5 top-3 text-muted-foreground text-xs pointer-events-none">
                ↵
              </span>
            </div>

            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || sending}
              className={cn(
                "h-11 w-11 rounded-full shrink-0 transition-transform active:scale-95",
                inputValue.trim()
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

