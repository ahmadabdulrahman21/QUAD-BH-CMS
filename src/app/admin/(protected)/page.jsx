'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    FiLayers,
    FiActivity,
    FiZap,
    FiGrid,
    FiTrendingUp,
    FiUsers,
    FiExternalLink,
    FiClock,
    FiArrowRight,
    FiCheckCircle,
    FiSettings,
    FiEdit,
    FiUser,
    FiBarChart2
} from 'react-icons/fi';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        sections: 0,
        recent: null,
        loading: true,
    });

    const [user, setUser] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch user data
                const userRes = await fetch('/api/auth/me', {
                    credentials: 'include',
                });
                const userData = await userRes.json();

                if (userData.success) {
                    const u = userData.user;
                    setUser({
                        ...u,
                        name: u.email
                    });
                }

                // Fetch stats
                const res = await fetch('/api/admin/stats');
                const json = await res.json();

                setStats({
                    sections: json.sections || 0,
                    recent: json.recent || null,
                    loading: false,
                });
            } catch (err) {
                console.error(err);
                setStats((s) => ({ ...s, loading: false }));
            }
        };

        fetchData();
    }, []);

    // Quick action items
    const quickActions = [
        {
            title: 'Manage Sections',
            description: 'Edit website sections',
            href: '/admin/sections',
            icon: FiGrid,
            color: 'from-cyan-500 to-blue-500',
            bgColor: 'bg-cyan-500/10',
            iconColor: 'text-cyan-400',
            always: true
        },
        {
            title: 'Manage Users',
            description: 'Admin & editor accounts',
            href: '/admin/users',
            icon: FiUsers,
            color: 'from-purple-500 to-pink-500',
            bgColor: 'bg-purple-500/10',
            iconColor: 'text-purple-400',
            adminOnly: true
        },
        {
            title: 'View Website',
            description: 'Open live website',
            href: '/',
            icon: FiExternalLink,
            color: 'from-orange-500 to-red-500',
            bgColor: 'bg-orange-500/10',
            iconColor: 'text-orange-400',
            external: true,
            always: true
        },
    ];

    if (stats.loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-cyan-500 mb-4"></div>
                    <p className="text-gray-400 text-lg">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6 lg:space-y-8">

                {/* ================= HEADER ================= */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Dashboard
                                </h1>
                                <p className="text-gray-400 mt-2 text-sm sm:text-base">
                                    Manage your website sections & content
                                </p>
                            </div>

                            {/* User Profile Badge */}
                            {user && (
                                <div className="flex items-center gap-3 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white font-bold">
                                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {user.name}
                                        </p>
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin'
                                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                                            : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                            }`}>
                                            <FiUser className="text-[10px]" />
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ================= STATS CARDS ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {/* Total Sections */}
                    <div className="group relative bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                                    <FiLayers className="text-cyan-400 text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-400">Total Sections</p>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">
                                        {stats.sections}
                                    </h2>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-4">All configured sections</p>
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    {/* System Status */}
                    <div className="group relative bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-6 hover:border-emerald-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/10">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                                    <FiCheckCircle className="text-emerald-400 text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-300/80">System Status</p>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">Live</h2>
                                </div>
                            </div>
                            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
                        </div>
                        <p className="text-xs text-emerald-400/60 mt-4">System running smoothly</p>
                    </div>

                    {/* Performance */}
                    <div className="group relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-sm border border-purple-500/20 rounded-2xl p-6 hover:border-purple-400/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10">
                        <div className="flex items-start justify-between">
                            <div className="space-y-3">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                                    <FiBarChart2 className="text-purple-400 text-xl" />
                                </div>
                                <div>
                                    <p className="text-sm text-purple-300/80">Performance</p>
                                    <h2 className="text-3xl sm:text-4xl font-bold text-white mt-1">100%</h2>
                                </div>
                            </div>
                        </div>
                        <p className="text-xs text-purple-400/60 mt-4">Optimized system</p>
                    </div>
                </div>

                {/* ================= QUICK ACTIONS ================= */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                            <FiZap className="text-cyan-400 text-lg" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
                            <p className="text-sm text-gray-400">Frequently used actions</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {quickActions.map((action, index) => {
                            // Skip admin-only actions for non-admin users
                            if (action.adminOnly && user?.role !== 'admin') return null;

                            const Icon = action.icon;

                            const ActionContent = (
                                <div className="group relative bg-slate-900/50 border border-slate-700/50 rounded-xl p-5 hover:border-slate-500/50 transition-all duration-300 hover:shadow-lg cursor-pointer">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className={`w-10 h-10 rounded-lg ${action.bgColor} border border-slate-700/30 flex items-center justify-center`}>
                                            <Icon className={`${action.iconColor} text-lg`} />
                                        </div>
                                        {action.external && (
                                            <FiExternalLink className="text-gray-600 group-hover:text-gray-400 transition-colors" />
                                        )}
                                        {!action.external && (
                                            <FiArrowRight className="text-gray-600 group-hover:text-cyan-400 transition-colors" />
                                        )}
                                    </div>
                                    <h3 className="text-sm font-semibold text-white mb-1">{action.title}</h3>
                                    <p className="text-xs text-gray-500">{action.description}</p>
                                </div>
                            );

                            if (action.external) {
                                return (
                                    <a key={index} href={action.href} target="_blank" rel="noopener noreferrer">
                                        {ActionContent}
                                    </a>
                                );
                            }

                            return (
                                <Link key={index} href={action.href}>
                                    {ActionContent}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* ================= RECENT ACTIVITY & QUICK LINKS ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Recent Activity */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                <FiActivity className="text-blue-400 text-lg" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                                <p className="text-sm text-gray-400">Latest updates</p>
                            </div>
                        </div>

                        {stats.recent ? (
                            <div className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-gray-300">Last edited section</p>
                                        <p className="text-base font-semibold text-white truncate capitalize">
                                            {stats.recent.type}
                                        </p>
                                    </div>
                                    <FiClock className="text-gray-500 flex-shrink-0" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <FiClock className="mx-auto text-4xl text-gray-600 mb-3" />
                                <p className="text-gray-500">No recent activity</p>
                                <p className="text-xs text-gray-600 mt-1">Start editing sections to see activity here</p>
                            </div>
                        )}
                    </div>

                    {/* Quick Info */}
                    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                                <FiSettings className="text-orange-400 text-lg" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">Quick Info</h2>
                                <p className="text-sm text-gray-400">System overview</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                                <span className="text-sm text-gray-400">Sections Configured</span>
                                <span className="text-sm font-semibold text-white">{stats.sections}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                                <span className="text-sm text-gray-400">User Role</span>
                                <span className="text-sm font-semibold text-white capitalize">{user?.role || 'N/A'}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-900/50 border border-slate-700/50 rounded-lg">
                                <span className="text-sm text-gray-400">System Version</span>
                                <span className="text-sm font-semibold text-white">1.0.0</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}