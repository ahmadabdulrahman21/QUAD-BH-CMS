'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    FiArrowLeft,
    FiHeart,
    FiShare2,
    FiImage as FiImageIcon,
    FiLoader,
    FiAlertCircle,
    FiUsers,
    FiTarget,
    FiCheckCircle,
    FiMaximize2,
    FiChevronRight,
    FiMoreHorizontal,
    FiCalendar,
    FiClock,
    FiBookmark,
    FiMessageCircle,
    FiGlobe,
    FiTrendingUp,
    FiCheck,
    FiGrid,
    FiList,
    FiVideo,
    FiPlay,
    FiPause,
    FiX
} from 'react-icons/fi';

export default function InitiativeDetailsPage() {
    const { id } = useParams();
    const router = useRouter();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [liked, setLiked] = useState(false);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [activeMedia, setActiveMedia] = useState(null);
    const [activeMediaType, setActiveMediaType] = useState('image');
    const [expanded, setExpanded] = useState({});
    const [viewMode, setViewMode] = useState('list');
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('stories');

    useEffect(() => {
        if (!id) return;

        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/uplifts/${id}/items`);
                const result = await res.json();

                if (!res.ok || !result.success) throw new Error(result.message);

                setData(result.data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const parseContent = (content) => {
        try {
            return typeof content === 'string' ? JSON.parse(content) : content || [];
        } catch {
            return [];
        }
    };

    const toggleExpand = (id) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const openMedia = (url, type = 'image') => {
        setActiveMedia(url);
        setActiveMediaType(type);
        setIsLightboxOpen(true);
        document.body.style.overflow = 'hidden';
    };

    const closeMedia = () => {
        setIsLightboxOpen(false);
        document.body.style.overflow = 'auto';
        setActiveMedia(null);
        setActiveMediaType('image');
    };

    // Handle escape key to close lightbox
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isLightboxOpen) {
                closeMedia();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isLightboxOpen]);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: data?.uplift?.title,
                    text: data?.uplift?.description,
                    url: window.location.href
                });
            } catch (err) {
                if (err.name !== 'AbortError') handleCopyLink();
            }
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FiLoader className="text-gray-800 text-xl animate-pulse" />
                    </div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading initiative...</p>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="text-red-500 text-3xl" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
                    <p className="text-gray-500 mb-6">{error || 'Initiative not found'}</p>
                    <button
                        onClick={() => router.back()}
                        className="cursor-pointer px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const { uplift, items } = data;

    const totalImages = items.reduce((acc, i) => {
        const blocks = parseContent(i.content);
        return acc + blocks.filter(b => b.type === 'image' && (!b.media_type || b.media_type === 'image')).length;
    }, 0);

    const totalVideos = items.reduce((acc, i) => {
        const blocks = parseContent(i.content);
        return acc + blocks.filter(b => b.type === 'image' && b.media_type === 'video').length;
    }, 0);

    const totalTexts = items.reduce((acc, i) => {
        const blocks = parseContent(i.content);
        return acc + blocks.filter(b => b.type === 'text').length;
    }, 0);

    return (
        <div className="min-h-screen bg-gray-50">

            {/* LIGHTBOX - Fixed video playback */}
            {isLightboxOpen && (
                <div
                    className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
                    onClick={closeMedia}
                >
                    <button
                        onClick={closeMedia}
                        className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors z-10"
                    >
                        <FiX size={24} />
                    </button>
                    <div className="relative max-w-7xl w-full h-full flex items-center justify-center">
                        {activeMediaType === 'video' ? (
                            <video
                                src={activeMedia}
                                controls
                                autoPlay
                                playsInline
                                className="max-w-full max-h-full rounded-lg"
                                controlsList="nodownload"
                                onClick={(e) => e.stopPropagation()}
                            >
                                Your browser does not support the video tag.
                            </video>
                        ) : (
                            <img
                                src={activeMedia}
                                alt="Full size"
                                className="max-w-full max-h-full object-contain"
                                onClick={(e) => e.stopPropagation()}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.back()}
                            className="cursor-pointer flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={18} />
                            <span className="cursor-pointer text-sm font-medium hidden sm:inline">Back</span>
                        </button>

                        <div className="flex items-center gap-1">
                            {/* View Mode Toggle */}
                            <div className="flex bg-gray-100 rounded-lg p-0.5 mr-2">
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'list'
                                        ? 'bg-white shadow-sm text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    title="List View"
                                >
                                    <FiList size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded-md transition-all duration-200 ${viewMode === 'grid'
                                        ? 'bg-white shadow-sm text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                    title="Grid View"
                                >
                                    <FiGrid size={16} />
                                </button>
                            </div>
                            <button
                                onClick={handleShare}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                {copied ? <FiCheck size={18} className="text-green-500" /> : <FiShare2 size={18} />}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* HERO SECTION */}
            <section className="relative bg-white border-b border-gray-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 lg:py-16">
                    <div className="max-w-3xl">
                        {/* Badges */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                <FiTarget size={14} />
                                Social Initiative
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
                                <FiTrendingUp size={14} />
                                Active
                            </span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                            {uplift.title}
                        </h1>

                        <p className="text-lg text-gray-600 leading-relaxed mb-6">
                            {uplift.description}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1.5">
                                <FiCalendar size={15} />
                                <span>Started {new Date(uplift.created_at).toLocaleDateString('en-US', {
                                    month: 'long',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}</span>
                            </div>
                            <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                            <div className="flex items-center gap-1.5">
                                <FiUsers size={15} />
                                <span>{items.length} stories</span>
                            </div>
                            {totalImages > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <div className="flex items-center gap-1.5">
                                        <FiImageIcon size={15} />
                                        <span>{totalImages} images</span>
                                    </div>
                                </>
                            )}
                            {totalVideos > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                    <div className="flex items-center gap-1.5">
                                        <FiVideo size={15} />
                                        <span>{totalVideos} videos</span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* STATS BAR */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Total Stories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{totalImages}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Images</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{totalVideos}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Videos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{totalTexts}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Contributions</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">🌟</div>
                            <div className="text-xs text-gray-500 mt-0.5">Community Impact</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT SECTION */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-100 p-1 mb-8">
                    <button
                        onClick={() => setActiveTab('stories')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'stories'
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Stories
                    </button>
                    <button
                        onClick={() => setActiveTab('media')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'media'
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Media Gallery
                    </button>
                    <button
                        onClick={() => setActiveTab('impact')}
                        className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'impact'
                            ? 'bg-gray-900 text-white shadow-sm'
                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                    >
                        Impact
                    </button>
                </div>

                {activeTab === 'stories' && (
                    <>
                        {items.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                                    <FiMessageCircle className="text-2xl text-gray-400" />
                                </div>
                                <p className="text-gray-600">No stories available yet.</p>
                                <p className="text-gray-400 text-sm mt-1">Check back soon for updates!</p>
                            </div>
                        ) : (
                            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                                {items.map((item, index) => {
                                    const blocks = parseContent(item.content);
                                    const texts = blocks.filter(b => b.type === 'text');
                                    const images = blocks.filter(b => b.type === 'image' && (!b.media_type || b.media_type === 'image'));
                                    const videos = blocks.filter(b => b.type === 'image' && b.media_type === 'video');
                                    const allMedia = [...images, ...videos];
                                    const isOpen = expanded[item.id];

                                    if (viewMode === 'grid') {
                                        return (
                                            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
                                                {allMedia.length > 0 && (
                                                    <div
                                                        className="relative h-48 w-full bg-gray-100 cursor-pointer overflow-hidden"
                                                        onClick={() => openMedia(allMedia[0].url, allMedia[0].media_type || 'image')}
                                                    >
                                                        {allMedia[0].media_type === 'video' ? (
                                                            <div className="relative w-full h-full">
                                                                <video
                                                                    src={allMedia[0].url}
                                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    muted
                                                                />
                                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                                    <div className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center">
                                                                        <FiPlay className="text-gray-800 text-2xl ml-1" />
                                                                    </div>
                                                                </div>
                                                                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                                                                    <FiVideo size={12} />
                                                                    Video
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <Image
                                                                    src={allMedia[0].url}
                                                                    alt={`Story ${index + 1}`}
                                                                    fill
                                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                                    sizes="(max-width: 768px) 100vw, 400px"
                                                                />
                                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                                                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full">
                                                                    <FiImageIcon size={12} />
                                                                    {allMedia.length}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                                <div className="p-5">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                                            <FiCheckCircle size={12} />
                                                            Story {index + 1}
                                                        </span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <FiClock size={12} />
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    {(isOpen ? texts : texts.slice(0, 2)).map((t, i) => (
                                                        <p key={i} className="text-gray-700 text-sm leading-relaxed mb-2">
                                                            {t.value}
                                                        </p>
                                                    ))}
                                                    {texts.length > 2 && (
                                                        <button
                                                            onClick={() => toggleExpand(item.id)}
                                                            className="text-xs text-gray-600 hover:text-gray-900 font-medium mt-1"
                                                        >
                                                            {isOpen ? 'Show less' : `+ ${texts.length - 2} more`}
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    }

                                    return (
                                        <div key={item.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                                            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                                                <div className="flex items-center justify-between flex-wrap gap-2">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                                            <FiCheckCircle size={14} className="text-gray-600" />
                                                            Story {index + 1}
                                                        </span>
                                                        <span className="text-xs text-gray-400 flex items-center gap-1">
                                                            <FiClock size={12} />
                                                            {new Date(item.created_at).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600">
                                                            {blocks.length} blocks
                                                        </span>
                                                        {images.length > 0 && (
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600 flex items-center gap-1">
                                                                <FiImageIcon size={12} />
                                                                {images.length}
                                                            </span>
                                                        )}
                                                        {videos.length > 0 && (
                                                            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-600 flex items-center gap-1">
                                                                <FiVideo size={12} />
                                                                {videos.length}
                                                            </span>
                                                        )}
                                                        <button onClick={() => toggleExpand(item.id)} className="text-gray-400 hover:text-gray-600">
                                                            <FiMoreHorizontal size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="p-6 space-y-4">
                                                {(isOpen ? texts : texts.slice(0, 2)).map((t, i) => (
                                                    <p key={i} className="text-gray-700 leading-relaxed">
                                                        {t.value}
                                                    </p>
                                                ))}

                                                {texts.length > 2 && (
                                                    <button
                                                        onClick={() => toggleExpand(item.id)}
                                                        className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
                                                    >
                                                        {isOpen ? 'Show less' : `Read ${texts.length - 2} more`}
                                                        <FiChevronRight className={`transition-transform ${isOpen ? 'rotate-90' : ''}`} size={14} />
                                                    </button>
                                                )}

                                                {/* Display Images and Videos */}
                                                {allMedia.length > 0 && (
                                                    <div className={`grid gap-3 pt-2 ${allMedia.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                                                        {allMedia.map((media, i) => {
                                                            const isVideo = media.media_type === 'video';
                                                            return (
                                                                <div
                                                                    key={i}
                                                                    className={`relative rounded-xl overflow-hidden bg-gray-100 cursor-pointer group/media ${isVideo ? 'aspect-video' : 'aspect-video'}`}
                                                                    onClick={() => openMedia(media.url, isVideo ? 'video' : 'image')}
                                                                >
                                                                    {isVideo ? (
                                                                        <div className="relative w-full h-full">
                                                                            <video
                                                                                src={media.url}
                                                                                className="w-full h-full object-cover transition-transform duration-500 group-hover/media:scale-105"
                                                                                muted
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                                                <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                                                    <FiPlay className="text-gray-800 text-2xl ml-1" />
                                                                                </div>
                                                                            </div>
                                                                            <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                                                <FiVideo size={12} />
                                                                                Video
                                                                            </div>
                                                                        </div>
                                                                    ) : (
                                                                        <>
                                                                            <Image
                                                                                src={media.url}
                                                                                alt={`Visual ${i + 1}`}
                                                                                fill
                                                                                className="object-cover transition-transform duration-500 group-hover/media:scale-105"
                                                                                sizes="(max-width: 768px) 100vw, 800px"
                                                                            />
                                                                            <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                                                                <button className="opacity-0 group-hover/media:opacity-100 transition-opacity p-2 bg-white/90 rounded-full text-gray-700 hover:bg-white shadow-lg">
                                                                                    <FiMaximize2 size={16} />
                                                                                </button>
                                                                            </div>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}

                {activeTab === 'media' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {items.flatMap((item, index) => {
                            const blocks = parseContent(item.content);
                            const images = blocks.filter(b => b.type === 'image' && (!b.media_type || b.media_type === 'image'));
                            const videos = blocks.filter(b => b.type === 'image' && b.media_type === 'video');
                            const allMedia = [...images, ...videos];
                            return allMedia.map((media, i) => {
                                const isVideo = media.media_type === 'video';
                                return (
                                    <div
                                        key={`${item.id}-${i}`}
                                        className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group bg-gray-100"
                                        onClick={() => openMedia(media.url, isVideo ? 'video' : 'image')}
                                    >
                                        {isVideo ? (
                                            <div className="relative w-full h-full">
                                                <video
                                                    src={media.url}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    muted
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                    <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                                                        <FiPlay className="text-gray-800 text-2xl ml-1" />
                                                    </div>
                                                </div>
                                                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                    <FiVideo size={12} />
                                                    Video
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <Image
                                                    src={media.url}
                                                    alt={`Media ${i + 1}`}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                    sizes="(max-width: 768px) 50vw, 25vw"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300 flex items-center justify-center">
                                                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-3 bg-white/90 rounded-full text-gray-700 hover:bg-white shadow-lg">
                                                        <FiMaximize2 size={18} />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                        <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full">
                                            Story {index + 1}
                                        </div>
                                    </div>
                                );
                            });
                        })}
                    </div>
                )}

                {activeTab === 'impact' && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                            <FiGlobe className="text-3xl text-gray-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">Making a Difference</h3>
                        <p className="text-gray-500 max-w-md mx-auto mb-6">
                            This initiative has collected {items.length} powerful stories from the community,
                            showcasing real impact and inspiring change.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                                <div className="text-sm font-semibold text-gray-900">{items.length}</div>
                                <div className="text-xs text-gray-500">Stories Collected</div>
                            </div>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                                <div className="text-sm font-semibold text-gray-900">{totalImages}</div>
                                <div className="text-xs text-gray-500">Images Shared</div>
                            </div>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                                <div className="text-sm font-semibold text-gray-900">{totalVideos}</div>
                                <div className="text-xs text-gray-500">Videos Shared</div>
                            </div>
                            <div className="px-4 py-2 bg-gray-50 rounded-lg">
                                <div className="text-sm font-semibold text-gray-900">{totalTexts}</div>
                                <div className="text-xs text-gray-500">Contributions</div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FOOTER CTA */}
            <div className="border-t border-gray-100 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
                    <div className="text-center max-w-2xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Support This Initiative</h3>
                        <p className="text-gray-500 mb-6">
                            Help us amplify these stories and create more impact in the community.
                        </p>
                        <div className="flex flex-wrap gap-3 justify-center">
                            <button
                                onClick={() => router.push('/uplifts')}
                                className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                            >
                                Explore More
                            </button>
                            <button
                                onClick={handleShare}
                                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                            >
                                {copied ? (
                                    <>
                                        <FiCheck size={16} />
                                        Copied!
                                    </>
                                ) : (
                                    <>
                                        <FiShare2 size={16} />
                                        Share
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}