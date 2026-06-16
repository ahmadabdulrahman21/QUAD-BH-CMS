'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    FiArrowLeft,
    FiLoader,
    FiAlertCircle,
    FiCheckCircle,
    FiImage as FiImageIcon,
    FiPlus,
    FiTrash2,
    FiSave,
    FiCopy,
    FiChevronDown,
    FiChevronUp,
    FiRefreshCw,
    FiLink,
    FiX,
    FiEye,
    FiEyeOff,
    FiGrid,
    FiList,
    FiInfo,
    FiMessageCircle,
    FiFileText,
    FiCheck,
    FiClock,
    FiUpload,
    FiVideo,
    FiPlay,
    FiPause
} from 'react-icons/fi';

export default function UpliftItemsAdminEditor() {
    const { id } = useParams();
    const router = useRouter();

    const [uplift, setUplift] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingId, setSavingId] = useState(null);
    const [error, setError] = useState('');
    const [expandedItems, setExpandedItems] = useState({});
    const [viewMode, setViewMode] = useState('list');
    const [previewMode, setPreviewMode] = useState(false);
    const [savedStates, setSavedStates] = useState({});
    const [uploadingId, setUploadingId] = useState(null);
    const [uploadProgress, setUploadProgress] = useState({});
    const [deletingId, setDeletingId] = useState(null);
    const [videoStates, setVideoStates] = useState({});

    const fileInputRefs = useRef({});
    const videoRefs = useRef({});

    // Modal state
    const [modal, setModal] = useState({
        isOpen: false,
        type: '', // 'success', 'error', 'confirm', 'info'
        title: '',
        message: '',
        onConfirm: null,
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        data: null
    });

    useEffect(() => {
        if (!id) return;

        const load = async () => {
            try {
                setLoading(true);
                const res = await fetch(`/api/uplifts/${id}/items`);
                const result = await res.json();

                if (!res.ok || !result.success) {
                    throw new Error(result.message || 'Failed to load data');
                }

                setUplift(result.data.uplift);

                const normalized = result.data.items.map(item => {
                    let content = item.content;
                    try {
                        if (typeof content === 'string') content = JSON.parse(content);
                    } catch {
                        content = [];
                    }
                    // Ensure media_type is set for image blocks
                    content = content.map(block => {
                        if (block.type === 'image' && !block.media_type) {
                            return { ...block, media_type: 'image' };
                        }
                        return block;
                    });
                    return { ...item, content };
                });

                setItems(normalized);

                // Initialize expanded state for all items
                const expandedState = {};
                normalized.forEach(item => {
                    expandedState[item.id] = true;
                });
                setExpandedItems(expandedState);

            } catch (err) {
                setError(err.message);
                showModal('error', 'Error', err.message);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [id]);

    // Modal helpers
    const showModal = (type, title, message, onConfirm = null, confirmText = 'Confirm', cancelText = 'Cancel', data = null) => {
        setModal({
            isOpen: true,
            type,
            title,
            message,
            onConfirm,
            confirmText,
            cancelText,
            data
        });
    };

    const closeModal = () => {
        setModal({
            isOpen: false,
            type: '',
            title: '',
            message: '',
            onConfirm: null,
            confirmText: 'Confirm',
            cancelText: 'Cancel',
            data: null
        });
    };

    const handleModalConfirm = () => {
        if (modal.onConfirm) {
            modal.onConfirm(modal.data);
        }
        closeModal();
    };

    // Update blocks
    const updateText = (itemIndex, blockIndex, value) => {
        const copy = [...items];
        copy[itemIndex].content[blockIndex].value = value;
        setItems(copy);
        setSavedStates(prev => ({ ...prev, [items[itemIndex].id]: false }));
    };

    const updateMedia = (itemIndex, blockIndex, value, mediaType = 'image') => {
        const copy = [...items];
        copy[itemIndex].content[blockIndex].url = value;
        copy[itemIndex].content[blockIndex].media_type = mediaType;
        if (!value.startsWith('/uploads/')) {
            copy[itemIndex].content[blockIndex].media_id = null;
        }
        setItems(copy);
        setSavedStates(prev => ({ ...prev, [items[itemIndex].id]: false }));
    };

    // Handle file upload for media blocks
    const handleFileUpload = async (itemIndex, blockIndex, file, mediaType = 'image') => {
        if (!file) return;

        // Validate file type
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
        
        if (mediaType === 'image' && !validImageTypes.includes(file.type)) {
            showModal('error', 'Invalid File', 'Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG).');
            return;
        }
        
        if (mediaType === 'video' && !validVideoTypes.includes(file.type)) {
            showModal('error', 'Invalid File', 'Please upload a valid video file (MP4, WebM, OGG, MOV).');
            return;
        }

        const itemId = items[itemIndex].id;
        const uploadKey = `${itemId}-${blockIndex}`;
        setUploadingId(uploadKey);
        setUploadProgress(prev => ({ ...prev, [uploadKey]: 0 }));

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('owner_type', 'uplift_item');
            formData.append('owner_id', itemId);

            const res = await fetch('/api/media', {
                method: 'POST',
                body: formData,
            });

            setUploadProgress(prev => ({ ...prev, [uploadKey]: 50 }));

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || 'Upload failed');
            }

            setUploadProgress(prev => ({ ...prev, [uploadKey]: 100 }));

            const copy = [...items];
            copy[itemIndex].content[blockIndex].url = result.media.url;
            copy[itemIndex].content[blockIndex].media_id = result.media.id;
            copy[itemIndex].content[blockIndex].media_type = mediaType;
            setItems(copy);
            setSavedStates(prev => ({ ...prev, [itemId]: false }));

            showModal('success', 'Upload Successful', `${mediaType === 'image' ? 'Image' : 'Video'} uploaded successfully!`);

        } catch (err) {
            showModal('error', 'Upload Failed', err.message);
        } finally {
            setUploadingId(null);
            setUploadProgress(prev => {
                const newState = { ...prev };
                delete newState[uploadKey];
                return newState;
            });
            if (fileInputRefs.current[`${itemIndex}-${blockIndex}`]) {
                fileInputRefs.current[`${itemIndex}-${blockIndex}`].value = '';
            }
        }
    };

    // Delete media from server
    const deleteMediaFromServer = async (mediaUrl, mediaId = null) => {
        try {
            const body = {};
            if (mediaId) {
                body.media_id = mediaId;
            } else if (mediaUrl) {
                body.image_url = mediaUrl;
            } else {
                throw new Error('Either media_id or image_url is required');
            }

            const res = await fetch('/api/media', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.error || 'Failed to delete media');
            }

            return true;
        } catch (err) {
            console.error('Error deleting media:', err);
            throw err;
        }
    };

    // Delete a single media block
    const deleteMediaBlock = async (itemIndex, blockIndex) => {
        const block = items[itemIndex].content[blockIndex];
        const itemId = items[itemIndex].id;
        const deleteKey = `${itemId}-${blockIndex}`;

        if (!block.url) {
            const copy = [...items];
            copy[itemIndex].content.splice(blockIndex, 1);
            setItems(copy);
            setSavedStates(prev => ({ ...prev, [itemId]: false }));
            return;
        }

        setDeletingId(deleteKey);

        try {
            const mediaId = block.media_id || null;
            const isLocalUpload = block.url && block.url.startsWith('/uploads/');

            if (isLocalUpload) {
                try {
                    if (mediaId) {
                        await deleteMediaFromServer(block.url, mediaId);
                    } else {
                        await deleteMediaFromServer(block.url, null);
                    }
                } catch (deleteErr) {
                    console.error('Error deleting from media:', deleteErr);
                }
            }

            const copy = [...items];
            copy[itemIndex].content.splice(blockIndex, 1);
            setItems(copy);
            setSavedStates(prev => ({ ...prev, [itemId]: false }));

            const mediaLabel = block.media_type === 'video' ? 'Video' : 'Image';
            showModal('success', `${mediaLabel} Removed`, `The ${mediaLabel.toLowerCase()} has been removed from the section.`);

        } catch (err) {
            console.error('Delete error:', err);
            const copy = [...items];
            copy[itemIndex].content.splice(blockIndex, 1);
            setItems(copy);
            setSavedStates(prev => ({ ...prev, [itemId]: false }));
        } finally {
            setDeletingId(null);
        }
    };

    const addTextBlock = (itemIndex) => {
        const copy = [...items];
        copy[itemIndex].content.push({ type: 'text', value: '' });
        setItems(copy);
        setSavedStates(prev => ({ ...prev, [items[itemIndex].id]: false }));
    };

    const addMediaBlock = (itemIndex, mediaType = 'image') => {
        const copy = [...items];
        copy[itemIndex].content.push({ 
            type: 'image',        // Use 'image' type for validation
            media_type: mediaType, // Store media type for rendering
            url: '', 
            media_id: null 
        });
        setItems(copy);
        setSavedStates(prev => ({ ...prev, [items[itemIndex].id]: false }));
    };

    const removeBlock = (itemIndex, blockIndex) => {
        const block = items[itemIndex].content[blockIndex];

        if (block.type === 'image' && block.url) {
            const isLocalUpload = block.url && block.url.startsWith('/uploads/');
            const mediaLabel = block.media_type === 'video' ? 'video' : 'image';
            const confirmMessage = isLocalUpload
                ? `This ${mediaLabel} will be permanently deleted from the media library. Are you sure?`
                : `This ${mediaLabel} will be removed from the section. Are you sure?`;

            showModal(
                'confirm',
                isLocalUpload ? `Delete ${mediaLabel}` : `Remove ${mediaLabel}`,
                confirmMessage,
                () => deleteMediaBlock(itemIndex, blockIndex),
                isLocalUpload ? 'Yes, Delete' : 'Yes, Remove',
                'Cancel'
            );
        } else if (block.type === 'text') {
            showModal(
                'confirm',
                'Remove Text Block',
                'Are you sure you want to remove this text block?',
                () => {
                    const copy = [...items];
                    copy[itemIndex].content.splice(blockIndex, 1);
                    setItems(copy);
                    setSavedStates(prev => ({ ...prev, [items[itemIndex].id]: false }));
                    showModal('success', 'Block Removed', 'The text block has been removed successfully.');
                },
                'Yes, Remove',
                'Cancel'
            );
        } else {
            const copy = [...items];
            copy[itemIndex].content.splice(blockIndex, 1);
            setItems(copy);
            setSavedStates(prev => ({ ...prev, [items[itemIndex].id]: false }));
        }
    };

    const toggleExpand = (itemId) => {
        setExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    // Toggle video playback
    const toggleVideoPlayback = (videoId) => {
        const video = videoRefs.current[videoId];
        if (video) {
            if (video.paused) {
                video.play();
                setVideoStates(prev => ({ ...prev, [videoId]: true }));
            } else {
                video.pause();
                setVideoStates(prev => ({ ...prev, [videoId]: false }));
            }
        }
    };

    // Save item
    const saveItem = async (item) => {
        try {
            setSavingId(item.id);

            // Ensure all blocks have valid types
            const validatedContent = item.content.map(block => {
                // If block has media_type but type is 'media', convert to 'image'
                if (block.type === 'media') {
                    return { ...block, type: 'image' };
                }
                // If block is 'image' without media_type, add it
                if (block.type === 'image' && !block.media_type) {
                    return { ...block, media_type: 'image' };
                }
                return block;
            });

            const res = await fetch(`/api/uplifts/${id}/items`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: item.id,
                    content: validatedContent
                })
            });

            if (!res.ok) {
                let errorMessage = `Server error: ${res.status}`;
                try {
                    const errorData = await res.json();
                    errorMessage = errorData.message || errorMessage;
                } catch (e) {
                    try {
                        const text = await res.text();
                        if (text) errorMessage = text;
                    } catch (e2) {}
                }
                throw new Error(errorMessage);
            }

            const result = await res.json();

            if (!result.success) {
                throw new Error(result.message || 'Save failed');
            }

            if (result.data && result.data.id !== item.id) {
                setItems(prev => prev.map(i =>
                    i.id === item.id ? result.data : i
                ));

                setExpandedItems(prev => {
                    const newState = { ...prev };
                    delete newState[item.id];
                    newState[result.data.id] = true;
                    return newState;
                });

                setSavedStates(prev => ({ ...prev, [result.data.id]: true }));
                setTimeout(() => {
                    setSavedStates(prev => ({ ...prev, [result.data.id]: false }));
                }, 2000);
            } else {
                setSavedStates(prev => ({ ...prev, [item.id]: true }));
                setTimeout(() => {
                    setSavedStates(prev => ({ ...prev, [item.id]: false }));
                }, 2000);
            }

            showModal('success', 'Saved!', 'Section saved successfully.');

        } catch (err) {
            console.error('Save error:', err);
            showModal('error', 'Save Failed', err.message);
        } finally {
            setSavingId(null);
        }
    };

    // Delete entire item
    const deleteItem = async (itemId) => {
        showModal(
            'confirm',
            'Delete Section',
            'Are you sure you want to delete this section? This action cannot be undone.',
            () => deleteItemFromDB(itemId),
            'Yes, Delete',
            'Cancel'
        );
    };

    const deleteItemFromDB = async (itemId) => {
        try {
            const res = await fetch(`/api/uplifts/${id}/items`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: itemId })
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'Delete failed');
            }

            setItems(prev => prev.filter(i => i.id !== itemId));
            showModal('success', 'Deleted!', 'Section deleted successfully.');
        } catch (err) {
            showModal('error', 'Delete Failed', err.message);
        }
    };

    // Duplicate item
    const duplicateItem = async (item) => {
        try {
            const res = await fetch(`/api/uplifts/${id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: item.content })
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'Duplicate failed');
            }

            setItems(prev => [...prev, result.data]);
            setExpandedItems(prev => ({ ...prev, [result.data.id]: true }));
            showModal('success', 'Duplicated!', 'Section duplicated successfully.');
        } catch (err) {
            showModal('error', 'Duplicate Failed', err.message);
        }
    };

    // Move block
    const moveBlock = (itemIndex, blockIndex, direction) => {
        const copy = [...items];
        const newIndex = blockIndex + direction;
        if (newIndex < 0 || newIndex >= copy[itemIndex].content.length) return;

        const [block] = copy[itemIndex].content.splice(blockIndex, 1);
        copy[itemIndex].content.splice(newIndex, 0, block);
        setItems(copy);
        setSavedStates(prev => ({ ...prev, [items[itemIndex].id]: false }));
    };

    // Copy URL to clipboard
    const copyUrl = async (url) => {
        try {
            await navigator.clipboard.writeText(url);
            showModal('success', 'Copied!', 'URL copied to clipboard.');
        } catch (err) {
            showModal('error', 'Copy Failed', 'Failed to copy URL to clipboard.');
        }
    };

    // Count blocks by type
    const countBlocks = (content, type) => {
        return content.filter(b => b.type === type).length;
    };

    const countMediaBlocks = (content, mediaType) => {
        return content.filter(b => b.type === 'image' && b.media_type === mediaType).length;
    };

    // Add new section
    const addNewSection = async () => {
        try {
            const newItem = {
                content: [{ type: 'text', value: '' }]
            };

            const res = await fetch(`/api/uplifts/${id}/items`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });

            const result = await res.json();

            if (!res.ok || !result.success) {
                throw new Error(result.message || 'Failed to create section');
            }

            setItems(prev => [...prev, result.data]);
            setExpandedItems(prev => ({ ...prev, [result.data.id]: true }));

            setTimeout(() => {
                window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
            }, 100);

            showModal('success', 'Created!', 'New section added successfully.');
        } catch (err) {
            showModal('error', 'Create Failed', err.message);
        }
    };

    // Handle drag and drop for media
    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e, itemIndex, blockIndex, mediaType = 'image') => {
        e.preventDefault();
        e.stopPropagation();

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const isValidImage = file.type.startsWith('image/');
            const isValidVideo = file.type.startsWith('video/');
            
            if (mediaType === 'image' && isValidImage) {
                handleFileUpload(itemIndex, blockIndex, file, 'image');
            } else if (mediaType === 'video' && isValidVideo) {
                handleFileUpload(itemIndex, blockIndex, file, 'video');
            } else {
                showModal('error', 'Invalid File', `Please drop a valid ${mediaType} file.`);
            }
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <FiLoader className="text-gray-800 text-xl animate-pulse" />
                    </div>
                </div>
                <p className="mt-4 text-gray-600 font-medium">Loading editor...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
                        <FiAlertCircle className="text-red-500 text-3xl" />
                    </div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load editor</h2>
                    <p className="text-gray-500 mb-6">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* MODAL */}
            {modal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in duration-200">
                        <div className={`px-6 py-4 border-b ${modal.type === 'success' ? 'border-emerald-100 bg-emerald-50' :
                            modal.type === 'error' ? 'border-red-100 bg-red-50' :
                                modal.type === 'warning' ? 'border-yellow-100 bg-yellow-50' :
                                    modal.type === 'confirm' ? 'border-blue-100 bg-blue-50' :
                                        'border-gray-100 bg-gray-50'
                            }`}>
                            <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${modal.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                                    modal.type === 'error' ? 'bg-red-100 text-red-600' :
                                        modal.type === 'warning' ? 'bg-yellow-100 text-yellow-600' :
                                            modal.type === 'confirm' ? 'bg-blue-100 text-blue-600' :
                                                'bg-gray-100 text-gray-600'
                                    }`}>
                                    {modal.type === 'success' && <FiCheckCircle size={20} />}
                                    {modal.type === 'error' && <FiAlertCircle size={20} />}
                                    {modal.type === 'warning' && <FiAlertCircle size={20} />}
                                    {modal.type === 'confirm' && <FiAlertCircle size={20} />}
                                    {modal.type === 'info' && <FiInfo size={20} />}
                                </div>
                                <div>
                                    <h3 className="font-semibold text-gray-900">{modal.title}</h3>
                                    {modal.type !== 'confirm' && (
                                        <p className="text-sm text-gray-500">{modal.message}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {modal.type === 'confirm' && (
                            <div className="px-6 py-4">
                                <p className="text-gray-600">{modal.message}</p>
                            </div>
                        )}

                        <div className="px-6 py-4 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
                            {modal.type === 'confirm' && (
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    {modal.cancelText}
                                </button>
                            )}
                            <button
                                onClick={modal.type === 'confirm' ? handleModalConfirm : closeModal}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${modal.type === 'success' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' :
                                    modal.type === 'error' ? 'bg-red-600 hover:bg-red-700 text-white' :
                                        modal.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700 text-white' :
                                            modal.type === 'confirm' ? 'bg-blue-600 hover:bg-blue-700 text-white' :
                                                'bg-gray-900 hover:bg-gray-800 text-white'
                                    }`}
                            >
                                {modal.type === 'confirm' ? modal.confirmText : 'OK'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* HEADER */}
            <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6">
                    <div className="flex items-center justify-between h-16">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors group"
                        >
                            <FiArrowLeft className="group-hover:-translate-x-0.5 transition-transform" size={18} />
                            <span className="text-sm font-medium hidden sm:inline">Back</span>
                        </button>

                        <div className="flex-1 text-center px-4">
                            <h1 className="text-sm font-semibold text-gray-900">Content Editor</h1>
                            <p className="text-xs text-gray-500 truncate">{uplift?.title}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="flex bg-gray-100 rounded-lg p-0.5">
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
                                onClick={() => setPreviewMode(!previewMode)}
                                className={`p-2 rounded-lg transition-all duration-200 ${previewMode
                                    ? 'bg-indigo-50 text-indigo-600'
                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                    }`}
                                title={previewMode ? 'Edit Mode' : 'Preview Mode'}
                            >
                                {previewMode ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                            </button>

                            <button
                                onClick={() => window.location.reload()}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <FiRefreshCw size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* STATS BAR */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{items.length}</div>
                            <div className="text-xs text-gray-500 mt-0.5">Total Sections</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {items.reduce((acc, item) => acc + countBlocks(item.content, 'text'), 0)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Text Blocks</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {items.reduce((acc, item) => acc + countMediaBlocks(item.content, 'image'), 0)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Images</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {items.reduce((acc, item) => acc + countMediaBlocks(item.content, 'video'), 0)}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Videos</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">
                                {items.filter(item => savedStates[item.id] === true).length}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">Saved Sections</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                {items.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4">
                            <FiFileText className="text-3xl text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No sections yet</h3>
                        <p className="text-gray-500 mb-6">Start adding content blocks to build your initiative.</p>
                        <button
                            onClick={addNewSection}
                            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                        >
                            <FiPlus size={18} />
                            Add First Section
                        </button>
                    </div>
                ) : (
                    <div className={viewMode === 'grid' ? 'grid grid-cols-1 lg:grid-cols-2 gap-6' : 'space-y-6'}>
                        {items.map((item, itemIndex) => {
                            const isExpanded = expandedItems[item.id] || false;
                            const isSaving = savingId === item.id;
                            const isSaved = savedStates[item.id];
                            const textCount = countBlocks(item.content, 'text');
                            const imageCount = countMediaBlocks(item.content, 'image');
                            const videoCount = countMediaBlocks(item.content, 'video');

                            return (
                                <div
                                    key={item.id}
                                    className={`bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300 ${previewMode ? 'opacity-75' : ''
                                        }`}
                                >
                                    {/* Item Header */}
                                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-2">
                                                    <FiCheckCircle className="text-gray-400" size={16} />
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        Section {itemIndex + 1}
                                                    </span>
                                                </div>
                                                {isSaved && (
                                                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                        <FiCheck size={12} />
                                                        Saved
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => toggleExpand(item.id)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                                >
                                                    {isExpanded ? <FiChevronUp size={16} /> : <FiChevronDown size={16} />}
                                                </button>
                                                <button
                                                    onClick={() => duplicateItem(item)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <FiCopy size={15} />
                                                </button>
                                                <button
                                                    onClick={() => deleteItem(item.id)}
                                                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <FiTrash2 size={15} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <FiMessageCircle size={12} />
                                                {textCount} text blocks
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiImageIcon size={12} />
                                                {imageCount} images
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiVideo size={12} />
                                                {videoCount} videos
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <FiClock size={12} />
                                                {new Date(item.created_at).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={() => saveItem(item)}
                                                disabled={isSaving}
                                                className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <FiLoader className="animate-spin" size={12} />
                                                        Saving...
                                                    </>
                                                ) : (
                                                    <>
                                                        <FiSave size={12} />
                                                        Save
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Item Content */}
                                    {isExpanded && (
                                        <div className="p-6 space-y-4">
                                            {item.content.map((block, blockIndex) => {
                                                const uploadKey = `${item.id}-${blockIndex}`;
                                                const isUploading = uploadingId === uploadKey;
                                                const isDeleting = deletingId === uploadKey;
                                                const progress = uploadProgress[uploadKey] || 0;
                                                const isLocalUpload = block.url && block.url.startsWith('/uploads/');
                                                const isVideo = block.media_type === 'video';
                                                const isImage = block.type === 'image' && !isVideo;
                                                const videoId = `video-${item.id}-${blockIndex}`;
                                                const isPlaying = videoStates[videoId] || false;

                                                if (block.type === 'text') {
                                                    return (
                                                        <div
                                                            key={blockIndex}
                                                            className="border rounded-xl p-4 bg-gray-50/50 hover:border-gray-300 transition-colors group relative"
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-200 text-gray-700">
                                                                    Text Block
                                                                </span>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {blockIndex > 0 && (
                                                                        <button
                                                                            onClick={() => moveBlock(itemIndex, blockIndex, -1)}
                                                                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                                                        >
                                                                            ↑
                                                                        </button>
                                                                    )}
                                                                    {blockIndex < item.content.length - 1 && (
                                                                        <button
                                                                            onClick={() => moveBlock(itemIndex, blockIndex, 1)}
                                                                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                                                        >
                                                                            ↓
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => removeBlock(itemIndex, blockIndex)}
                                                                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                                    >
                                                                        <FiX size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <textarea
                                                                className="w-full border-0 bg-transparent rounded-lg p-0 text-sm text-gray-700 focus:ring-0 resize-y min-h-[80px] placeholder-gray-400"
                                                                value={block.value || ''}
                                                                onChange={(e) =>
                                                                    updateText(itemIndex, blockIndex, e.target.value)
                                                                }
                                                                placeholder="Write your content here..."
                                                                disabled={previewMode}
                                                            />
                                                        </div>
                                                    );
                                                }

                                                if (block.type === 'image') {
                                                    const mediaIcon = isVideo ? <FiVideo size={16} /> : <FiImageIcon size={16} />;
                                                    const mediaLabel = isVideo ? 'Video' : 'Image';
                                                    const mediaLabelLower = isVideo ? 'video' : 'image';
                                                    const acceptTypes = isVideo ? 'video/*' : 'image/*';
                                                    const validTypes = isVideo 
                                                        ? ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
                                                        : ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

                                                    return (
                                                        <div
                                                            key={blockIndex}
                                                            className={`border rounded-xl p-4 bg-gray-50 hover:border-gray-300 transition-colors group relative ${isDeleting ? 'opacity-50' : ''}`}
                                                            onDragOver={handleDragOver}
                                                            onDrop={(e) => handleDrop(e, itemIndex, blockIndex, isVideo ? 'video' : 'image')}
                                                        >
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${isVideo ? 'bg-purple-100 text-purple-700' : 'bg-indigo-100 text-indigo-700'}`}>
                                                                    {mediaIcon} {mediaLabel} Block
                                                                    {isLocalUpload && block.url && (
                                                                        <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                                                                            Uploaded
                                                                        </span>
                                                                    )}
                                                                </span>
                                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {isDeleting && (
                                                                        <span className="text-xs text-gray-400 mr-2">Deleting...</span>
                                                                    )}
                                                                    {blockIndex > 0 && (
                                                                        <button
                                                                            onClick={() => moveBlock(itemIndex, blockIndex, -1)}
                                                                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                                                            disabled={isDeleting}
                                                                        >
                                                                            ↑
                                                                        </button>
                                                                    )}
                                                                    {blockIndex < item.content.length - 1 && (
                                                                        <button
                                                                            onClick={() => moveBlock(itemIndex, blockIndex, 1)}
                                                                            className="p-1 text-gray-400 hover:text-gray-600 rounded"
                                                                            disabled={isDeleting}
                                                                        >
                                                                            ↓
                                                                        </button>
                                                                    )}
                                                                    <button
                                                                        onClick={() => removeBlock(itemIndex, blockIndex)}
                                                                        className="p-1 text-gray-400 hover:text-red-600 rounded"
                                                                        disabled={isDeleting || isUploading}
                                                                    >
                                                                        <FiX size={14} />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="space-y-3">
                                                                <div className="flex flex-col sm:flex-row gap-2">
                                                                    <input
                                                                        className="flex-1 border rounded-lg p-2 text-sm bg-white focus:ring-2 focus:ring-gray-200 focus:border-gray-400 outline-none transition"
                                                                        value={block.url || ''}
                                                                        onChange={(e) =>
                                                                            updateMedia(itemIndex, blockIndex, e.target.value, isVideo ? 'video' : 'image')
                                                                        }
                                                                        placeholder={`${mediaLabel} URL (or upload below)`}
                                                                        disabled={previewMode || isUploading || isDeleting}
                                                                    />
                                                                    {block.url && !isUploading && !isDeleting && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => copyUrl(block.url)}
                                                                                className="p-2 text-gray-400 hover:text-gray-600 border rounded-lg hover:bg-gray-50 transition"
                                                                                title="Copy URL"
                                                                            >
                                                                                <FiLink size={16} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => deleteMediaBlock(itemIndex, blockIndex)}
                                                                                className={`p-2 border rounded-lg transition ${isLocalUpload
                                                                                    ? 'text-red-400 hover:text-red-600 hover:bg-red-50'
                                                                                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                                                                                    }`}
                                                                                title={isLocalUpload ? `Delete ${mediaLabel}` : `Remove ${mediaLabel}`}
                                                                            >
                                                                                <FiTrash2 size={16} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <input
                                                                        ref={(el) => {
                                                                            fileInputRefs.current[`${itemIndex}-${blockIndex}`] = el;
                                                                        }}
                                                                        type="file"
                                                                        accept={acceptTypes}
                                                                        className="hidden"
                                                                        onChange={(e) => {
                                                                            const file = e.target.files?.[0];
                                                                            if (file) {
                                                                                // Additional validation
                                                                                if (isVideo && !validTypes.includes(file.type)) {
                                                                                    showModal('error', 'Invalid Format', 'Please upload a valid video file (MP4, WebM, OGG, MOV).');
                                                                                    e.target.value = '';
                                                                                    return;
                                                                                }
                                                                                if (!isVideo && !validTypes.includes(file.type)) {
                                                                                    showModal('error', 'Invalid Format', 'Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG).');
                                                                                    e.target.value = '';
                                                                                    return;
                                                                                }
                                                                                handleFileUpload(itemIndex, blockIndex, file, isVideo ? 'video' : 'image');
                                                                            }
                                                                        }}
                                                                        disabled={isUploading || previewMode || isDeleting}
                                                                    />
                                                                    <button
                                                                        onClick={() => {
                                                                            fileInputRefs.current[`${itemIndex}-${blockIndex}`]?.click();
                                                                        }}
                                                                        disabled={isUploading || previewMode || isDeleting}
                                                                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                                                                    >
                                                                        <FiUpload size={14} />
                                                                        {isUploading ? 'Uploading...' : `Upload ${mediaLabel}`}
                                                                    </button>

                                                                    <span className="text-xs text-gray-400">or</span>

                                                                    <button
                                                                        onClick={() => {
                                                                            const url = prompt(`Enter ${mediaLabel.toLowerCase()} URL:`);
                                                                            if (url) {
                                                                                updateMedia(itemIndex, blockIndex, url, isVideo ? 'video' : 'image');
                                                                            }
                                                                        }}
                                                                        disabled={isUploading || previewMode || isDeleting}
                                                                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                                                                    >
                                                                        <FiLink size={14} />
                                                                        Paste URL
                                                                    </button>
                                                                </div>

                                                                {isUploading && (
                                                                    <div className="w-full">
                                                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                                                            <div
                                                                                className={`h-2 rounded-full transition-all duration-300 ${isVideo ? 'bg-purple-600' : 'bg-indigo-600'}`}
                                                                                style={{ width: `${progress}%` }}
                                                                            />
                                                                        </div>
                                                                        <p className="text-xs text-gray-500 mt-1">
                                                                            Uploading {mediaLabel.toLowerCase()}... {progress}%
                                                                        </p>
                                                                    </div>
                                                                )}

                                                                {block.url && !isUploading && !isDeleting && (
                                                                    <div className="relative rounded-lg overflow-hidden bg-white border group/media">
                                                                        {isVideo ? (
                                                                            <div className="relative">
                                                                                <video
                                                                                    ref={(el) => {
                                                                                        videoRefs.current[videoId] = el;
                                                                                    }}
                                                                                    src={block.url}
                                                                                    controls
                                                                                    autoPlay
                                                                                    muted
                                                                                    playsInline
                                                                                    loop
                                                                                    className="w-full h-auto max-h-[400px] rounded-lg"
                                                                                    controlsList="nodownload"
                                                                                    onPlay={() => setVideoStates(prev => ({ ...prev, [videoId]: true }))}
                                                                                    onPause={() => setVideoStates(prev => ({ ...prev, [videoId]: false }))}
                                                                                >
                                                                                    Your browser does not support the video tag.
                                                                                </video>
                                                                                <div className="absolute top-2 right-2 opacity-0 group-hover/media:opacity-100 transition-opacity flex gap-1">
                                                                                    <button
                                                                                        onClick={(e) => {
                                                                                            e.stopPropagation();
                                                                                            toggleVideoPlayback(videoId);
                                                                                        }}
                                                                                        className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition"
                                                                                        title={isPlaying ? 'Pause' : 'Play'}
                                                                                    >
                                                                                        {isPlaying ? <FiPause size={14} /> : <FiPlay size={14} />}
                                                                                    </button>
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            if (block.url) {
                                                                                                window.open(block.url, '_blank');
                                                                                            }
                                                                                        }}
                                                                                        className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition"
                                                                                        title="Open in new tab"
                                                                                    >
                                                                                        <FiLink size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        ) : (
                                                                            <div className="relative h-48 w-full">
                                                                                <Image
                                                                                    src={block.url}
                                                                                    alt={`${mediaLabel} ${blockIndex + 1}`}
                                                                                    fill
                                                                                    className="object-contain"
                                                                                    sizes="(max-width: 768px) 100vw, 800px"
                                                                                    onError={(e) => {
                                                                                        e.target.style.display = 'none';
                                                                                        const parent = e.target.parentElement;
                                                                                        const errorMsg = document.createElement('div');
                                                                                        errorMsg.className = 'absolute inset-0 flex items-center justify-center text-gray-400 text-sm';
                                                                                        errorMsg.textContent = 'Failed to load image';
                                                                                        parent.appendChild(errorMsg);
                                                                                    }}
                                                                                />
                                                                                <div className="absolute top-2 right-2 opacity-0 group-hover/media:opacity-100 transition-opacity">
                                                                                    <button
                                                                                        onClick={() => {
                                                                                            if (block.url) {
                                                                                                window.open(block.url, '_blank');
                                                                                            }
                                                                                        }}
                                                                                        className="p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-lg transition"
                                                                                        title="Open in new tab"
                                                                                    >
                                                                                        <FiLink size={14} />
                                                                                    </button>
                                                                                </div>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return null;
                                            })}

                                            <div className="flex gap-2 pt-2 flex-wrap">
                                                <button
                                                    onClick={() => addTextBlock(itemIndex)}
                                                    className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <FiPlus size={14} />
                                                    Add Text
                                                </button>
                                                <button
                                                    onClick={() => addMediaBlock(itemIndex, 'image')}
                                                    className="px-4 py-2 text-sm bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <FiPlus size={14} />
                                                    <FiImageIcon size={14} />
                                                    Add Image
                                                </button>
                                                <button
                                                    onClick={() => addMediaBlock(itemIndex, 'video')}
                                                    className="px-4 py-2 text-sm bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg transition-colors flex items-center gap-2"
                                                >
                                                    <FiPlus size={14} />
                                                    <FiVideo size={14} />
                                                    Add Video
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* FLOATING ACTIONS */}
            {items.length > 0 && (
                <div className="fixed bottom-8 right-8 z-30 flex flex-col gap-2">
                    <button
                        onClick={addNewSection}
                        className="p-4 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                    >
                        <FiPlus size={20} />
                        <span className="font-medium hidden sm:inline">Add Section</span>
                    </button>
                </div>
            )}

            {/* FOOTER */}
            <div className="border-t border-gray-100 bg-white mt-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>ID: {id}</span>
                        <span>{items.length} sections • {items.reduce((acc, item) => acc + item.content.length, 0)} total blocks</span>
                        <span className="flex items-center gap-1">
                            <FiInfo size={12} />
                            Click Save to save changes
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}