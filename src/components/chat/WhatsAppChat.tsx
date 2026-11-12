"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Users,
  CheckCheck,
  MessageSquare,
  RefreshCw,
  Search,
  Trash2,
  ShieldCheck,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  avatarColor?: string;
  createdAt: string;
}

interface ChatUser {
  id: string;
  username: string;
  fullName: string;
  avatarUrl?: string;
  isAdmin?: boolean;
  isOnline?: boolean;
  lastSeen?: string;
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
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [currentUser, setCurrentUser] = useState<string>("you");
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "online" | "offline">("all");
  const [showMobileUsers, setShowMobileUsers] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const res = await fetch("/api/chat");
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        if (Array.isArray(data.users)) {
          setUsers(data.users);
        }
        if (data.currentUser) {
          setCurrentUser(data.currentUser);
          setIsAdmin(Boolean(data.isAdmin) || data.currentUser.toLowerCase() === "main");
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
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      }
    } catch (err) {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSending(false);
    }
  };

  // Delete a single message (Main Admin only)
  const handleDeleteMessage = async (msgId: string) => {
    if (!isAdmin) return;
    setMessages((prev) => prev.filter((m) => m.id !== msgId));
    try {
      const res = await fetch(`/api/chat?id=${encodeURIComponent(msgId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Message deleted");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete message");
        fetchMessages();
      }
    } catch {
      toast.error("Error deleting message");
      fetchMessages();
    }
  };

  // Clear all chat messages (Main Admin only)
  const handleClearAllChat = async () => {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to delete ALL chat messages?")) {
      return;
    }

    try {
      const res = await fetch("/api/chat?all=true", {
        method: "DELETE",
      });
      if (res.ok) {
        setMessages([]);
        toast.success("All chat messages cleared by Admin");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to clear chat");
      }
    } catch {
      toast.error("Error clearing chat");
    }
  };

  const filteredMessages = messages.filter((m) =>
    searchQuery
      ? m.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.sender.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  const onlineCount = users.filter((u) => u.isOnline).length;
  const offlineCount = users.length - onlineCount;

  const filteredUsers = users.filter((u) => {
    const matchesSearch = userSearch
      ? u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.fullName.toLowerCase().includes(userSearch.toLowerCase())
      : true;
    if (!matchesSearch) return false;
    if (statusFilter === "online") return Boolean(u.isOnline);
    if (statusFilter === "offline") return !u.isOnline;
    return true;
  });

  const getUserDisplay = (senderUsername: string) => {
    const matched = users.find(
      (u) => u.username.toLowerCase() === senderUsername.toLowerCase()
    );
    return matched?.fullName && matched.fullName !== senderUsername
      ? `${matched.fullName} (${senderUsername})`
      : senderUsername;
  };

  const isSenderOnline = (senderUsername: string) => {
    if (senderUsername.toLowerCase() === currentUser.toLowerCase()) return true;
    const matched = users.find(
      (u) => u.username.toLowerCase() === senderUsername.toLowerCase()
    );
    return Boolean(matched?.isOnline);
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
    } catch {
      return "";
    }
  };

  return (
    <div className="flex h-[calc(100dvh-7.25rem)] sm:h-[calc(100dvh-8.25rem)] min-h-[420px] w-full max-w-6xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-border/80 shadow-xl sm:shadow-2xl bg-card relative">
      {/* Mobile / Tablet Backdrop Overlay */}
      {showMobileUsers && (
        <div
          onClick={() => setShowMobileUsers(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* LEFT SIDEBAR: All Registered Users List */}
      <div
        className={cn(
          "border-r border-border/60 bg-card lg:bg-muted/20 flex-col shrink-0 transition-all duration-200",
          showMobileUsers
            ? "fixed inset-y-0 left-0 z-50 flex w-[85vw] max-w-[310px] shadow-2xl"
            : "hidden lg:flex lg:w-72 xl:w-80 z-20"
        )}
      >
        {/* Header */}
        <div className="p-3 sm:p-4 border-b border-border/60 flex items-center justify-between bg-muted/40 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold shadow-md shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-xs sm:text-sm leading-tight truncate">
                Community Members
              </h2>
              <p className="text-[10px] sm:text-[11px] text-muted-foreground flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {onlineCount} Online
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600" />
                  {offlineCount} Offline
                </span>
              </p>
            </div>
          </div>
          {showMobileUsers && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowMobileUsers(false)}
              className="lg:hidden h-8 w-8 shrink-0 rounded-full hover:bg-muted"
              title="Close Members List"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Search & Online/Offline Filter Tabs */}
        <div className="p-2.5 sm:p-3 border-b border-border/40 space-y-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search members..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="pl-8 h-8 sm:h-9 text-xs rounded-lg bg-background/60"
            />
          </div>
          <div className="grid grid-cols-3 gap-1 bg-muted/60 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={cn(
                "text-[10px] font-semibold py-1 rounded-md transition-colors cursor-pointer truncate px-1",
                statusFilter === "all"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              All ({users.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("online")}
              className={cn(
                "text-[10px] font-semibold py-1 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer truncate px-1",
                statusFilter === "online"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
              <span>Online ({onlineCount})</span>
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("offline")}
              className={cn(
                "text-[10px] font-semibold py-1 rounded-md transition-colors flex items-center justify-center gap-1 cursor-pointer truncate px-1",
                statusFilter === "offline"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0" />
              <span>Offline ({offlineCount})</span>
            </button>
          </div>
        </div>

        {/* Scrollable List of All Registered Users */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">
              No members match filter.
            </div>
          ) : (
            filteredUsers.map((u) => {
              const isCurrent = u.username.toLowerCase() === currentUser.toLowerCase();
              const online = Boolean(u.isOnline || isCurrent);
              return (
                <div
                  key={u.id || u.username}
                  className={cn(
                    "flex items-center justify-between p-2 sm:p-2.5 rounded-xl transition-colors gap-2",
                    isCurrent
                      ? "bg-emerald-500/10 border border-emerald-500/30"
                      : "hover:bg-muted/60"
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className="relative shrink-0">
                      {u.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={u.avatarUrl}
                          alt={u.fullName}
                          className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 text-xs">
                          <AvatarFallback className={getRandomColor(u.username)}>
                            {(u.fullName || u.username).slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span
                        title={online ? "Online" : "Offline"}
                        className={cn(
                          "absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full ring-2 ring-background",
                          online
                            ? "bg-emerald-500"
                            : "bg-slate-400 dark:bg-slate-600"
                        )}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <p className="text-xs font-bold truncate text-foreground max-w-[115px] sm:max-w-[130px]">
                          {u.fullName}
                        </p>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold shrink-0">
                            You
                          </span>
                        )}
                        {u.isAdmin && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center gap-0.5 shrink-0">
                            <ShieldCheck className="h-2.5 w-2.5" />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground font-mono truncate">
                        {u.username}
                      </p>
                    </div>
                  </div>

                  {/* Online / Offline Status Pill */}
                  <div className="flex flex-col items-end shrink-0">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full border",
                        online
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                          : "bg-muted/70 text-muted-foreground border-border/60"
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full shrink-0",
                          online
                            ? "bg-emerald-500 animate-pulse"
                            : "bg-slate-400 dark:bg-slate-500"
                        )}
                      />
                      {online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Logged-in Footer */}
        <div className="p-2.5 sm:p-3 border-t border-border/40 bg-muted/30 flex items-center justify-between gap-2 text-[10px] sm:text-[11px] text-muted-foreground">
          <span className="truncate">
            Logged in: <strong className="text-foreground">{currentUser}</strong>
          </span>
          {isAdmin && (
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 shrink-0">
              <ShieldCheck className="h-3.5 w-3.5" /> Admin
            </span>
          )}
        </div>
      </div>

      {/* MAIN WHATSAPP-STYLE CHAT AREA */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-[#efeae2] dark:bg-[#0b141a] relative">
        {/* Subtle WhatsApp wallpaper doodle pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 25px 25px, currentColor 2%, transparent 0%), radial-gradient(circle at 75px 75px, currentColor 2%, transparent 0%)`,
            backgroundSize: "100px 100px",
          }}
        />

        {/* Chat Header */}
        <div className="px-2.5 sm:px-4 py-2.5 border-b border-border/40 bg-card/95 backdrop-blur-md z-10 flex flex-col gap-2 shadow-xs">
          <div className="flex items-center justify-between gap-1.5 sm:gap-2">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
              {/* Mobile/Tablet Members Toggle Button */}
              <button
                type="button"
                onClick={() => setShowMobileUsers(!showMobileUsers)}
                className="lg:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold shadow-xs shrink-0 active:scale-95 transition-transform cursor-pointer"
                title="View Community Members & Online Status"
              >
                <Users className="h-4 w-4" />
                <span className="text-[11px] font-bold">{onlineCount}/{users.length}</span>
              </button>

              <Avatar className="h-9 w-9 sm:h-10 sm:w-10 border border-emerald-500/40 shadow-sm hidden lg:flex shrink-0">
                <AvatarFallback className="bg-emerald-600 text-white font-bold">
                  <Users className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h3 className="font-semibold text-xs sm:text-sm truncate">
                    YS Traders Community
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[9px] sm:text-[10px] py-0 px-1.5 border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1 shrink-0"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {onlineCount} Online
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-[9px] sm:text-[10px] py-0 px-1.5 text-muted-foreground hidden md:inline-flex shrink-0"
                  >
                    {offlineCount} Offline • {users.length} Total
                  </Badge>
                </div>
                <p className="text-[10px] sm:text-xs text-muted-foreground truncate mt-0.5">
                  {users.map((u) => u.fullName).slice(0, 5).join(", ")}
                  {users.length > 5 ? ` +${users.length - 5} more` : ""}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Search messages input on desktop */}
              <div className="relative hidden xl:block w-44">
                <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-xs rounded-lg"
                />
              </div>

              {/* Mobile/Tablet Search Toggle Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                title="Search messages"
                className="xl:hidden h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <Search className="h-4 w-4" />
              </Button>

              {/* Admin Clear All Chat Button */}
              {isAdmin && messages.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearAllChat}
                  className="h-8 text-xs gap-1 px-2 sm:px-2.5 cursor-pointer shrink-0"
                  title="Delete All Chat Messages (Admin Only)"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Clear Chat</span>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={fetchMessages}
                title="Refresh messages"
                className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Expandable Mobile/Tablet Message Search Bar */}
          {showMobileSearch && (
            <div className="relative xl:hidden flex items-center gap-2 pt-1">
              <Search className="absolute left-2.5 top-3 h-3.5 w-3.5 text-muted-foreground" />
              <Input
                placeholder="Search in conversation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs rounded-lg flex-1"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="h-7 px-2 text-[10px]"
                >
                  Clear
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Message Stream */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden p-2.5 sm:p-4 z-10 space-y-2.5 sm:space-y-3">
          {loading && messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
                <RefreshCw className="h-5 w-5 animate-spin text-emerald-500" />
                <span>Loading conversation...</span>
              </div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 text-muted-foreground">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <p className="text-xs sm:text-sm font-semibold text-foreground">No messages yet</p>
              <p className="text-[11px] sm:text-xs max-w-xs mt-1">
                Say hello and start the conversation with other investors & traders!
              </p>
            </div>
          ) : (
            filteredMessages.map((msg, index) => {
              const isMe = msg.sender.toLowerCase() === currentUser.toLowerCase();
              const senderOnline = isSenderOnline(msg.sender);

              return (
                <div
                  key={msg.id || index}
                  className={cn("flex flex-col group w-full", isMe ? "items-end" : "items-start")}
                >
                  <div
                    className={cn(
                      "relative max-w-[88%] sm:max-w-[76%] md:max-w-[68%] px-3 sm:px-3.5 py-2 rounded-2xl shadow-xs text-xs sm:text-sm break-words overflow-hidden",
                      isMe
                        ? "bg-[#d9fdd3] text-[#111b21] dark:bg-[#005c4b] dark:text-[#e9edef] rounded-tr-none"
                        : "bg-white text-[#111b21] dark:bg-[#202c33] dark:text-[#e9edef] rounded-tl-none border border-black/5 dark:border-white/5"
                    )}
                  >
                    {/* Header row: Sender name + Online Dot + Admin Delete Icon */}
                    <div className="flex items-center justify-between gap-2 sm:gap-3 mb-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span
                          title={senderOnline ? "Online" : "Offline"}
                          className={cn(
                            "h-2 w-2 rounded-full shrink-0",
                            senderOnline ? "bg-emerald-500" : "bg-slate-400"
                          )}
                        />
                        <span
                          className={cn(
                            "font-bold text-[10px] sm:text-[11px] capitalize truncate",
                            isMe
                              ? "text-emerald-800 dark:text-emerald-300"
                              : "text-emerald-600 dark:text-emerald-400"
                          )}
                        >
                          {isMe ? "You" : getUserDisplay(msg.sender)}
                        </span>
                        {msg.sender.toLowerCase() === "main" && (
                          <span className="text-[8px] sm:text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.2 rounded font-bold shrink-0">
                            Admin
                          </span>
                        )}
                      </div>

                      {/* Admin Delete Message Button */}
                      {isAdmin && !msg.id.startsWith("temp-") && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-rose-500/80 hover:text-rose-600 p-1 -mr-1 rounded hover:bg-rose-500/10 transition-colors cursor-pointer shrink-0"
                          title="Delete this message (Admin)"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Message Text */}
                    <p className="whitespace-pre-wrap leading-relaxed text-[13px] sm:text-[13.5px] break-words">
                      {msg.message}
                    </p>

                    {/* Timestamp & Read ticks */}
                    <div className="flex items-center justify-end gap-1 mt-1 text-[9px] sm:text-[10px] text-muted-foreground/80 dark:text-white/60 select-none">
                      <span>{formatTime(msg.createdAt)}</span>
                      {isMe && (
                        <CheckCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-sky-500 stroke-[2.5]" />
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
        <div className="p-2 sm:p-3 bg-card/95 border-t border-border/40 z-10">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center gap-1.5 sm:gap-2 max-w-4xl mx-auto"
          >
            <div className="relative flex-1 min-w-0">
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
                className="h-10 sm:h-11 rounded-full pl-3.5 sm:pl-4 pr-9 text-xs sm:text-sm bg-muted/40 focus-visible:ring-emerald-500/50"
              />
              <span className="absolute right-3 top-2.5 sm:top-3 text-muted-foreground text-xs pointer-events-none hidden sm:inline">
                ↵
              </span>
            </div>

            <Button
              type="submit"
              size="icon"
              disabled={!inputValue.trim() || sending}
              className={cn(
                "h-10 w-10 sm:h-11 sm:w-11 rounded-full shrink-0 transition-transform active:scale-95",
                inputValue.trim()
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
