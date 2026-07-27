"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  ShieldCheck,
  LogOut,
  Users,
  Settings,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface UserProfileMenuProps {
  compact?: boolean;
}

export default function UserProfileMenu({ compact = false }: UserProfileMenuProps) {
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || "main");
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (e) {
      // Ignore network errors on logout
    }
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="h-8 w-24 bg-zinc-800/50 animate-pulse rounded-full" />
    );
  }

  if (!currentUser) {
    return (
      <Button
        asChild
        variant="outline"
        size="sm"
        className="h-8 border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 font-bold text-xs rounded-full gap-1.5"
      >
        <Link href="/">
          <User className="h-3.5 w-3.5" />
          <span>Login</span>
        </Link>
      </Button>
    );
  }

  const isAdmin = currentUser === "main";
  const initials = currentUser.substring(0, 2).toUpperCase();
  const roleLabel = isAdmin ? "Primary Admin" : currentUser === "demo" ? "Demo Account" : "Standard User";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-9 border border-zinc-800 bg-zinc-900/80 hover:bg-zinc-800/90 text-zinc-200 rounded-full transition-all gap-2 cursor-pointer focus:ring-1 focus:ring-red-500/50 ${
            compact ? "px-1.5 sm:px-2.5" : "px-2.5"
          }`}
        >
          <div className="relative flex items-center justify-center">
            <Avatar className="h-6 w-6 border border-zinc-700 bg-gradient-to-br from-red-500 to-rose-700 text-white font-bold text-[10px]">
              <AvatarFallback className="bg-transparent text-white font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-zinc-950" />
          </div>

          <div className="hidden sm:flex flex-col items-start text-left leading-none">
            <span className="text-xs font-bold text-zinc-100 max-w-[100px] truncate">
              {currentUser}
            </span>
            <span className="text-[9px] text-zinc-400 font-medium">
              {isAdmin ? "Admin" : "User"}
            </span>
          </div>

          <ChevronDown className="h-3.5 w-3.5 text-zinc-400 opacity-70" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 bg-zinc-950 border-zinc-800 text-zinc-200 p-2 shadow-2xl rounded-2xl">
        <DropdownMenuLabel className="font-normal p-2 pb-3 border-b border-zinc-900">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-red-500/30 bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-md">
              <AvatarFallback className="bg-transparent text-white text-xs font-black">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <p className="text-sm font-black text-white truncate">{currentUser}</p>
                {isAdmin ? (
                  <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400 text-[9px] font-mono shrink-0">
                    Admin
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-blue-400 text-[9px] font-mono shrink-0">
                    User
                  </Badge>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                {isAdmin ? <ShieldCheck className="h-3 w-3 text-emerald-400" /> : <User className="h-3 w-3 text-zinc-400" />}
                {roleLabel}
              </p>
            </div>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuGroup className="py-1">
          {isAdmin && (
            <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-zinc-900 focus:bg-zinc-900">
              <Link href="/users" className="flex items-center gap-2.5 py-2 text-xs font-semibold text-zinc-200">
                <Users className="h-4 w-4 text-red-400" />
                <span>User Management</span>
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-zinc-900 focus:bg-zinc-900">
            <Link href="/settings" className="flex items-center gap-2.5 py-2 text-xs font-semibold text-zinc-200">
              <Settings className="h-4 w-4 text-amber-400" />
              <span>Motilal Settings</span>
            </Link>
          </DropdownMenuItem>

          <DropdownMenuItem asChild className="cursor-pointer rounded-xl hover:bg-zinc-900 focus:bg-zinc-900">
            <Link href="/portfolio" className="flex items-center gap-2.5 py-2 text-xs font-semibold text-zinc-200">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span>Portfolio Overview</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-zinc-900 my-1" />

        <DropdownMenuItem
          onClick={handleLogout}
          className="cursor-pointer rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:bg-red-500/10 py-2 text-xs font-bold gap-2.5"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out profile ({currentUser})</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
