import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Coins,
  ChevronLeft,
  ChevronRight,
  Shield,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  X,
} from "lucide-react";
import {
  fetchAdminUsers,
  updateUserCredits,
  updateAdminUser,
  deleteAdminUser,
} from "../adminApi";
import { Button, Input, BackButton, EmptyState, Skeleton, Badge } from "@/components/ui";
import { toast } from "sonner";
import AdminNav from "../components/AdminNav";
import AdminDeleteModal from "../components/AdminDeleteModal";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    totalUsers: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 20,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [customAmounts, setCustomAmounts] = useState({});

  // Edit User State
  const [editingUser, setEditingUser] = useState(null);
  const [isSavingUser, setIsSavingUser] = useState(false);

  // Delete User State
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  const loadUsers = useCallback(
    async (page = 1, query = activeSearch) => {
      setIsLoading(true);
      try {
        const data = await fetchAdminUsers(page, 20, query);
        if (data?.success) {
          setUsers(data.users || []);
          setPagination(
            data.pagination || { totalUsers: 0, totalPages: 1, currentPage: 1, limit: 20 }
          );
        } else {
          toast.error(data?.message || "Failed to load user directory.");
        }
      } catch (err) {
        toast.error(err?.response?.data?.message || err.message || "Failed to load users.");
      } finally {
        setIsLoading(false);
      }
    },
    [activeSearch]
  );

  useEffect(() => {
    loadUsers(1, activeSearch);
  }, [loadUsers, activeSearch]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setActiveSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const handleAdjustCredits = async (user, amount) => {
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid numeric amount.");
      return;
    }

    setUpdatingUserId(user._id);
    try {
      const result = await updateUserCredits(user._id, { amount: parseInt(amount, 10) });
      if (result?.success && result?.user) {
        setUsers((prev) =>
          prev.map((u) => (u._id === user._id ? { ...u, credits: result.user.credits } : u))
        );
        toast.success(
          `Updated ${user.name}'s balance by ${amount > 0 ? `+${amount}` : amount} credits (${result.user.credits} total).`
        );
        setCustomAmounts((prev) => ({ ...prev, [user._id]: "" }));
      } else {
        toast.error(result?.message || "Failed to update credits.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to adjust credits.");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser({
      _id: user._id,
      name: user.name || "",
      isActive: user.isActive !== false,
      isBanned: user.isBanned === true,
    });
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editingUser.name.trim()) {
      toast.error("Candidate name cannot be empty.");
      return;
    }

    setIsSavingUser(true);
    try {
      const res = await updateAdminUser(editingUser._id, {
        name: editingUser.name.trim(),
        isActive: editingUser.isActive,
        isBanned: editingUser.isBanned,
      });

      if (res?.success && res?.user) {
        setUsers((prev) =>
          prev.map((u) => (u._id === editingUser._id ? { ...u, ...res.user } : u))
        );
        toast.success(`Candidate profile updated successfully.`);
        setEditingUser(null);
      } else {
        toast.error(res?.message || "Failed to update user profile.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to update user.");
    } finally {
      setIsSavingUser(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeletingUser(true);
    try {
      const res = await deleteAdminUser(userToDelete._id);
      if (res?.success) {
        toast.success(`User ${userToDelete.name} deleted successfully.`);
        setUsers((prev) => prev.filter((u) => u._id !== userToDelete._id));
        setPagination((prev) => ({
          ...prev,
          totalUsers: Math.max(0, prev.totalUsers - 1),
        }));
        setUserToDelete(null);
      } else {
        toast.error(res?.message || "Failed to delete user.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Failed to delete user.");
    } finally {
      setIsDeletingUser(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-[#06080B] text-[#F1F5F9]">
      <AdminNav />
      <div className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Navigation & Header */}
          <div className="space-y-4">
            <div className="space-y-3">
              <BackButton to="/admin" label="Back to Admin Console" />
              <nav className="flex items-center space-x-2 text-xs font-medium text-[#94A3B8]">
                <a href="/admin" className="hover:text-[#F1F5F9] transition-colors">
                  Admin Console
                </a>
                <span>/</span>
                <span className="text-[#38BDF8] font-semibold">User Directory</span>
              </nav>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-[#1E2B45]">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D1E3A] border border-[#2563EB]/40 text-[#93C5FD] text-xs font-mono font-semibold">
                  <Shield size={13} className="text-[#3B82F6]" />
                  <span>User Directory & Accounts</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#F1F5F9]">
                  Manage Candidates & Access
                </h1>
                <p className="text-xs sm:text-sm text-[#94A3B8]">
                  Search candidates, inspect balances, adjust credits, and manage account status.
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                leftIcon={RefreshCw}
                onClick={() => loadUsers(pagination.currentPage, activeSearch)}
                isLoading={isLoading}
                className="text-xs self-start sm:self-auto"
              >
                Refresh Table
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Input
                placeholder="Search by candidate name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={Search}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button type="submit" variant="primary" size="md" className="text-xs">
                Search
              </Button>
              {activeSearch && (
                <Button
                  type="button"
                  variant="ghost"
                  size="md"
                  onClick={handleClearSearch}
                  className="text-xs text-[#94A3B8]"
                >
                  Clear
                </Button>
              )}
            </div>
          </form>

          {/* Directory Table */}
          <div className="rounded-xl border border-[#1E2B45] bg-[#0A0D14] overflow-hidden">
            {isLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 py-3 border-b border-[#1E2B45]/40"
                  >
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-48 bg-[#141B2D]" />
                      <Skeleton className="h-3 w-32 bg-[#141B2D]" />
                    </div>
                    <Skeleton className="h-7 w-20 bg-[#141B2D]" />
                    <Skeleton className="h-8 w-44 bg-[#141B2D]" />
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="py-16">
                <EmptyState
                  icon={Users}
                  title="No Candidates Found"
                  description={
                    activeSearch
                      ? `No users matched the query "${activeSearch}". Try searching with a different name or email.`
                      : "There are no registered users in the platform directory yet."
                  }
                  actionLabel={activeSearch ? "Reset Search" : undefined}
                  onAction={activeSearch ? handleClearSearch : undefined}
                />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#1E2B45] bg-[#0E131F]/70 text-[11px] font-mono uppercase tracking-wider text-[#94A3B8]">
                      <th className="py-3.5 px-4 font-semibold">Candidate</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold hidden md:table-cell">Joined</th>
                      <th className="py-3.5 px-4 font-semibold">Plan</th>
                      <th className="py-3.5 px-4 font-semibold">Balance</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1E2B45]/50 text-xs">
                    {users.map((user) => {
                      const isUpdating = updatingUserId === user._id;
                      const customAmount = customAmounts[user._id] || "";

                      return (
                        <tr
                          key={user._id}
                          className="hover:bg-[#0E131F]/50 transition-colors group"
                        >
                          {/* Candidate Name & Email */}
                          <td className="py-4 px-4">
                            <div className="font-semibold text-[#F1F5F9]">{user.name}</div>
                            <div className="text-[11px] text-[#94A3B8] font-mono truncate max-w-xs">
                              {user.email || "No email"}
                            </div>
                          </td>

                          {/* Account Status Badge */}
                          <td className="py-4 px-4">
                            {user.isBanned ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#280B0B] border border-[#EF4444]/40 text-[#F87171]">
                                <AlertOctagon size={11} />
                                Banned
                              </span>
                            ) : user.isActive === false ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#271A04] border border-[#F59E0B]/40 text-[#FBBF24]">
                                <XCircle size={11} />
                                Inactive
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#0B2518] border border-[#22C55E]/40 text-[#4ADE80]">
                                <CheckCircle2 size={11} />
                                Active
                              </span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-4 px-4 text-[#94A3B8] font-mono text-[11px] hidden md:table-cell">
                            {formatDate(user.createdAt)}
                          </td>

                          {/* Current Plan Badge */}
                          <td className="py-4 px-4">
                            <Badge
                              variant={
                                user.currentPlan === "Ultra"
                                  ? "ai"
                                  : user.currentPlan === "Pro"
                                  ? "brand"
                                  : "neutral"
                              }
                              size="sm"
                            >
                              {user.currentPlan || "Free"}
                            </Badge>
                          </td>

                          {/* Current Credits Badge */}
                          <td className="py-4 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-bold border ${
                                user.credits <= 0
                                  ? "bg-[#280B0B] border-[#EF4444]/40 text-[#F87171]"
                                  : user.credits < 100
                                  ? "bg-[#271A04] border-[#F59E0B]/40 text-[#FBBF24]"
                                  : "bg-[#0D1E3A] border-[#2563EB]/40 text-[#93C5FD]"
                              }`}
                            >
                              <Coins size={12} />
                              {user.credits?.toLocaleString()}
                            </span>
                          </td>

                          {/* Actions: Presets, Custom Input, Edit, Delete */}
                          <td className="py-4 px-4 text-right">
                            <div className="inline-flex items-center justify-end gap-1.5 flex-wrap">
                              {/* Preset Buttons */}
                              <button
                                type="button"
                                disabled={isUpdating}
                                onClick={() => handleAdjustCredits(user, 100)}
                                className="px-2 py-1 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#2563EB] hover:text-[#93C5FD] text-[11px] font-mono text-[#94A3B8] transition-colors disabled:opacity-50"
                                title="Add 100 credits"
                              >
                                +100
                              </button>
                              <button
                                type="button"
                                disabled={isUpdating || user.credits <= 0}
                                onClick={() => handleAdjustCredits(user, -50)}
                                className="px-2 py-1 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#EF4444] hover:text-[#F87171] text-[11px] font-mono text-[#94A3B8] transition-colors disabled:opacity-50"
                                title="Deduct 50 credits"
                              >
                                -50
                              </button>

                              {/* Custom Input */}
                              <div className="inline-flex items-center gap-1 ml-1">
                                <input
                                  type="number"
                                  placeholder="±Amt"
                                  value={customAmount}
                                  onChange={(e) =>
                                    setCustomAmounts({
                                      ...customAmounts,
                                      [user._id]: e.target.value,
                                    })
                                  }
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleAdjustCredits(user, customAmount);
                                    }
                                  }}
                                  className="w-14 px-1.5 py-1 text-xs font-mono rounded bg-[#0E131F] border border-[#1E2B45] text-[#F1F5F9] focus:outline-none focus:border-[#2563EB]"
                                />
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={!customAmount || isUpdating}
                                  isLoading={isUpdating}
                                  onClick={() => handleAdjustCredits(user, customAmount)}
                                  className="px-2 py-1 h-auto text-[11px]"
                                >
                                  Apply
                                </Button>
                              </div>

                              {/* Edit Profile Button */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(user)}
                                className="p-1.5 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#38BDF8] hover:text-[#38BDF8] text-[#94A3B8] transition-colors ml-1"
                                title="Edit user profile & status"
                              >
                                <Edit2 size={13} />
                              </button>

                              {/* Delete Account Button */}
                              <button
                                type="button"
                                onClick={() => setUserToDelete(user)}
                                className="p-1.5 rounded bg-[#0E131F] border border-[#1E2B45] hover:border-[#EF4444] hover:text-[#F87171] text-[#94A3B8] transition-colors"
                                title="Delete user account"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {!isLoading && users.length > 0 && (
              <div className="py-3.5 px-4 border-t border-[#1E2B45] bg-[#0E131F]/50 flex items-center justify-between text-xs text-[#94A3B8]">
                <div>
                  Showing <span className="text-[#F1F5F9] font-mono">{users.length}</span> of{" "}
                  <span className="text-[#F1F5F9] font-mono">{pagination.totalUsers}</span> candidates
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px]">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={pagination.currentPage <= 1 || isLoading}
                      onClick={() => loadUsers(pagination.currentPage - 1, activeSearch)}
                      className="p-1 rounded bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB] disabled:opacity-30 disabled:hover:border-[#1E2B45] transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      disabled={pagination.currentPage >= pagination.totalPages || isLoading}
                      onClick={() => loadUsers(pagination.currentPage + 1, activeSearch)}
                      className="p-1 rounded bg-[#0A0D14] border border-[#1E2B45] hover:border-[#2563EB] disabled:opacity-30 disabled:hover:border-[#1E2B45] transition-colors"
                      aria-label="Next Page"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Edit User Modal */}
          {editingUser && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
              <div className="w-full max-w-md rounded-2xl border border-[#1E2B45] bg-[#0E131F] p-6 shadow-2xl space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-[#F1F5F9]">Edit Candidate Profile</h3>
                    <p className="text-xs text-[#94A3B8]">
                      Update candidate display name and access permissions.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    disabled={isSavingUser}
                    className="text-[#94A3B8] hover:text-[#F1F5F9] p-1 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={handleSaveUserEdit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#F1F5F9]">Full Name</label>
                    <Input
                      value={editingUser.name}
                      onChange={(e) =>
                        setEditingUser({ ...editingUser, name: e.target.value })
                      }
                      placeholder="Candidate Name"
                      required
                    />
                  </div>

                  <div className="pt-2 border-t border-[#1E2B45] space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0D14] border border-[#1E2B45]">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-[#F1F5F9]">Account Active</span>
                        <p className="text-[11px] text-[#94A3B8]">
                          Allow candidate to log in and use platform features.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingUser.isActive}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, isActive: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-[#1E2B45] bg-[#0E131F] text-[#2563EB] focus:ring-0 cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#0A0D14] border border-[#1E2B45]">
                      <div className="space-y-0.5">
                        <span className="text-xs font-medium text-[#F87171]">Account Banned</span>
                        <p className="text-[11px] text-[#94A3B8]">
                          Flag user as prohibited from creating sessions or accessing endpoints.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={editingUser.isBanned}
                        onChange={(e) =>
                          setEditingUser({ ...editingUser, isBanned: e.target.checked })
                        }
                        className="w-4 h-4 rounded border-[#1E2B45] bg-[#0E131F] text-[#EF4444] focus:ring-0 cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#1E2B45]">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingUser(null)}
                      disabled={isSavingUser}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      isLoading={isSavingUser}
                      className="text-xs"
                    >
                      Save Changes
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete User Confirmation Modal */}
          <AdminDeleteModal
            isOpen={!!userToDelete}
            title="Delete Candidate Account"
            itemLabel={userToDelete?.name || userToDelete?.email}
            description="Are you sure you want to permanently delete this candidate account? Their credentials and profile will be removed. Historical interview, aptitude, GD, resume, and payment records are preserved for audit integrity."
            onClose={() => setUserToDelete(null)}
            onConfirm={handleConfirmDelete}
            isDeleting={isDeletingUser}
          />
        </div>
      </div>
    </div>
  );
}
