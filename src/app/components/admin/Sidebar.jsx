'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    FiHome,
    FiGrid,
    FiTrendingUp,
    FiUsers,
    FiLogOut,
    FiKey,
    FiMenu,
    FiX,
    FiEye,
    FiEyeOff,
    FiAlertCircle,
    FiCheckCircle,
    FiInfo,
    FiSettings,
    FiChevronRight,
    FiLayers,
    FiBox
} from 'react-icons/fi';

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [expandedMenus, setExpandedMenus] = useState({
        Uplifts: true // Start expanded by default
    });

    /* ================= RESET ================= */
    const [resetOpen, setResetOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    /* ================= ALERT ================= */
    const [alert, setAlert] = useState({
        open: false,
        type: "info",
        message: ""
    });

    const showAlert = (message, type = "info") => {
        setAlert({ open: true, message, type });
    };

    const closeAlert = () => {
        setAlert({ open: false, message: "", type: "info" });
    };

    const toggleMenu = (menuName) => {
        setExpandedMenus(prev => ({
            ...prev,
            [menuName]: !prev[menuName]
        }));
    };

    const links = [
        {
            name: 'Dashboard',
            href: '/admin',
            icon: FiHome,
            pattern: /^\/admin$/
        },
        {
            name: 'Sections',
            href: "/admin/sections",
            icon: FiGrid,
            pattern: /^\/admin\/sections/
        },
        {
            name: 'Uplifts',
            icon: FiTrendingUp,
            pattern: /^\/admin\/uplifts/,
            submenu: [
                {
                    name: 'All Uplifts',
                    href: '/admin/uplifts',
                    pattern: /^\/admin\/uplifts$/
                },
                {
                    name: 'Uplift Items',
                    href: '/admin/uplifts/items',
                    pattern: /^\/admin\/uplifts\/items/
                }
            ]
        },
        {
            name: 'Users',
            href: '/admin/users',
            roles: ['admin'],
            icon: FiUsers,
            pattern: /^\/admin\/users/
        },
    ];

    useEffect(() => {
        setIsOpen(false);
    }, [pathname]);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/auth/me', {
                    credentials: 'include'
                });
                const data = await res.json();

                if (data.success) setUser(data.user);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    /* ================= LOGOUT ================= */
    const handleLogout = async () => {
        try {
            setLoggingOut(true);

            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            });

            setUser(null);
            router.push('/admin/login');
            router.refresh();

        } catch (err) {
            console.error(err);
        } finally {
            setLoggingOut(false);
        }
    };

    /* ================= RESET PASSWORD ================= */
    const handleResetPassword = async () => {
        if (!newPassword) {
            showAlert("Password is required", "error");
            return;
        }

        if (newPassword.length < 8) {
            showAlert("Password must be at least 8 characters", "error");
            return;
        }

        try {
            const res = await fetch("/api/users/reset-password", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId: user.id,
                    newPassword
                })
            });

            const data = await res.json();

            if (!data.success) {
                showAlert(data.error, "error");
                return;
            }

            setResetOpen(false);
            setNewPassword("");
            setShowPassword(false);
            showAlert("Password updated successfully", "success");

        } catch (err) {
            showAlert(err.message, "error");
        }
    };

    const filteredLinks = links.filter((link) => {
        if (!link.roles) return true;
        return user && link.roles.includes(user.role);
    });

    const isActive = (link) => {
        if (link.pattern) {
            return link.pattern.test(pathname);
        }
        return pathname === link.href || pathname.startsWith(link.href + '/');
    };

    const renderNavLink = (link) => {
        const Icon = link.icon;
        const active = isActive(link);
        const hasSubmenu = link.submenu && link.submenu.length > 0;
        const isExpanded = expandedMenus[link.name];

        if (hasSubmenu) {
            const isAnySubActive = link.submenu.some(sub => isActive(sub));
            const IconComponent = link.icon;

            return (
                <div key={link.name} className="space-y-1">
                    <button
                        onClick={() => toggleMenu(link.name)}
                        className={`w-full group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative cursor-pointer ${isAnySubActive || active
                            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                            }`}
                    >
                        <IconComponent className={`text-lg flex-shrink-0 ${isAnySubActive || active ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                        <span className="text-sm font-medium flex-1 text-left">{link.name}</span>
                        <FiChevronRight className={`text-sm transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                    </button>

                    {isExpanded && (
                        <div className="ml-6 pl-3 border-l border-slate-700/50 space-y-1">
                            {link.submenu.map((sub) => {
                                const SubIcon = sub.icon || FiBox;
                                const subActive = isActive(sub);
                                return (
                                    <Link
                                        key={sub.href}
                                        href={sub.href}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm cursor-pointer ${subActive
                                            ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20'
                                            : 'text-gray-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                                            }`}
                                    >
                                        <SubIcon className={`text-sm ${subActive ? 'text-cyan-400' : 'text-gray-500'}`} />
                                        <span>{sub.name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative cursor-pointer ${active
                    ? 'bg-gradient-to-r from-cyan-500/10 to-blue-500/10 text-cyan-400 border border-cyan-500/20'
                    : 'text-gray-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
                    }`}
            >
                <Icon className={`text-lg flex-shrink-0 ${active ? 'text-cyan-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
                <span className="text-sm font-medium">{link.name}</span>
                {active && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400"></div>
                    </div>
                )}
            </Link>
        );
    };

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Logo & Brand */}
            <div className="p-6 border-b border-slate-700/50">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center overflow-hidden shadow-lg shadow-cyan-500/20">
                        <Image
                            src="/images/logo.png"
                            alt="logo"
                            fill
                            className="object-contain p-1.5"
                        />
                    </div>
                    <div>
                        <span className="font-bold text-lg bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                            Admin Panel
                        </span>
                        <p className="text-xs text-gray-500">Management Console</p>
                    </div>
                </Link>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1.5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
                    Navigation
                </p>

                {filteredLinks.map((link) => renderNavLink(link))}
            </nav>

            {/* User Info & Actions */}
            <div className="p-4 border-t border-slate-700/50 space-y-3">
                {/* User Profile */}
                {user && (
                    <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {user.email?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user.email}
                            </p>
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                ? 'bg-purple-500/20 text-purple-400'
                                : 'bg-cyan-500/20 text-cyan-400'
                                }`}>
                                {user.role}
                            </span>
                        </div>
                    </div>
                )}

                {/* Reset Password Button - Admin Only */}
                {user?.role === "admin" && (
                    <button
                        onClick={() => setResetOpen(true)}
                        className="flex items-center gap-2 w-full px-3 py-2.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 rounded-xl text-sm font-medium transition-all duration-200 group cursor-pointer"
                    >
                        <FiKey className="text-lg" />
                        <span>Reset Password</span>
                    </button>
                )}

                {/* Logout Button */}
                {user && (
                    <button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="flex items-center gap-2 w-full px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <FiLogOut className="text-lg" />
                        <span>{loggingOut ? "Logging out..." : "Logout"}</span>
                    </button>
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Alert Modal */}
            {alert.open && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[3000] p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
                        <div className="p-6 text-center">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${alert.type === "success"
                                ? "bg-green-500/20"
                                : alert.type === "error"
                                    ? "bg-red-500/20"
                                    : "bg-cyan-500/20"
                                }`}>
                                {alert.type === "success" ? (
                                    <FiCheckCircle className="text-green-400 text-2xl" />
                                ) : alert.type === "error" ? (
                                    <FiAlertCircle className="text-red-400 text-2xl" />
                                ) : (
                                    <FiInfo className="text-cyan-400 text-2xl" />
                                )}
                            </div>

                            <h3 className={`text-lg font-semibold mb-2 ${alert.type === "success"
                                ? "text-green-400"
                                : alert.type === "error"
                                    ? "text-red-400"
                                    : "text-cyan-400"
                                }`}>
                                {alert.type.toUpperCase()}
                            </h3>

                            <p className="text-gray-300 mb-6">{alert.message}</p>

                            <button
                                onClick={closeAlert}
                                className="w-full px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200 cursor-pointer"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Reset Password Modal */}
            {resetOpen && user?.role === "admin" && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-[2000] p-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
                        <div className="flex items-center justify-between p-6 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                                    <FiKey className="text-yellow-400 text-lg" />
                                </div>
                                <h3 className="text-lg font-semibold text-white">
                                    Reset Password
                                </h3>
                            </div>
                            <button
                                onClick={() => {
                                    setResetOpen(false);
                                    setShowPassword(false);
                                }}
                                className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <FiX size={20} />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1.5">
                                    New Password
                                </label>
                                <div className="relative">
                                    <FiKey className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full pl-10 pr-12 py-2.5 bg-slate-900 border border-slate-700 rounded-xl focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all text-white placeholder-gray-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors cursor-pointer"
                                    >
                                        {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                                    </button>
                                </div>
                                <p className="text-xs text-gray-500 mt-1.5">
                                    Password must be at least 8 characters long
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setResetOpen(false);
                                        setNewPassword("");
                                        setShowPassword(false);
                                    }}
                                    className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 rounded-xl font-medium transition-all duration-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    className="px-6 py-2.5 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-white rounded-xl font-medium transition-all duration-200 shadow-lg shadow-yellow-500/20 cursor-pointer"
                                >
                                    Update Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="lg:hidden fixed top-4 left-4 z-[100] p-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white hover:bg-slate-700 transition-all duration-200 shadow-lg cursor-pointer"
            >
                {isOpen ? <FiX size={22} /> : <FiMenu size={22} />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] cursor-pointer"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:block lg:sticky top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 shadow-2xl">
                {sidebarContent}
            </aside>

            {/* Sidebar - Mobile */}
            <aside className={`lg:hidden fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-slate-900 to-slate-950 border-r border-slate-700/50 shadow-2xl z-[95] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {sidebarContent}
            </aside>
        </>
    );
}