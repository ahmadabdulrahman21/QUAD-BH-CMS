'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
    FiArrowUp, 
    FiArrowDown, 
    FiEdit3, 
    FiGrid, 
    FiClock, 
    FiSettings, 
    FiAlertCircle, 
    FiMove, 
    FiLayers,
    FiRefreshCw,
    FiChevronRight
} from 'react-icons/fi';

export default function SectionAdmin() {
    const router = useRouter();

    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [dragIndex, setDragIndex] = useState(null);
    const [dragOverIndex, setDragOverIndex] = useState(null);

    const canReorder = (type) => type !== 'navbar' && type !== 'footer';

    // ================= FETCH =================
    const fetchSections = async () => {
        try {
            setLoading(true);
            setError(null);

            const res = await fetch('/api/sections');
            if (!res.ok) throw new Error(`Failed to load sections (${res.status})`);

            const json = await res.json();

            setSections(
                Array.isArray(json?.sections)
                    ? json.sections.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                    : []
            );
        } catch (err) {
            setError(err.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSections();
    }, []);

    // ================= SWAP API =================
    const swapOrder = async (currentId, targetId) => {
        try {
            setActionLoading(true);

            const res = await fetch('/api/sections', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: currentId,
                    swapWith: targetId,
                }),
            });

            if (!res.ok) throw new Error('Swap failed');

        } catch (err) {
            alert(err.message);
            fetchSections();
        } finally {
            setActionLoading(false);
        }
    };

    // ================= SWAP STATE =================
    const swapInState = (from, to) => {
        setSections((prev) => {
            const updated = [...prev];
            [updated[from], updated[to]] = [updated[to], updated[from]];
            return updated;
        });
    };

    // ================= MOVE BUTTONS =================
    const moveUp = async (index) => {
        if (index === 0) return;

        swapInState(index, index - 1);
        await swapOrder(sections[index].id, sections[index - 1].id);
    };

    const moveDown = async (index) => {
        if (index === sections.length - 1) return;

        swapInState(index, index + 1);
        await swapOrder(sections[index].id, sections[index + 1].id);
    };

    // ================= DRAG HANDLERS =================
    const handleDragStart = (index) => {
        setDragIndex(index);
    };

    const handleDragOver = (e, index) => {
        e.preventDefault();
        setDragOverIndex(index);
    };

    const handleDragLeave = () => {
        setDragOverIndex(null);
    };

    const handleDrop = async (index) => {
        setDragOverIndex(null);
        
        if (dragIndex === null || dragIndex === index) {
            setDragIndex(null);
            return;
        }

        const dragged = sections[dragIndex];
        const target = sections[index];

        if (!canReorder(dragged.type) || !canReorder(target.type)) {
            setDragIndex(null);
            return;
        }

        swapInState(dragIndex, index);
        await swapOrder(dragged.id, target.id);
        setDragIndex(null);
    };

    const handleDragEnd = () => {
        setDragIndex(null);
        setDragOverIndex(null);
    };

    const safeDate = (date) => {
        if (!date) return 'Never';
        const d = new Date(date);
        const now = new Date();
        const diff = now - d;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getSectionColor = (type) => {
        const colors = {
            navbar: 'from-purple-500 to-pink-500',
            hero: 'from-blue-500 to-cyan-500',
            about: 'from-emerald-500 to-teal-500',
            brands: 'from-orange-500 to-red-500',
            qoworking: 'from-indigo-500 to-purple-500',
            uplifts: 'from-green-500 to-emerald-500',
            academy: 'from-yellow-500 to-orange-500',
            digitalmedia: 'from-pink-500 to-rose-500',
            footer: 'from-gray-500 to-slate-500',
        };
        return colors[type] || 'from-cyan-500 to-blue-500';
    };

    // ================= UI STATES =================
    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-slate-600 border-t-cyan-500 mb-4"></div>
                    <p className="text-gray-400 text-lg">Loading sections...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center bg-slate-800/50 border border-red-500/20 rounded-2xl p-8 max-w-md">
                    <FiAlertCircle className="mx-auto text-red-400 text-5xl mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">Error Loading Sections</h2>
                    <p className="text-gray-400 mb-4">{error}</p>
                    <button
                        onClick={fetchSections}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl font-medium transition-all duration-200"
                    >
                        <FiRefreshCw className="text-lg" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
                
                {/* ================= HEADER ================= */}
                <div className="relative overflow-hidden bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 sm:p-8">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Manage Sections
                            </h1>
                            <p className="text-gray-400 mt-2 text-sm sm:text-base">
                                Drag & drop to reorder your layout sections
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                                <FiLayers className="text-cyan-400" />
                                <span className="text-white font-semibold">{sections.length}</span>
                                <span className="text-gray-400 text-sm">Sections</span>
                            </div>
                            
                            <button
                                onClick={fetchSections}
                                className="p-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                                title="Refresh sections"
                            >
                                <FiRefreshCw className="text-gray-400" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* ================= DRAG INSTRUCTIONS ================= */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-4 flex items-center gap-3">
                    <FiMove className="text-cyan-400 flex-shrink-0" />
                    <p className="text-sm text-gray-400">
                        <span className="text-white font-medium">Drag sections</span> using the grip handle to reorder. 
                        <span className="text-yellow-400 ml-1">Navbar</span> and <span className="text-yellow-400">Footer</span> positions are fixed.
                    </p>
                </div>

                {/* ================= SECTIONS LIST ================= */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden">
                    <div className="divide-y divide-slate-700/50">
                        {sections.length === 0 ? (
                            <div className="p-12 text-center">
                                <FiLayers className="mx-auto text-5xl text-gray-600 mb-4" />
                                <h3 className="text-lg font-semibold text-white mb-2">No Sections Found</h3>
                                <p className="text-gray-400">No sections have been configured yet.</p>
                            </div>
                        ) : (
                            sections.map((section, index) => {
                                const isDragging = dragIndex === index;
                                const isDragOver = dragOverIndex === index;
                                const isFirst = index === 0;
                                const isLast = index === sections.length - 1;
                                const canMove = canReorder(section.type);

                                return (
                                    <div
                                        key={section.id}
                                        draggable={canMove}
                                        onDragStart={() => canMove && handleDragStart(index)}
                                        onDragOver={(e) => canMove && handleDragOver(e, index)}
                                        onDragLeave={handleDragLeave}
                                        onDrop={() => canMove && handleDrop(index)}
                                        onDragEnd={handleDragEnd}
                                        className={`group flex items-center gap-4 p-4 sm:p-5 transition-all duration-200 ${
                                            isDragging 
                                                ? 'opacity-50 bg-slate-700/30 scale-95' 
                                                : isDragOver
                                                    ? 'bg-cyan-500/10 border-l-4 border-cyan-500'
                                                    : 'hover:bg-slate-800/30'
                                        } ${canMove ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                    >
                                        {/* Drag Handle */}
                                        <div className={`flex-shrink-0 ${canMove ? 'text-gray-500 group-hover:text-cyan-400' : 'text-gray-700'} transition-colors`}>
                                            <FiMove size={20} />
                                        </div>

                                        {/* Section Color Indicator */}
                                        <div className={`hidden sm:block w-1.5 h-12 rounded-full bg-gradient-to-b ${getSectionColor(section.type)} flex-shrink-0`}></div>

                                        {/* Section Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <h3 className="text-lg font-bold text-white capitalize">
                                                    {section.type}
                                                </h3>
                                                
                                                {!canMove && (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full text-xs font-medium text-yellow-400">
                                                        Fixed Position
                                                    </span>
                                                )}

                                                <span className="text-xs text-gray-500 bg-slate-800/50 px-2 py-0.5 rounded-full">
                                                    Order: {section.order ?? index}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-4 mt-1.5">
                                                <span className="flex items-center gap-1.5 text-xs text-gray-500">
                                                    <FiClock size={12} />
                                                    {safeDate(section.updated_at)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Reorder Buttons */}
                                        {canMove && (
                                            <div className="hidden sm:flex items-center gap-1 bg-slate-900/50 border border-slate-700/50 rounded-lg p-1">
                                                <button
                                                    onClick={() => moveUp(index)}
                                                    disabled={actionLoading || isFirst}
                                                    className="p-2 hover:bg-slate-700/50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-gray-400 hover:text-white"
                                                    title="Move up"
                                                >
                                                    <FiArrowUp size={16} />
                                                </button>
                                                <div className="w-px h-4 bg-slate-700"></div>
                                                <button
                                                    onClick={() => moveDown(index)}
                                                    disabled={actionLoading || isLast}
                                                    className="p-2 hover:bg-slate-700/50 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 text-gray-400 hover:text-white"
                                                    title="Move down"
                                                >
                                                    <FiArrowDown size={16} />
                                                </button>
                                            </div>
                                        )}

                                        {/* Edit Button */}
                                        <button
                                            onClick={() => router.push(`/admin/sections/${section.type}`)}
                                            className="flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white rounded-xl text-sm font-semibold transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 group"
                                        >
                                            <FiSettings size={16} />
                                            <span className="hidden sm:inline">Configure</span>
                                            <FiChevronRight size={16} className="hidden sm:block" />
                                        </button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ================= QUICK ACTIONS ================= */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <button
                        onClick={fetchSections}
                        className="flex items-center justify-center gap-2 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 transition-all duration-200 text-gray-400 hover:text-white"
                    >
                        <FiRefreshCw size={18} />
                        <span className="text-sm font-medium">Refresh List</span>
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                        <FiLayers size={18} className="text-cyan-400" />
                        <span className="text-sm text-gray-400">
                            <span className="text-white font-bold">{sections.length}</span> Total Sections
                        </span>
                    </div>

                    <div className="flex items-center justify-center gap-2 p-4 bg-slate-800/50 border border-slate-700/50 rounded-xl">
                        <FiMove size={18} className="text-purple-400" />
                        <span className="text-sm text-gray-400">
                            <span className="text-white font-bold">
                                {sections.filter(s => canReorder(s.type)).length}
                            </span> Reorderable
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}