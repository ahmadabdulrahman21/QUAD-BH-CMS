'use client';

import React from "react";
import { FiEye, FiEyeOff, FiUserPlus, FiTrash2, FiKey, FiShield, FiMail, FiUser, FiX, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

export default function UsersPage() {
    const [users, setUsers] = React.useState([]);
    const [currentUser, setCurrentUser] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const [showForm, setShowForm] = React.useState(false);

    const [form, setForm] = React.useState({
        name: "",
        email: "",
        password: "",
        role: "editor"
    });

    const [reset, setReset] = React.useState({
        open: false,
        userId: null,
        password: ""
    });

    const [showPassword, setShowPassword] = React.useState(false);

    const [deleteModal, setDeleteModal] = React.useState({
        open: false,
        userId: null,
        userName: ""
    });

    const [modal, setModal] = React.useState({
        open: false,
        type: "info",
        message: ""
    });

    const showModal = (message, type = "info") => {
        setModal({ open: true, message, type });
    };

    const closeModal = () => {
        setModal({ open: false, message: "", type: "info" });
    };

    const nameRegex = /^[A-Za-z\s]{2,50}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;

    const fetchMe = async () => {
        try {
            const res = await fetch("/api/auth/me", {
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) setCurrentUser(data.user);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/users");
            const data = await res.json();
            const filtered = Array.isArray(data.users)
                ? data.users.filter(u => u.id !== currentUser?.id)
                : [];
            setUsers(filtered);
        } catch (err) {
            showModal("Failed to load users", "error");
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        fetchMe();
    }, []);

    React.useEffect(() => {
        if (currentUser) fetchUsers();
    }, [currentUser]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!nameRegex.test(form.name)) {
            return showModal("Name must be 2-50 characters, letters only", "error");
        }
        if (!emailRegex.test(form.email)) {
            return showModal("Invalid email format", "error");
        }
        if (!passwordRegex.test(form.password)) {
            return showModal("Password must be 8+ chars with letters and numbers", "error");
        }

        try {
            const res = await fetch("/api/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!data.success) {
                showModal(data.error || "Failed to create user", "error");
                return;
            }

            setForm({ name: "", email: "", password: "", role: "editor" });
            setShowForm(false);
            fetchUsers();
            showModal("User created successfully", "success");
        } catch (err) {
            showModal(err.message, "error");
        }
    };

    const deleteUser = async () => {
        try {
            const res = await fetch(`/api/users/${deleteModal.userId}`, {
                method: "DELETE"
            });

            const data = await res.json();

            if (!data.success) {
                showModal(data.error, "error");
                return;
            }

            setDeleteModal({ open: false, userId: null, userName: "" });
            fetchUsers();
            showModal("User deleted successfully", "success");
        } catch (err) {
            showModal(err.message, "error");
        }
    };

    const resetPassword = async () => {
        if (reset.userId === currentUser?.id) {
            return showModal("You cannot reset your own password", "error");
        }

        if (!passwordRegex.test(reset.password)) {
            return showModal("Password must be 8+ chars with letters and numbers", "error");
        }

        try {
            const res = await fetch("/api/users/reset-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: reset.userId,
                    newPassword: reset.password
                })
            });

            const data = await res.json();

            if (!data.success) {
                showModal(data.error, "error");
                return;
            }

            setReset({ open: false, userId: null, password: "" });
            setShowPassword(false);
            showModal("Password reset successfully", "success");
        } catch (err) {
            showModal(err.message, "error");
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
                
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                            User Management
                        </h1>
                        <p className="text-gray-400 text-sm mt-1">
                            Manage admin and editor accounts
                        </p>
                    </div>
                    
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40"
                    >
                        <FiUserPlus className="text-lg" />
                        {showForm ? 'Cancel' : 'Add New User'}
                    </button>
                </div>

                {/* Info Modal */}
                {modal.open && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-700 p-6 rounded-xl w-full max-w-sm shadow-2xl">
                            <div className="flex items-center gap-3 mb-4">
                                {modal.type === 'success' ? (
                                    <FiCheckCircle className="text-green-400 text-2xl" />
                                ) : modal.type === 'error' ? (
                                    <FiAlertCircle className="text-red-400 text-2xl" />
                                ) : (
                                    <FiAlertCircle className="text-cyan-400 text-2xl" />
                                )}
                                <h3 className="text-lg font-semibold text-white capitalize">
                                    {modal.type}
                                </h3>
                            </div>
                            <p className="text-gray-300 mb-6">{modal.message}</p>
                            <button
                                onClick={closeModal}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all duration-200"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                )}

                {/* Add User Form */}
                {showForm && (
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sm:p-6 mb-8">
                        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <FiUserPlus className="text-cyan-400" />
                            Create New User
                        </h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Full Name</label>
                                    <div className="relative">
                                        <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            placeholder="John Doe"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-500"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Email Address</label>
                                    <div className="relative">
                                        <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="email"
                                            placeholder="john@example.com"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-500"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Password</label>
                                    <div className="relative">
                                        <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type="password"
                                            placeholder="Min. 8 characters"
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-500"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">Role</label>
                                    <div className="relative">
                                        <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <select
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white cursor-pointer appearance-none"
                                            value={form.role}
                                            onChange={(e) => setForm({ ...form, role: e.target.value })}
                                        >
                                            <option value="editor">Editor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setForm({ name: "", email: "", password: "", role: "editor" });
                                    }}
                                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-cyan-500/20"
                                >
                                    Create User
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Users List */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-slate-700">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <FiShield className="text-cyan-400" />
                            Users ({users.length})
                        </h2>
                    </div>

                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-slate-600 border-t-cyan-500"></div>
                            <p className="text-gray-400 mt-3">Loading users...</p>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-8 text-center">
                            <FiUser className="mx-auto text-4xl text-gray-600 mb-3" />
                            <p className="text-gray-400">No users found</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-700/50">
                            {/* Table Header - Hidden on mobile */}
                            <div className="hidden sm:grid sm:grid-cols-12 gap-4 p-4 text-xs font-medium text-gray-400 uppercase tracking-wider bg-slate-900/50">
                                <div className="col-span-4">User</div>
                                <div className="col-span-3">Role</div>
                                <div className="col-span-3">Email</div>
                                <div className="col-span-2 text-right">Actions</div>
                            </div>

                            {users.map((u) => (
                                <div key={u.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 p-4 hover:bg-slate-800/30 transition-all duration-200 items-center">
                                    {/* User Info */}
                                    <div className="sm:col-span-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                                {u.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-white truncate">{u.name}</p>
                                                <p className="text-xs text-gray-400 sm:hidden truncate">{u.email}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Role */}
                                    <div className="sm:col-span-3">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                                            u.role === 'admin' 
                                                ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                        }`}>
                                            <FiShield className="text-[10px]" />
                                            {u.role}
                                        </span>
                                    </div>

                                    {/* Email - Hidden on mobile */}
                                    <div className="hidden sm:block sm:col-span-3">
                                        <p className="text-sm text-gray-400 truncate">{u.email}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="sm:col-span-2 flex justify-start sm:justify-end gap-2">
                                        <button
                                            onClick={() => setReset({
                                                open: true,
                                                userId: u.id,
                                                password: ""
                                            })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 rounded-lg text-xs font-medium transition-all duration-200"
                                            title="Reset Password"
                                        >
                                            <FiKey className="text-sm" />
                                            <span className="hidden sm:inline">Reset</span>
                                        </button>

                                        <button
                                            onClick={() => setDeleteModal({ 
                                                open: true, 
                                                userId: u.id, 
                                                userName: u.name 
                                            })}
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-medium transition-all duration-200"
                                            title="Delete User"
                                        >
                                            <FiTrash2 className="text-sm" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reset Password Modal */}
                {reset.open && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <FiKey className="text-yellow-400" />
                                    Reset Password
                                </h3>
                                <button
                                    onClick={() => {
                                        setReset({ open: false, userId: null, password: "" });
                                        setShowPassword(false);
                                    }}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <FiX size={20} />
                                </button>
                            </div>

                            <div className="p-4 sm:p-6 space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1.5">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Min. 8 characters, letters & numbers"
                                            className="w-full pl-10 pr-12 py-2.5 bg-slate-900 border border-slate-700 rounded-lg focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-500"
                                            value={reset.password}
                                            onChange={(e) => setReset({ ...reset, password: e.target.value })}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Must contain at least 8 characters, including letters and numbers
                                    </p>
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        onClick={() => {
                                            setReset({ open: false, userId: null, password: "" });
                                            setShowPassword(false);
                                        }}
                                        className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={resetPassword}
                                        className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-yellow-500/20"
                                    >
                                        Reset Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModal.open && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-md shadow-2xl">
                            <div className="p-4 sm:p-6 text-center">
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                                    <FiTrash2 className="text-red-400 text-2xl" />
                                </div>
                                
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Delete User?
                                </h3>
                                
                                <p className="text-gray-400 mb-1">
                                    Are you sure you want to delete
                                </p>
                                <p className="text-white font-semibold mb-4">
                                    {deleteModal.userName}?
                                </p>
                                <p className="text-sm text-red-400/80 mb-6">
                                    This action cannot be undone.
                                </p>

                                <div className="flex justify-center gap-3">
                                    <button
                                        onClick={() => setDeleteModal({ open: false, userId: null, userName: "" })}
                                        className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition-all duration-200"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={deleteUser}
                                        className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-400 hover:to-pink-400 text-white rounded-lg font-medium transition-all duration-200 shadow-lg shadow-red-500/20"
                                    >
                                        Delete User
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}