"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  KeyRound,
  Trash2,
  Shield,
  ShieldCheck,
  UserCheck,
  Lock,
  RefreshCw,
  X,
  Check,
  AlertCircle,
  Loader2,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import toast from "react-hot-toast";

interface UserItem {
  id: string;
  username: string;
  createdAt: string;
  isProtected?: boolean;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  // Create User Modal state
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [newUsername, setNewUsername] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [createLoading, setCreateLoading] = useState<boolean>(false);

  // Edit/Change Password Modal state
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);
  const [editPassword, setEditPassword] = useState<string>("");
  const [editLoading, setEditLoading] = useState<boolean>(false);

  // Delete User Confirmation Modal state
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  // Check user role on mount
  useEffect(() => {
    async function checkRole() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const data = await res.json();
          setIsAdmin(data.user === "main");
        } else {
          setIsAdmin(false);
        }
      } catch (err) {
        setIsAdmin(false);
      }
    }
    checkRole();
  }, []);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
      } else {
        toast.error(data.message || "Failed to load users.");
      }
    } catch (err) {
      toast.error("Network error while loading users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle Create New User Submit
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newPassword.trim()) {
      toast.error("Please enter both Username and Password.");
      return;
    }

    setCreateLoading(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername, password: newPassword }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "User created successfully!");
        setNewUsername("");
        setNewPassword("");
        setShowCreateModal(false);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to create user.");
      }
    } catch (err) {
      toast.error("Network error while creating user.");
    } finally {
      setCreateLoading(false);
    }
  };

  // Handle Update Password Submit
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !editPassword.trim()) {
      toast.error("Please enter a new password.");
      return;
    }

    setEditLoading(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(selectedUser.username)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: editPassword }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "Password updated successfully!");
        setEditPassword("");
        setSelectedUser(null);
        setShowEditModal(false);
      } else {
        toast.error(data.message || "Failed to update password.");
      }
    } catch (err) {
      toast.error("Network error while updating password.");
    } finally {
      setEditLoading(false);
    }
  };

  // Handle Delete User Submit
  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(userToDelete.username)}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        toast.success(data.message || "User deleted successfully!");
        setUserToDelete(null);
        setShowDeleteModal(false);
        fetchUsers();
      } else {
        toast.error(data.message || "Failed to delete user.");
      }
    } catch (err) {
      toast.error("Network error while deleting user.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isAdmin === null) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-red-500" />
        <span className="text-xs text-zinc-500">Checking authorization permissions...</span>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="py-16 max-w-md mx-auto text-center space-y-4 bg-zinc-950 border border-zinc-800 p-8 rounded-2xl shadow-2xl">
        <div className="h-12 w-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto">
          <Lock className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-xs text-zinc-450 leading-relaxed">
            User Management is restricted exclusively to the Primary Admin account (<strong className="text-white">ysportfolio123</strong>). Normal users cannot create or manage user credentials.
          </p>
        </div>
        <Button
          onClick={() => window.location.href = "/dashboard"}
          className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs h-10 px-5 rounded-xl border border-zinc-700 cursor-pointer"
        >
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  User Management
                  <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-500 text-[10px] font-mono">
                    {users.length} Active Accounts
                  </Badge>
                </h1>
                <p className="text-zinc-500 text-xs">
                  Create new user IDs, update access passwords, and manage workspace credentials.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              onClick={fetchUsers}
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 gap-2 h-10 px-3 cursor-pointer"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-red-500" : ""}`} />
              Refresh
            </Button>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold gap-2 h-10 px-4 cursor-pointer shadow-lg shadow-red-500/20 active:scale-95"
            >
              <UserPlus className="h-4 w-4" />
              Create New User
            </Button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="h-3.5 w-3.5 text-emerald-400" />
            Total Registered Users
          </span>
          <div className="text-2xl font-black text-white">{users.length}</div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
            Primary Admin User
          </span>
          <div className="text-2xl font-black text-white flex items-center gap-2">
            main
            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px]">
              Protected
            </Badge>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-xl space-y-1">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5 text-amber-400" />
            Security Model
          </span>
          <div className="text-sm font-extrabold text-white mt-1">
            JWT Cookie & Mongo/JSON Sync
          </div>
        </div>
      </div>

      {/* User Search & Main Table Card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-zinc-900">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Search by User ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 text-white text-xs pl-9 h-9 focus:border-red-500/50"
            />
          </div>
          <span className="text-xs text-zinc-500 font-mono">
            Showing {filteredUsers.length} of {users.length} users
          </span>
        </div>

        {/* Table List */}
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <span className="text-xs text-zinc-500">Loading user database records...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <Users className="h-10 w-10 text-zinc-700 mx-auto" />
            <p className="text-zinc-450 text-sm font-semibold">No User IDs found matching your query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-400">
              <thead className="bg-zinc-900/50 text-zinc-400 font-bold uppercase tracking-wider text-[10px] border-b border-zinc-850">
                <tr>
                  <th className="py-3 px-4">User ID / Username</th>
                  <th className="py-3 px-4">Role / Access</th>
                  <th className="py-3 px-4">Created Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {filteredUsers.map((u) => {
                  const isMain = u.username.toLowerCase() === "main";
                  return (
                    <tr key={u.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center font-bold text-white uppercase text-xs">
                            {u.username.substring(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-white text-sm block">{u.username}</span>
                            <span className="text-[10px] text-zinc-500 font-mono">ID: {u.id}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isMain ? (
                          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20 font-bold text-[10px] gap-1">
                            <Shield className="h-3 w-3" />
                            Primary Admin
                          </Badge>
                        ) : u.username === "demo" ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                            Demo User
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                            Standard User
                          </Badge>
                        )}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-zinc-500">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric"
                        }) : "System Default"}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => {
                              setSelectedUser(u);
                              setEditPassword("");
                              setShowEditModal(true);
                            }}
                            variant="outline"
                            size="sm"
                            className="h-8 text-[11px] font-semibold gap-1.5 border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                            Change Password
                          </Button>

                          {!isMain && (
                            <Button
                              onClick={() => {
                                setUserToDelete(u);
                                setShowDeleteModal(true);
                              }}
                              variant="outline"
                              size="sm"
                              className="h-8 text-[11px] font-semibold gap-1.5 border-red-500/20 bg-red-500/5 hover:bg-red-500/20 text-red-400 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE NEW USER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
                  <UserPlus className="h-4.5 w-4.5" />
                </div>
                <h3 className="text-base font-bold text-white">Create New User ID</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">User ID / Username</label>
                <Input
                  placeholder="e.g. user2, aftab@gmail.com, investor1"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus:border-red-500/50 text-white text-xs h-10 rounded-xl"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">Access Password</label>
                <Input
                  type="password"
                  placeholder="Enter secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus:border-red-500/50 text-white text-xs h-10 rounded-xl"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-900">
                <Button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs h-10 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createLoading}
                  className="bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white font-bold text-xs h-10 px-5 gap-2 cursor-pointer"
                >
                  {createLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Create User ID
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <KeyRound className="h-4.5 w-4.5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Change Password</h3>
                  <span className="text-xs text-zinc-500">User: <strong className="text-white">{selectedUser.username}</strong></span>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="h-8 w-8 rounded-lg bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">New Password</label>
                <Input
                  type="password"
                  placeholder="Enter new password"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="bg-zinc-900 border-zinc-800 focus:border-amber-500/50 text-white text-xs h-10 rounded-xl"
                  autoFocus
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-zinc-900">
                <Button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  variant="outline"
                  className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs h-10 px-4 cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={editLoading}
                  className="bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs h-10 px-5 gap-2 cursor-pointer"
                >
                  {editLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save New Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE USER CONFIRMATION MODAL */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Delete User Account?</h3>
                <p className="text-xs text-zinc-450 mt-0.5">
                  Are you sure you want to delete User ID <strong className="text-white">{userToDelete.username}</strong>? This operation cannot be undone.
                </p>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-3 border-t border-zinc-900">
              <Button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                variant="outline"
                className="border-zinc-800 bg-zinc-900 text-zinc-300 text-xs h-10 px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteUser}
                disabled={deleteLoading}
                className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs h-10 px-5 gap-2 cursor-pointer"
              >
                {deleteLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete User
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
